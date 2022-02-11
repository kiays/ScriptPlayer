import { ipcRenderer } from "electron";
import { atom } from "recoil";

const ipcEffect = ({ setSelf, onSet }) => {
  ipcRenderer.invoke("getAllTracks").then(setSelf);
  onSet(async (newValue, _prevValue, _isReset) => {
    await ipcRenderer.invoke("setAllTracks", newValue);
  });
};
export const tracksState = atom({
  key: "tracks",
  default: {},
  effects: [ipcEffect],
});
