// The Workers Builds build command: picks the Supabase and Sentry env for this branch,
// then runs the normal build with it. See scripts/cloudflare-env.ts.
import { spawnSync } from "node:child_process";
import { productionBranch, sentryEnvFor, supabaseEnvFor } from "./cloudflare-env.ts";

const branch = process.env.WORKERS_CI_BRANCH;
const env = { ...supabaseEnvFor(branch, process.env), ...sentryEnvFor(branch, process.env) };

console.log(
  `Building ${branch} with ${branch === productionBranch ? "production" : "staging"} Supabase: ${env.VITE_SUPABASE_URL}`,
);
if (!env.VITE_SENTRY_DSN) console.warn("SENTRY_DSN is not set; error reporting is off");

const result = spawnSync("pnpm", ["build"], {
  stdio: "inherit",
  env: { ...process.env, ...env },
});
process.exit(result.status ?? 1);
