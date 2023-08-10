require("dotenv").config({ path: __dirname + "/../.env" });
require("@sentry/electron/main").init({ dsn: process.env.SENTRY_DSN });
console.log(`start script-player version: ${process.env.VERSION}`);

const { app, BrowserWindow, ipcMain } = require("electron");
const { DEVICE_UUID, APP_NAME } = require("../common/constants");
const path = require("path");
const database = require("./database");
// const installExtension = require("electron-devtools-installer").default;
// const { REACT_DEVELOPER_TOOLS } = require("electron-devtools-installer");
const { traverseDirectory, copyToDataDir } = require("./directory");
const crypto = require("crypto");
const fs = require("fs/promises");
const { state, saveState } = require("./preferences");
let mainWindow;

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: state.width,
    height: state.height,
    x: state.x,
    y: state.y,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });
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
  const saveSizeAndPosition = () => {
    const [width, height] = mainWindow.getSize();
    const [x, y] = mainWindow.getPosition();
    state.width = width;
    state.height = height;
    state.x = x;
    state.y = y;
    saveState(state);
  };

  mainWindow.on("resize", saveSizeAndPosition);
  mainWindow.on("move", saveSizeAndPosition);
  mainWindow.on("close", () => {
    mainWindow = null;
  });
  mainWindow.loadFile("dist/index.html");
};

app.whenReady().then(() => {
  // installExtension(REACT_DEVELOPER_TOOLS, {
  //   loadExtensionOptions: { allowFileAccess: true },
  // })
  //   .then((name) => console.log(`Added Extension:  ${name}`))
  //   .catch((err) => console.log("An error occurred: ", err));
  ipcMain.handle("main-window-ready", () => {
    console.log("main window ready");
  });
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", async () => {
  if (process.platform !== "darwin") app.quit();
});
ipcMain.handle("send-to-device", (_, _args) => {
  return;
});

ipcMain.handle("check-dropped-file", async (e, arg) => {
  return await traverseDirectory(arg);
});

ipcMain.handle("import-work", async (e, arg) => {
  const { filePath, shouldCopy } = JSON.parse(arg);
  if (shouldCopy) {
    return await copyToDataDir(filePath);
  }
  return filePath;
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
ipcMain.handle("open-folder", async (_, folderPath) => {
  const { shell } = require("electron");
  if (folderPath == "$data.json") {
    const { app } = require("electron");
    const dataRoot = app.getPath("userData");
    shell.openPath(dataRoot);
    return;
  }
  shell.openPath(folderPath);
});
require("./menu");

Object.keys(database).forEach((method) => {
  ipcMain.handle(method, async (e, arg) => database[method](arg));
});

app.on("before-quit", async (e) => {
  console.log("before quit");
  if (mainWindow) mainWindow.send("quit");
  e.preventDefault();
  return new Promise(() => {
    console.log("send quit");
    setTimeout(() => {
      app.exit();
    }, 1000);
  });
});
