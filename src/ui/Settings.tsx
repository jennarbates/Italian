import { Link } from "react-router";

// Spec 8.1. Default level and the account controls come with sign-in (CHI-089).
export function Settings() {
  return (
    <section className="flex flex-col gap-4 p-4">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Settings</h1>
        <Link to="/" className="inline-flex min-h-11 min-w-11 items-center text-blue-700 underline">
          Home
        </Link>
      </header>
      <p className="text-stone-600">Sign-in and your default level are coming soon.</p>
      <Link
        to="/privacy"
        className="flex min-h-11 items-center rounded-lg bg-white px-4 shadow-sm ring-1 ring-stone-200"
      >
        Privacy
      </Link>
    </section>
  );
}
