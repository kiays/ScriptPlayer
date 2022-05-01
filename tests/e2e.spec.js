const { _electron: electron } = require("playwright");
const { test, expect } = require("@playwright/test");

test("example test", async () => {
  const electronApp = await electron.launch({ args: ["."] });
  const isPackaged = await electronApp.evaluate(async ({ app }) => {
    return app.isPackaged;
  });

  expect(isPackaged).toBe(false);

  const window = await electronApp.firstWindow();
  window.on("console", (msg) => {
    console.log(msg);
  });
  await window.waitForSelector("#default-loading", { state: "detached" });

  await electronApp.close();
});
