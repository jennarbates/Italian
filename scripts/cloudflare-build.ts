// The Workers Builds build command: picks the Supabase env for this branch, then runs
// the normal build with it. See scripts/cloudflare-env.ts.
import { spawnSync } from "node:child_process";
import { productionBranch, supabaseEnvFor } from "./cloudflare-env.ts";

const branch = process.env.WORKERS_CI_BRANCH;
const env = supabaseEnvFor(branch, process.env);

console.log(
  `Building ${branch} with ${branch === productionBranch ? "production" : "staging"} Supabase: ${env.VITE_SUPABASE_URL}`,
);

const result = spawnSync("pnpm", ["build"], {
  stdio: "inherit",
  env: { ...process.env, ...env },
});
process.exit(result.status ?? 1);
