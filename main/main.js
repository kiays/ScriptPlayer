const { app, BrowserWindow, ipcMain } = require("electron");
const noble = require("@abandonware/noble");
const { DEVICE_UUID, APP_NAME } = require("../common/constants");
const path = require("path");
const database = require("./database");
// const installExtension = require("electron-devtools-installer").default;
// const { REACT_DEVELOPER_TOOLS } = require("electron-devtools-installer");
const { traverseDirectory, copyToDataDir } = require("./directory");
const crypto = require("crypto");
const fs = require("fs/promises");

let device = null;
let characteristic = null;

noble.once("stateChange", async (state) => {
  if (state === "poweredOn") {
    await noble.startScanningAsync([DEVICE_UUID], false);
  }
});

noble.on("discover", async (peripheral) => {
  await noble.stopScanningAsync();
  await peripheral.connectAsync();
  peripheral.once("disconnected", () => {
    device = null;
    characteristic = null;
  });
  const { characteristics } =
    await peripheral.discoverSomeServicesAndCharacteristicsAsync(
      [],
      ["40ee222263ec4b7f8ce7712efd55b90e"]
    );

  const ch = characteristics[0];
  await ch.writeAsync(Buffer.from([0x02, 0x01, 0xf0]), false);
  await ch.writeAsync(Buffer.from([0x02, 0x01, 0xa0]), false);
  await ch.writeAsync(Buffer.from([0x02, 0x01, 0x00]), false);

  device = peripheral;
  characteristic = ch;
});

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 1200,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  mainWindow.loadFile("dist/index.html");
};

app.whenReady().then(() => {
  // installExtension(REACT_DEVELOPER_TOOLS, {
  //   loadExtensionOptions: { allowFileAccess: true },
  // })
  //   .then((name) => console.log(`Added Extension:  ${name}`))
  //   .catch((err) => console.log("An error occurred: ", err));
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", async () => {
  if (device) {
    await device.disconnectAsync();
  }
  if (process.platform !== "darwin") app.quit();
});

ipcMain.handle("send-to-device", (_, args) => {
  if (device && characteristic) {
    characteristic.writeAsync(Buffer.from(args), false);
  }
});
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
