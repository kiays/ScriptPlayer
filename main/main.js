const { app, BrowserWindow, ipcMain } = require("electron");
const { DEVICE_UUID, APP_NAME } = require("../common/constants");
const path = require("path");
const database = require("./database");
// const installExtension = require("electron-devtools-installer").default;
// const { REACT_DEVELOPER_TOOLS } = require("electron-devtools-installer");
const { traverseDirectory, copyToDataDir } = require("./directory");
const crypto = require("crypto");
const fs = require("fs/promises");
let mainWindow;
let splashScreen;

function createSplash() {
  splashScreen = new BrowserWindow({
    show: false,
    frame: false,
    width: 600,
    height: 322,
  });

  splashScreen.loadFile("dist/splash.html");

  splashScreen.once("ready-to-show", () => {
    splashScreen.show();
  });
}

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 1200,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: true,
      contextIsolation: false,
    },
  });
  mainWindow.hide();
  mainWindow.webContents.on(
    "select-bluetooth-device",
    (event, deviceList, callback) => {
      console.log("select bluetooth device callback");
      event.preventDefault();
      if (deviceList && deviceList.length > 0) {
        console.log(deviceList);
        callback(deviceList[0].deviceId);
      }
    }
  );
  mainWindow.loadFile("dist/index.html");
};

app.whenReady().then(() => {
  // installExtension(REACT_DEVELOPER_TOOLS, {
  //   loadExtensionOptions: { allowFileAccess: true },
  // })
  //   .then((name) => console.log(`Added Extension:  ${name}`))
  //   .catch((err) => console.log("An error occurred: ", err));
  createSplash();
  ipcMain.handle("main-window-ready", () => {
    if (splashScreen) {
      splashScreen.destroy();
      splashScreen = null;
    }
    mainWindow.show();
  });
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", async () => {
  if (process.platform !== "darwin") app.quit();
});
ipcMain.handle("send-to-device", (_, args) => {});

ipcMain.handle("check-dropped-file", async (e, arg) => {
  return await traverseDirectory(arg);
});

ipcMain.handle("import-work", async (e, arg) => {
  return await copyToDataDir(arg);
});

ipcMain.handle("file-hash", async (_, filePath) => {
  const fileBuffer = await fs.readFile(filePath);
  const hashSum = crypto.createHash("sha256");
  hashSum.update(fileBuffer);
  return hashSum.digest("hex");
});
ipcMain.handle("read-file-as-text", async (_, filePath) => {
  const fileContentStr = await fs.readFile(filePath, { encoding: "utf8" });
  return fileContentStr;
});
require("./menu");

Object.keys(database).forEach((method) => {
  ipcMain.handle(method, async (e, arg) => database[method](arg));
});

app.on("before-quit", async (e) => {
  console.log("before quit");
  mainWindow.send("quit");
  e.preventDefault();
  return new Promise((res) => {
    console.log("send quit");
    setTimeout(() => {
      app.exit();
    }, 1000);
  });
});
