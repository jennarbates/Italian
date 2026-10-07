import { reactErrorHandler } from "@sentry/react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router";
import "./index.css";
import { router } from "./routes.tsx";
import { initErrors } from "./services/errors.ts";

// Before anything renders, so startup errors are caught too.
const reporting = initErrors();

const root = document.getElementById("root");
if (!root) throw new Error("Missing #root element");

// Without Sentry, React's own handlers keep logging to the console.
createRoot(
  root,
  reporting
    ? {
        onUncaughtError: reactErrorHandler(),
        onCaughtError: reactErrorHandler(),
        onRecoverableError: reactErrorHandler(),
      }
    : {},
).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
