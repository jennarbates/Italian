import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { requestSignOut, signOutNow } from "../store/account.ts";
import { useAuthStore } from "../store/authStore.ts";
import { SignInSheet } from "./SignInSheet.tsx";

// Spec 8.1: account (sign in or out) and the privacy note. The default level and
// the unsynced sign-out warning arrive with CHI-089 and CHI-087.
export function Settings() {
  const { status, email } = useAuthStore();
  const [signingIn, setSigningIn] = useState(false);
  const [busy, setBusy] = useState(false);
  const [unsynced, setUnsynced] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (unsynced && !d.open) d.showModal();
    if (!unsynced && d.open) d.close();
  }, [unsynced]);

  const signOut = async () => {
    setBusy(true);
    const result = await requestSignOut();
    setBusy(false);
    if (result === "unsynced") setUnsynced(true);
  };

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
              disabled={busy}
              onClick={() => void signOut()}
              className="min-h-12 rounded-xl bg-stone-200 font-semibold"
            >
              {busy ? "Syncing…" : "Sign out"}
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
      <dialog
        ref={dialog}
        onClose={() => setUnsynced(false)}
        aria-labelledby="unsynced-title"
        className="m-auto w-[min(90vw,22rem)] rounded-2xl p-5 backdrop:bg-black/50"
      >
        <h2 id="unsynced-title" className="text-lg font-semibold">
          Some progress hasn&apos;t synced yet. Sign out anyway?
        </h2>
        <p className="mt-2 text-sm text-stone-600">
          Signing out removes your progress from this device. Anything not yet synced will be lost.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <button
            type="button"
            autoFocus
            onClick={() => setUnsynced(false)}
            className="min-h-12 rounded-xl bg-stone-200 font-semibold"
          >
            Wait
          </button>
          <button
            type="button"
            onClick={() => {
              setUnsynced(false);
              void signOutNow();
            }}
            className="min-h-12 rounded-xl bg-rose-700 font-semibold text-white"
          >
            Sign out
          </button>
        </div>
      </dialog>
    </section>
  );
}
