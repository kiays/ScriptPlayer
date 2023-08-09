import React from "react";
import { createRoot } from "react-dom/client";
import App from "./app";

import * as Sentry from "@sentry/electron/renderer";
import { init as reactInit } from "@sentry/react";

Sentry.init({ dsn: process.env.SENTRY_DSN }, reactInit);

const root = createRoot(document.getElementById("root"));
root.render(<App />);
document.getElementById("loader")?.remove();
document.querySelector("title").textContent += ` - v${process.env.VERSION}`;
window.mainProc.mainWindowReady();
