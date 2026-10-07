/// <reference types="vitest/config" />
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { sentryEnvFor, supabaseEnvFor } from "./scripts/cloudflare-env.ts";
import { contentCheck } from "./scripts/content-check.ts";

// Workers Builds runs the dashboard's build command for main but its own `pnpm run
// build` for previews, so the branch's Supabase and Sentry env is chosen here, where
// every build passes. Outside Workers Builds (local, CI) nothing changes.
if (process.env.WORKERS_CI) {
  const branch = process.env.WORKERS_CI_BRANCH;
  const env = { ...supabaseEnvFor(branch, process.env), ...sentryEnvFor(branch, process.env) };
  Object.assign(process.env, env);
  console.log(`Building ${branch} with Supabase ${env.VITE_SUPABASE_URL}`);
}

export default defineConfig({
  plugins: [react(), tailwindcss(), contentCheck()],
  test: {
    include: ["src/**/*.test.{ts,tsx}", "scripts/**/*.test.ts"],
    environment: "node",
    coverage: {
      provider: "v8",
      // Spec 10.3: engine/ line coverage at or above 90%, or the test run fails.
      include: ["src/engine/**/*.ts"],
      thresholds: { lines: 90 },
      exclude: ["src/engine/**/*.test.ts"],
      reporter: ["text", "html", "lcov"],
    },
  },
});
