/// <reference types="vitest/config" />
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    include: ["src/**/*.test.{ts,tsx}"],
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
