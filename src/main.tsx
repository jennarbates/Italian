import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router";
import "./index.css";
import { router } from "./routes.tsx";
import { useAuthStore } from "./store/authStore.ts";
import { useGameStore } from "./store/gameStore.ts";
import { useProgressStore } from "./store/progressStore.ts";

// Load saved progress and resume a saved round, if any, while the first screen renders.
void useAuthStore.getState().init();
void useProgressStore.getState().hydrate();
void useGameStore.getState().hydrate();

const root = document.getElementById("root");
if (!root) throw new Error("Missing #root element");

createRoot(root).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
