import { Link } from "react-router";

const links = [
  { to: "/play", label: "Play" },
  { to: "/progress", label: "Progress" },
  { to: "/settings", label: "Settings" },
];

export function Home() {
  return (
    <section className="flex flex-col gap-6 p-4">
      <h1 className="text-4xl font-bold">Chi è?</h1>
      <nav className="flex flex-col gap-3">
        {links.map(({ to, label }) => (
          <Link
            key={to}
            to={to}
            className="flex min-h-11 items-center rounded-lg bg-white px-4 shadow-sm ring-1 ring-stone-200"
          >
            {label}
          </Link>
        ))}
      </nav>
    </section>
  );
}
