import { defineConfig } from "@hey-api/openapi-ts";

export default defineConfig({
  input: "../backend/data/static/.openapi-frontend-client.json",
  output: "src/generated-client",
  plugins: ["@hey-api/client-fetch", "zod", "@hey-api/sdk"],
});
