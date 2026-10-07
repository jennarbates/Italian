import { describe, expect, test } from "vitest";
import { sentryEnvFor, supabaseEnvFor } from "./cloudflare-env.ts";

const vars = {
  STAGING_SUPABASE_URL: "https://staging.supabase.co",
  STAGING_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_staging",
  PRODUCTION_SUPABASE_URL: "https://production.supabase.co",
  PRODUCTION_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_production",
};

function jwt(claims: object): string {
  const part = (o: object) => Buffer.from(JSON.stringify(o)).toString("base64url");
  return `${part({ alg: "HS256" })}.${part(claims)}.signature`;
}

describe("supabaseEnvFor", () => {
  test("main builds with production", () => {
    expect(supabaseEnvFor("main", vars)).toEqual({
      VITE_SUPABASE_URL: "https://production.supabase.co",
      VITE_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_production",
    });
  });

  test.each(["chi-014-cloudflare", "Main", "main-fix", "release/main"])(
    "%s builds with staging",
    (branch) => {
      expect(supabaseEnvFor(branch, vars)).toEqual({
        VITE_SUPABASE_URL: "https://staging.supabase.co",
        VITE_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_staging",
      });
    },
  );

  test("fails outside Workers Builds", () => {
    expect(() => supabaseEnvFor(undefined, vars)).toThrow(/WORKERS_CI_BRANCH/);
    expect(() => supabaseEnvFor("", vars)).toThrow(/WORKERS_CI_BRANCH/);
  });

  test("a preview never falls back to production values", () => {
    expect(() => supabaseEnvFor("feature", { ...vars, STAGING_SUPABASE_URL: undefined })).toThrow(
      /STAGING_SUPABASE_URL/,
    );
    expect(() =>
      supabaseEnvFor("feature", { ...vars, STAGING_SUPABASE_PUBLISHABLE_KEY: "  " }),
    ).toThrow(/STAGING_SUPABASE_PUBLISHABLE_KEY/);
  });

  test("rejects staging pointed at the production project", () => {
    expect(() =>
      supabaseEnvFor("feature", { ...vars, STAGING_SUPABASE_URL: vars.PRODUCTION_SUPABASE_URL }),
    ).toThrow(/production URL/);
  });

  test("rejects secret keys", () => {
    expect(() =>
      supabaseEnvFor("main", { ...vars, PRODUCTION_SUPABASE_PUBLISHABLE_KEY: "sb_secret_abc" }),
    ).toThrow(/secret/);
    expect(() =>
      supabaseEnvFor("feature", {
        ...vars,
        STAGING_SUPABASE_PUBLISHABLE_KEY: jwt({ role: "service_role" }),
      }),
    ).toThrow(/secret/);
  });

  test("accepts a legacy anon JWT", () => {
    const anon = jwt({ role: "anon" });
    expect(
      supabaseEnvFor("feature", { ...vars, STAGING_SUPABASE_PUBLISHABLE_KEY: anon })
        .VITE_SUPABASE_PUBLISHABLE_KEY,
    ).toBe(anon);
  });
});

describe("sentryEnvFor", () => {
  const sentryVars = {
    WORKERS_CI_COMMIT_SHA: "abc123",
    SENTRY_DSN: "https://key@o1.ingest.sentry.io/1",
  };

  test("main is production, tagged with the commit", () => {
    expect(sentryEnvFor("main", sentryVars)).toEqual({
      VITE_ENVIRONMENT: "production",
      VITE_RELEASE: "abc123",
      VITE_SENTRY_DSN: "https://key@o1.ingest.sentry.io/1",
    });
  });

  test("other branches are staging", () => {
    expect(sentryEnvFor("chi-017-sentry", sentryVars).VITE_ENVIRONMENT).toBe("staging");
  });

  test("no DSN leaves Sentry off instead of failing the build", () => {
    expect(sentryEnvFor("main", { WORKERS_CI_COMMIT_SHA: "abc123", SENTRY_DSN: " " })).toEqual({
      VITE_ENVIRONMENT: "production",
      VITE_RELEASE: "abc123",
    });
  });
});
