import { Outlet } from "react-router";

// Screens add their own padding; the game uses the full height of the phone.
export function Layout() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col bg-stone-50 text-stone-900">
      <Outlet />
    </main>
  );
}
