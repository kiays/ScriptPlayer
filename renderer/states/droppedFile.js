import { ipcRenderer } from "electron";
import { atom, selector } from "recoil";

export const droppedFilePathState = atom({
  key: "droppedFilePath",
  default: null,
});

export const droppedFileState = selector({
  key: "droppedFile",
  get: async ({ get }) => {
    const fileInfo = get(droppedFilePathState);
    console.log(fileInfo);
    if (!fileInfo) return null;
    return await ipcRenderer.invoke("check-dropped-file", fileInfo.path);
  },
});
