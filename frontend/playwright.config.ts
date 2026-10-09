import { defineConfig, devices } from "@playwright/test";

// Runs against the local stack (just start && just load), served by nginx.
// Rebuild the images after frontend changes: just reset
const baseURL =
  process.env.PLAYWRIGHT_BASE_URL ?? "https://test.flex.internal:6443";
export const STORAGE_STATE = "e2e/.auth/user.json";

export default defineConfig({
  testDir: "./e2e",
  // all tests share one database and one session
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: "list",
  snapshotPathTemplate: "{testDir}/__snapshots__/{testFilePath}/{arg}{ext}",
  expect: {
    toHaveScreenshot: {
      animations: "disabled",
      caret: "hide",
      maxDiffPixelRatio: 0.001,
    },
  },
  use: {
    baseURL,
    ignoreHTTPSErrors: true,
    locale: "en-US",
    timezoneId: "Europe/Oslo" /* seed data is Oslo-midnight based */,
    colorScheme: "light",
    reducedMotion: "reduce",
    trace: "retain-on-failure",
  },
  projects: [
    { name: "setup", testMatch: /auth\.setup\.ts/ },
    {
      name: "chromium",
      testIgnore: /auth\.setup\.ts/,
      dependencies: ["setup"],
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1920, height: 1080 },
        storageState: STORAGE_STATE,
      },
    },
  ],
});
