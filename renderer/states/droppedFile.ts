import { atom, selector } from "recoil";

export const droppedFilePathState = atom({
  key: "droppedFilePath",
  default: null,
});

export const droppedFileState = selector({
  key: "droppedFile",
  get: async ({ get }) => {
    const fileInfo = get(droppedFilePathState);
    if (!fileInfo) return null;
    return await window.mainProc.checkDroppedFile(fileInfo.path);
  },
});
