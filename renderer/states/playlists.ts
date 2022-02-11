import { ipcRenderer } from "electron";
import { atom } from "recoil";

const ipcEffect = ({ setSelf, onSet }) => {
  console.log("playlist effect");
  ipcRenderer.invoke("getAllPlaylists").then(setSelf);
  onSet(async (newValue, _prevValue, _isReset) => {
    console.log("onSet: ", newValue);
    await ipcRenderer.invoke("setAllPlaylists", newValue);
  });
};

export const playlistsState = atom({
  key: "playlists",
  default: {},
  effects: [ipcEffect],
});
