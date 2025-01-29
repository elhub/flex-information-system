import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

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
    host: true,
    port: 5173,
    strictPort: true,
    allowedHosts: ["localhost", "flex.localhost", "host.docker.internal"],
  },
  base: "./",
});
