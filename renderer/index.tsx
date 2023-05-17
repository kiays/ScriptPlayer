import { createRoot } from "react-dom/client";

const root = createRoot(document.getElementById("root"));
import("./app").then(({ default: render }) => {
  render(root);
  document.getElementById("loader")?.remove();
});
window.mainProc.mainWindowReady();
