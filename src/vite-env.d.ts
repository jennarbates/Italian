/// <reference types="vite/client" />

// Set per environment by vite.config.ts on Workers Builds (spec 9, D16, D19), or by CI
// from the local Supabase.
interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_PUBLISHABLE_KEY?: string;
  readonly VITE_SENTRY_DSN?: string;
  readonly VITE_RELEASE?: string;
  readonly VITE_ENVIRONMENT?: "production" | "staging";
  readonly VITE_OTP_COOLDOWN_S?: string; // tests against local Supabase only
}
