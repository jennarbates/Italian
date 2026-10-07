/// <reference types="vite/client" />

// Set per environment by scripts/cloudflare-build.ts (spec 9, D16).
interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_PUBLISHABLE_KEY?: string;
}
