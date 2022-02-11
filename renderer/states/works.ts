import { ipcRenderer } from "electron";
import { atom, AtomEffect, selector } from "recoil";

type AllWorks = { [key: string]: Work };
const ipcEffect: AtomEffect<AllWorks> = ({ setSelf, onSet }) => {
  ipcRenderer.invoke("getAllWorks").then(setSelf);
  onSet(async (newValue, _prevVarlue, _isReset) => {
    await ipcRenderer.invoke("setAllWorks", newValue);
  });
};
export const worksState = atom<AllWorks>({
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
