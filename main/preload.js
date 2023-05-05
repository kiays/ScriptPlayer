const { contextBridge, ipcRenderer } = require("electron");
// const path = require("path");

// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.

contextBridge.exposeInMainWorld("mainProc", {
  checkDroppedFile: (filePath) =>
    ipcRenderer.invoke("check-dropped-file", filePath),
  importWork: (filePath) => ipcRenderer.invoke("import-work", filePath),
  getFileHash: (filePath) => ipcRenderer.invoke("file-hash", filePath),
  readFileAsText: (filePath) =>
    ipcRenderer.invoke("read-file-as-text", filePath),
  setAllPlaylists: () => ipcRenderer.invoke("setAllPlaylists"),
  getAllPlaylists: (value) => ipcRenderer.invoke("getAllPlaylists", value),
  setAllCSVs: () => ipcRenderer.invoke("setAllCSVs"),
  getAllCSVs: (value) => ipcRenderer.invoke("getAllCSVs", value),
  setAllTracks: () => ipcRenderer.invoke("setAllTracks"),
  getAllTracks: (value) => ipcRenderer.invoke("getAllTracks", value),
  setAllWorks: () => ipcRenderer.invoke("setAllWorks"),
  getAllWorks: (value) => ipcRenderer.invoke("getAllWorks", value),
  mainWindowReady: () => ipcRenderer.invoke("main-window-ready"),
  addListener: (eventName, listener) =>
    ipcRenderer.addListener(eventName, listener),
  removeListener: (eventName, listener) =>
    ipcRenderer.removeListener(eventName, listener),
});
