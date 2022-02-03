const { BrowserWindow } = require("electron");
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
module.exports = { openPreferences };
