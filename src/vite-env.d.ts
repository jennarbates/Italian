/// <reference types="vite/client" />

// Set per environment by scripts/cloudflare-build.ts (spec 9, D16, D19).
interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_PUBLISHABLE_KEY?: string;
  readonly VITE_SENTRY_DSN?: string;
  readonly VITE_RELEASE?: string;
  readonly VITE_ENVIRONMENT?: "production" | "staging";
}
