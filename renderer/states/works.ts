import { ipcRenderer } from "electron";
import { atom, selector } from "recoil";

const ipcEffect = ({ setSelf, onSet }) => {
  ipcRenderer.invoke("getAllWorks").then(setSelf);
  onSet(async (newValue, _prevVarlue, _isReset) => {
    await ipcRenderer.invoke("setAllWorks", newValue);
  });
};
export const worksState = atom({
  key: "works",
  default: {},
  effects: [ipcEffect],
});

export const currentWorkIdState = atom({
  key: "currentWorkId",
  default: null,
});

export const currentWorkState = selector({
  key: "currentWork",
  get: ({ get }) => {
    const works = get(worksState);
    const workId = get(currentWorkIdState);
    if (workId in works) {
      return works[workId];
    }
    return null;
  },
});
