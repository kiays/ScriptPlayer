import React from "react";
import { createRoot } from "react-dom/client";
import App from "./app";

import * as Sentry from "@sentry/electron/renderer";
import { init as reactInit } from "@sentry/react";

Sentry.init(
  {
    dsn: process.env.SENTRY_DSN,
    beforeSend(event, _hint) {
      // Check if it is an exception, and if so, show the report dialog
      if (event.exception) {
        Sentry.showReportDialog({
          eventId: event.event_id,
          user: { name: "anonymous", email: "anonymous@example.com" },
        });
      }
      return event;
    },
    beforeBreadcrumb(breadcrumb, hint) {
      if (breadcrumb.category === "ui.click") {
        const { target } = hint.event;
        if (target.ariaLabel) {
          breadcrumb.message = target.ariaLabel;
        }
      }
      return breadcrumb;
    },
  },
  reactInit
);

const root = createRoot(document.getElementById("root"));
root.render(<App />);
document.getElementById("loader")?.remove();
document.querySelector("title").textContent += ` - v${process.env.VERSION}`;
window.mainProc.mainWindowReady();
