// Spec 7.3: what happens to local data when the account changes. Signing in
// switches to that user's local copy and outbox and syncs; signing out goes back
// to guest data.
import { useSyncStore } from "../services/sync.ts";
import { useAuthStore } from "./authStore.ts";
import { useProgressStore } from "./progressStore.ts";

export async function onAccountChange(userId: string | null) {
  await useProgressStore.getState().switchOwner(userId ?? "guest");
  await useSyncStore.getState().load(userId);
  if (userId) await useSyncStore.getState().flush();
}

export function startAccountSync() {
  let current: string | null | undefined;
  const follow = (userId: string | null, status: string) => {
    if (status === "loading" || userId === current) return;
    current = userId;
    void onAccountChange(userId);
  };
  useAuthStore.subscribe((s) => follow(s.userId, s.status));
  follow(useAuthStore.getState().userId, useAuthStore.getState().status);

  // Spec 7.3: flush on app start (above), on each round end (game store), and when
  // the connection comes back.
  if (typeof window !== "undefined") {
    window.addEventListener("online", () => void useSyncStore.getState().flush());
  }
}
