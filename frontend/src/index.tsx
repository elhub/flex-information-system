import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import "maplibre-gl/dist/maplibre-gl.css";

import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";
import { client } from "./generated-client/client.gen";
import { apiURL, API_VERSION } from "./httpConfig";

declare global {
  interface Window {
    env: {
      PRIMARY_COLOR?: string;
      VITE_FLEX_URL?: string;
      VITE_FLEX_COLOR_DARK?: string;
      VITE_FLEX_PRODUCT_APPLICATION_BLOCK_BEFORE?: string;
      VITE_FLEX_USER_GUIDE_URL?: string;
      VITE_FLEX_USER_GUIDE_CREATE_USERS_URL?: string;
    };
  }
}

client.setConfig({
  baseUrl: apiURL,
});

client.interceptors.request.use((request) => {
  if (request.url.startsWith(apiURL)) {
    request.headers.set("Api-Version", API_VERSION);
  }
  return request;
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
