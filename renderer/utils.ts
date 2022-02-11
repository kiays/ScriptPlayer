export const createTrack = (file: File | {name: string, path: string}): Promise<TrackFile> =>
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

export const readFile = async (file): Promise<string> =>
  new Promise((resolve, reject) => {
    const f = new FileReader();
    f.onload = (e) => {
      const result = e.target.result;
      if (typeof(result) == "string") {

        resolve(result);
      } else {
        reject("should pass a text file");
      }
    };
    f.readAsText(file);
  });

export const formatTime = (time) => {
  const minutes = Math.floor(time / 60);
  const seconds = String(Math.floor(time % 60)).padStart(2, "0");
  return `${minutes}:${seconds}`;
};
