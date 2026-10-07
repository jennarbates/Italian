// Spec 7.3: the email carries a 6-digit code and a sign-in link. signInWithOtp
// sends it, verifyOtp (type "email") checks the code, and the client picks up the
// session when the link opens the app. Guests never touch Supabase.
import { create } from "zustand";
import { supabase } from "../services/supabase.ts";

export type AuthStatus = "loading" | "guest" | "signedIn" | "unavailable";

export type SendResult =
  | { ok: true }
  | { ok: false; error: "rate"; retryInSeconds: number }
  | { ok: false; error: "send" };
export type VerifyResult = { ok: true } | { ok: false; error: "code" | "network" };

type AuthStore = {
  status: AuthStatus;
  userId: string | null;
  email: string | null;
  init: () => Promise<void>;
  sendCode: (email: string) => Promise<SendResult>;
  verifyCode: (email: string, code: string) => Promise<VerifyResult>;
  signOut: () => Promise<void>;
};

export const useAuthStore = create<AuthStore>((set) => ({
  status: "loading",
  userId: null,
  email: null,

  async init() {
    if (!supabase) {
      set({ status: "unavailable" });
      return;
    }
    const apply = (session: { user: { id: string; email?: string | undefined } } | null) =>
      set(
        session
          ? { status: "signedIn", userId: session.user.id, email: session.user.email ?? null }
          : { status: "guest", userId: null, email: null },
      );
    supabase.auth.onAuthStateChange((_event, session) => apply(session));
    const { data } = await supabase.auth.getSession();
    apply(data.session);
  },

  async sendCode(email) {
    if (!supabase) return { ok: false, error: "send" };
    const { error } = await supabase.auth.signInWithOtp({
      email,
      // The link comes back to this deploy, so a preview never signs in on production.
      options: { shouldCreateUser: true, emailRedirectTo: window.location.origin },
    });
    if (!error) return { ok: true };
    if (error.status === 429) {
      const seconds = Number(/(\d+)\s*seconds?/.exec(error.message)?.[1] ?? 60);
      return { ok: false, error: "rate", retryInSeconds: seconds };
    }
    return { ok: false, error: "send" };
  },

  async verifyCode(email, code) {
    if (!supabase) return { ok: false, error: "network" };
    const { error } = await supabase.auth.verifyOtp({ email, token: code, type: "email" });
    if (!error) return { ok: true };
    // 4xx is the code (wrong or expired); anything else is the connection.
    return { ok: false, error: error.status && error.status < 500 ? "code" : "network" };
  },

  async signOut() {
    await supabase?.auth.signOut();
  },
}));
