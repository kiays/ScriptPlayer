import { ipcRenderer } from "electron";
import { atom, selector } from "recoil";

const ipcEffect = async ({ setSelf, onSet }) => {
  console.log("playlist effect");
  setSelf(await ipcRenderer.invoke("getAllPlaylists"));
  onSet(async (newValue, _, isReset) => {
    console.log("onSet: ", newValue);
    await ipcRenderer.invoke("setAllPlaylists", newValue);
  });
};

export const playlistsState = atom({
  key: "playlists",
  default: {},
  effects: [ipcEffect],
});
