import { ipcRenderer } from "electron";
import { atom, selector } from "recoil";

const ipcEffect = async ({ setSelf, onSet }) => {
  setSelf(await ipcRenderer.invoke("getAllTracks"));
  onSet(async (newValue, _, isReset) => {
    await ipcRenderer.invoke("setAllTracks", newValue);
  });
};
export const tracksState = atom({
  key: "tracks",
  default: {},
  effects: [ipcEffect],
});
