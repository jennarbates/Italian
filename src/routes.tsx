import { createBrowserRouter } from "react-router";
import { Game } from "./ui/Game.tsx";
import { Home } from "./ui/Home.tsx";
import { Layout } from "./ui/Layout.tsx";
import { Privacy } from "./ui/Privacy.tsx";
import { Progress } from "./ui/Progress.tsx";
import { Settings } from "./ui/Settings.tsx";

// Routes from spec 8.1. Sign-in is a sheet, not a route.
export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/play", element: <Game /> },
      { path: "/progress", element: <Progress /> },
      { path: "/settings", element: <Settings /> },
      { path: "/privacy", element: <Privacy /> },
    ],
  },
]);
