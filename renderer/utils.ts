import { format, fromUnixTime } from "date-fns";
import { ipcRenderer } from "electron";

export const createTrack = (
  file: File | { name: string; path: string }
): Promise<TrackFile> =>
  new Promise((resolve, _reject) => {
    const filePath = file.path;
    const audio = new Audio(filePath);
    const listener = () => {
      audio.removeEventListener("loadedmetadata", listener);
      resolve({
        title: file.name,
        url: filePath,
        duration: audio.duration,
      });
    };
    audio.addEventListener("loadedmetadata", listener);
  });

export const readFile = async (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const f = new FileReader();
    f.onload = (e) => {
      if (!e.target) {
        reject("target is null");
        return;
      }
      const result = e.target.result;
      if (typeof result == "string") {
        resolve(result);
      } else {
        reject("should pass a text file");
      }
    };
    f.readAsText(file);
  });

export const readCsvFile = async (
  file: File | string
): Promise<Array<[number, number, number]>> => {
  let contentStr = "";
  if (typeof file == "string") {
    contentStr = await ipcRenderer.invoke("read-file-as-text", file);
  } else {
    contentStr = await readFile(file);
  }
  const csvContent = contentStr
    .split("\r\n")
    .map((l) => l.split(",").map(Number))
    .map(([time, dir, val]): [number, number, number] => [
      time * 0.1,
      dir,
      val,
    ]);
  return csvContent;
};
export const getFileHash = (path: string): Promise<string> =>
  ipcRenderer.invoke("file-hash", path);

export const formatTime = (time: number) => {
  const minutes = Math.floor(time / 60);
  const seconds = String(Math.floor(time % 60)).padStart(2, "0");
  return `${minutes}:${seconds}`;
};

export const formatDate = (date: number) =>
  format(fromUnixTime(date * 0.001 || 0), "yyyy-MM-dd");
