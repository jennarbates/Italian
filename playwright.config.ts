import { defineConfig, devices } from "@playwright/test";

const port = 4173;

// Spec 10.2: e2e runs in Chromium and WebKit. Phone profiles, since the app is
// phone-first, plus desktop profiles at 1440 × 900 for the desktop layout
// (desktop spec DS 13.3), which run desktop.spec.ts.
const desktop = { width: 1440, height: 900 };

export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: `http://localhost:${port}`,
    trace: "on-first-retry",
  },
  projects: [
    { name: "chromium", use: { ...devices["Pixel 7"] }, testIgnore: "desktop.spec.ts" },
    { name: "webkit", use: { ...devices["iPhone 15"] }, testIgnore: "desktop.spec.ts" },
    {
      name: "desktop-chromium",
      use: { ...devices["Desktop Chrome"], viewport: desktop },
      testMatch: "desktop.spec.ts",
    },
    {
      name: "desktop-webkit",
      use: { ...devices["Desktop Safari"], viewport: desktop },
      testMatch: "desktop.spec.ts",
    },
  ],
  // Test the production build, not the dev server.
  webServer: {
    command: `pnpm build && pnpm preview --port ${port} --strictPort`,
    url: `http://localhost:${port}`,
    reuseExistingServer: !process.env.CI,
  },
});
