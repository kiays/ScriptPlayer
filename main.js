const { app, BrowserWindow, ipcMain } = require("electron");
const noble = require("@abandonware/noble");
const path = require("path");
// const installExtension =require('electron-devtools-installer').default;
// const {REACT_DEVELOPER_TOOLS} =require('electron-devtools-installer');

let device = null;
let characteristic = null;

noble.once("stateChange", async (state) => {
  if (state === "poweredOn") {
    await noble.startScanningAsync(
      ["40EE1111-63EC-4B7F-8CE7-712EFD55B90E"],
      false
    );
  }
});

noble.on("discover", async (peripheral) => {
  // console.log("discover", peripheral)
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

  console.log(characteristics);
  const ch = characteristics[0];
  console.log("write");
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
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  mainWindow.loadFile("dist/index.html");
};

app.whenReady().then(() => {
  // installExtension(REACT_DEVELOPER_TOOLS)
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
