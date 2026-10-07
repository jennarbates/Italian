/// <reference types="vitest/config" />
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { contentCheck } from "./scripts/content-check.ts";

export default defineConfig({
  plugins: [react(), tailwindcss(), contentCheck()],
  test: {
    include: ["src/**/*.test.{ts,tsx}", "scripts/**/*.test.ts"],
    environment: "node",
    coverage: {
      provider: "v8",
      // Spec 10.3 targets 90% on engine/; the threshold goes on with the first engine card.
      include: ["src/engine/**/*.ts"],
      exclude: ["src/engine/**/*.test.ts"],
      reporter: ["text", "html", "lcov"],
    },
  },
});
