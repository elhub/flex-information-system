import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import "@elhub/ds-css";

import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";
import { client } from "./generated-client/client.gen";
import { apiURL } from "./httpConfig";

declare global {
  interface Window {
    env: {
      PRIMARY_COLOR: string;
      VITE_FLEX_URL: string;
      VITE_FLEX_COLOR_DARK: string;
    };
  }
}

client.setConfig({
  baseUrl: apiURL,
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
