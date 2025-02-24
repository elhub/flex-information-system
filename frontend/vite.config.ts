import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fs from "fs";
import { homedir } from "os";

// https://vitejs.dev/config/
export default defineConfig({
  optimizeDeps: {
    include: ["@mui/material/Tooltip"],
  },
  plugins: [react()],
  define: {
    "process.env": {},
  },
  server: {
    host: "dev.flex.internal",
    port: 5443,
    strictPort: true,
    allowedHosts: [".flex.internal"],
    https: {
      key: fs.readFileSync(
        homedir() + "/.ca/certificates/dev.flex.internal.key.pem",
      ),
      cert: fs.readFileSync(
        homedir() + "/.ca/certificates/dev.flex.internal.cert.pem",
      ),
    },
    // Using the proxy instance
    proxy: {
      "/api": {
        target: "http://dev.flex.internal:5444",
        changeOrigin: true,
      },
      "/auth": {
        target: "http://dev.flex.internal:5444",
        changeOrigin: true,
      },
    },
  },
  base: "./",
});
