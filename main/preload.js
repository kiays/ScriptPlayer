const { contextBridge, ipcRenderer } = require("electron");

// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.

contextBridge.exposeInMainWorld("mainProc", {
  checkDroppedFile: (filePath) =>
    ipcRenderer.invoke("check-dropped-file", filePath),
  importWork: (filePath, shouldCopy) =>
    ipcRenderer.invoke("import-work", JSON.stringify({ filePath, shouldCopy })),
  getFileHash: (filePath) => ipcRenderer.invoke("file-hash", filePath),
  readFileAsText: (filePath) =>
    ipcRenderer.invoke("read-file-as-text", filePath),
  getAllPlaylists: () => ipcRenderer.invoke("getAllPlaylists"),
  setAllPlaylists: (value) => ipcRenderer.invoke("setAllPlaylists", value),
  getAllCSVs: () => ipcRenderer.invoke("getAllCSVs"),
  setAllCSVs: (value) => ipcRenderer.invoke("setAllCSVs", value),
  getAllTracks: () => ipcRenderer.invoke("getAllTracks"),
  setAllTracks: (value) => ipcRenderer.invoke("setAllTracks", value),
  getAllWorks: () => ipcRenderer.invoke("getAllWorks"),
  setAllWorks: (value) => ipcRenderer.invoke("setAllWorks", value),
  getJsonDataString: () => ipcRenderer.invoke("getJsonDataString"),
  mainWindowReady: () => ipcRenderer.invoke("main-window-ready"),
  addListener: (eventName, listener) =>
    ipcRenderer.addListener(eventName, listener),
  removeListener: (eventName, listener) =>
    ipcRenderer.removeListener(eventName, listener),
});
