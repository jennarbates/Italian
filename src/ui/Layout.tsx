import { Outlet } from "react-router";

export function Layout() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col bg-stone-50 p-4 text-stone-900">
      <Outlet />
    </main>
  );
}
