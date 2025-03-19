import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fs from "fs";
import { homedir } from "os";

// https://vitejs.dev/config/

// We need to conditionally load the HTTPS configuration
// since it is only used in our local development server.
// If we don't do this, the CI worker will fail because it
// cannot find the certificates.
let httpsConfig = {};
const keyPath = homedir() + "/.ca/certificates/dev.flex.internal.key.pem";
const certPath = homedir() + "/.ca/certificates/dev.flex.internal.cert.pem";

if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
  httpsConfig = {
    key: fs.readFileSync(keyPath),
    cert: fs.readFileSync(certPath),
  };
}

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
    https: httpsConfig,
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
