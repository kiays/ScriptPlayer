import { format, fromUnixTime } from "date-fns";
import {
  TimeSheetData,
  TimeSheetPoint,
  TimeSheetPointLR,
  TrackFile,
} from "./types";

export const IS_DEVELOPMENT = process.env.NODE_ENV === "development";

export const createTrack = (file: {
  name: string;
  path: string;
}): Promise<TrackFile> =>
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
): Promise<TimeSheetData> => {
  let contentStr = "";
  if (typeof file == "string") {
    contentStr = await window.mainProc.readFileAsText(file);
  } else {
    contentStr = await readFile(file);
  }
  const csvContent = contentStr
    .split(/\r\n|\n/)
    .map((l) => l.split(",").map(Number))
    .map(
      ([time, ...rest]):
        | [number | undefined, number | undefined, number | undefined]
        | [
            number | undefined,
            number | undefined,
            number | undefined,
            number | undefined,
            number | undefined,
          ] => [time * 0.1, ...rest] as TimeSheetPoint | TimeSheetPointLR
    )
    .filter(
      ([time, dir, val, ..._rest]) =>
        time != undefined && dir != undefined && val != undefined
    );
  return csvContent;
};
export const getFileHash = (path: string): Promise<string> =>
  window.mainProc.getFileHash(path);

export const formatTime = (time: number) => {
  const minutes = Math.floor(time / 60);
  const seconds = String(Math.floor(time % 60)).padStart(2, "0");
  return `${minutes}:${seconds}`;
};

export const formatDate = (date: number) =>
  format(fromUnixTime(date * 0.001 || 0), "yyyy-MM-dd");

function assertPath(path: string) {
  if (typeof path !== "string") {
    throw new TypeError(
      "Path must be a string. Received " + JSON.stringify(path)
    );
  }
}

/*
MIT License

Copyright (c) 2013 James Halliday

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
// https://github.com/browserify/path-browserify/blob/master/LICENSE
// from https://github.com/browserify/path-browserify/blob/872fec31a8bac7b9b43be0e54ef3037e0202c5fb/index.js
export function dirname(path: string): string {
  assertPath(path);
  if (path.length === 0) return ".";
  let code = path.charCodeAt(0);
  const hasRoot = code === 47; /*/*/
  let end = -1;
  let matchedSlash = true;
  for (let i = path.length - 1; i >= 1; --i) {
    code = path.charCodeAt(i);
    if (code === 47 /*/*/) {
      if (!matchedSlash) {
        end = i;
        break;
      }
    } else {
      // We saw the first non-path separator
      matchedSlash = false;
    }
  }

  if (end === -1) return hasRoot ? "/" : ".";
  if (hasRoot && end === 1) return "//";
  return path.slice(0, end);
}
