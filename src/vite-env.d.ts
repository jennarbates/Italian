/// <reference types="vite/client" />

// Set per environment by scripts/cloudflare-build.ts (spec 9, D16), or by CI from
// the local Supabase.
interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_PUBLISHABLE_KEY?: string;
  readonly VITE_OTP_COOLDOWN_S?: string; // tests against local Supabase only
}
