import { useState } from "react";
import { Link } from "react-router";
import { useAuthStore } from "../store/authStore.ts";
import { SignInSheet } from "./SignInSheet.tsx";

// Spec 8.1: account (sign in or out) and the privacy note. The default level and
// the unsynced sign-out warning arrive with CHI-089 and CHI-087.
export function Settings() {
  const { status, email, signOut } = useAuthStore();
  const [signingIn, setSigningIn] = useState(false);

  return (
    <section className="flex flex-col gap-4 p-4">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Settings</h1>
        <Link to="/" className="inline-flex min-h-11 min-w-11 items-center text-blue-700 underline">
          Home
        </Link>
      </header>

      <section
        aria-labelledby="account"
        className="flex flex-col gap-2 rounded-2xl bg-white p-4 ring-1 ring-stone-200"
      >
        <h2 id="account" className="font-semibold">
          Account
        </h2>
        {status === "signedIn" ? (
          <>
            <p>
              Signed in as <strong>{email}</strong>
            </p>
            <button
              type="button"
              onClick={() => void signOut()}
              className="min-h-12 rounded-xl bg-stone-200 font-semibold"
            >
              Sign out
            </button>
          </>
        ) : status === "unavailable" ? (
          <p className="text-stone-600">
            Sign-in isn&apos;t available in this build. You can still play as a guest.
          </p>
        ) : (
          <>
            <p className="text-stone-600">
              You&apos;re playing as a guest. Sign in to keep your progress safe and use it on other
              devices.
            </p>
            <button
              type="button"
              disabled={status === "loading"}
              onClick={() => setSigningIn(true)}
              className="min-h-12 rounded-xl bg-stone-900 font-semibold text-white"
            >
              Sign in
            </button>
          </>
        )}
      </section>

      <Link
        to="/privacy"
        className="flex min-h-11 items-center rounded-lg bg-white px-4 shadow-sm ring-1 ring-stone-200"
      >
        Privacy
      </Link>
      <SignInSheet open={signingIn} onClose={() => setSigningIn(false)} />
    </section>
  );
}
