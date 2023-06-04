const { BrowserWindow } = require("electron");
const { app } = require("electron");
const path = require("path");
const fs = require("fs");
const dataRoot = app.getPath("userData");

const stateFile = path.join(dataRoot, "app_state.json");
if (!fs.existsSync(stateFile)) {
  console.log("app_state.json not found");
  const initialJsonStr = JSON.stringify({
    width: 600,
    height: 800,
  });
  fs.writeFileSync(stateFile, initialJsonStr);
}
const state = JSON.parse(fs.readFileSync(stateFile, { encoding: "utf8" }));
const saveState = (s) => {
  fs.writeFileSync(stateFile, JSON.stringify(s));
};

let preferencesWindow = null;
const openPreferences = () => {
  console.log("open pref");
  preferencesWindow = new BrowserWindow({
    width: 600,
    height: 400,
    title: "Preferences",
  });
  preferencesWindow.show();
};
module.exports = { openPreferences, state, saveState };
