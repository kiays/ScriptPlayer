import { atom, AtomEffect, selector } from "recoil";
import { AllWorks, Work } from "../types";

const ipcEffect: AtomEffect<AllWorks> = ({ setSelf, onSet }) => {
  window.mainProc.getAllWorks().then(setSelf);
  onSet(async (newValue, _prevVarlue, _isReset) => {
    await window.mainProc.setAllWorks(newValue);
  });
};
export const worksState = atom<AllWorks>({
  key: "works",
  default: {},
  effects: [ipcEffect],
});

export const currentWorkIdState = atom<string | null>({
  key: "currentWorkId",
  default: null,
});

export const currentWorkState = selector<Work | null>({
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
