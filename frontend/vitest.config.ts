import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

// Separate from vite.config.mts (used for the dev server/build) since that
// config depends on local dev-only HTTPS certificates and proxy settings
// that aren't relevant (and shouldn't be required) for running tests.
export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    css: false,
  },
});
