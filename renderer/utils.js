export const createTrack = (file) =>
  new Promise((resolve, reject) => {
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

export const readFile = async (file) =>
  new Promise((resolve, reject) => {
    const f = new FileReader();
    f.onload = (e) => resolve(e.target.result);
    f.readAsText(file);
  });

export const formatTime = (time) => {
  const minutes = Math.floor(time / 60);
  const seconds = String(Math.floor(time % 60)).padStart(2, "0");
  return `${minutes}:${seconds}`;
};
