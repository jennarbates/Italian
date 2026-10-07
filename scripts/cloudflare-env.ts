// Spec 9, D16: previews build with the staging Supabase project, main builds with
// production. Workers Builds has one set of build variables for every branch, so
// both sets live there and the branch picks which one becomes the app's env.

export const productionBranch = "main";

export type SupabaseEnv = {
  VITE_SUPABASE_URL: string;
  VITE_SUPABASE_PUBLISHABLE_KEY: string;
};

type Vars = Record<string, string | undefined>;

export function supabaseEnvFor(branch: string | undefined, vars: Vars): SupabaseEnv {
  if (!branch) throw new Error("WORKERS_CI_BRANCH is not set; is this running in Workers Builds?");

  const prefix = branch === productionBranch ? "PRODUCTION" : "STAGING";
  const url = required(vars, `${prefix}_SUPABASE_URL`);
  const key = required(vars, `${prefix}_SUPABASE_PUBLISHABLE_KEY`);

  // A preview must never reach production data (spec 10.3).
  if (prefix === "STAGING" && url === vars.PRODUCTION_SUPABASE_URL) {
    throw new Error("STAGING_SUPABASE_URL is the production URL");
  }
  // Only the public key may reach the app (spec 7).
  if (isSecretKey(key)) {
    throw new Error(`${prefix}_SUPABASE_PUBLISHABLE_KEY is a secret or service role key`);
  }

  return { VITE_SUPABASE_URL: url, VITE_SUPABASE_PUBLISHABLE_KEY: key };
}

// Spec 9, D19: errors are tagged with the commit and the environment. Sentry stays
// off until the SENTRY_DSN build variable is set.
export type SentryEnv = {
  VITE_ENVIRONMENT: "production" | "staging";
  VITE_RELEASE?: string;
  VITE_SENTRY_DSN?: string;
};

export function sentryEnvFor(branch: string | undefined, vars: Vars): SentryEnv {
  const release = vars.WORKERS_CI_COMMIT_SHA?.trim();
  const dsn = vars.SENTRY_DSN?.trim();
  return {
    VITE_ENVIRONMENT: branch === productionBranch ? "production" : "staging",
    ...(release && { VITE_RELEASE: release }),
    ...(dsn && { VITE_SENTRY_DSN: dsn }),
  };
}

function required(vars: Vars, name: string): string {
  const value = vars[name]?.trim();
  if (!value) throw new Error(`Build variable ${name} is not set`);
  return value;
}

// New keys are sb_publishable_… or sb_secret_…; legacy keys are JWTs with a role claim.
function isSecretKey(key: string): boolean {
  if (key.startsWith("sb_secret_")) return true;
  const payload = key.split(".")[1];
  if (!payload) return false;
  try {
    const claims = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
      role?: unknown;
    };
    return claims.role === "service_role";
  } catch {
    return false;
  }
}
