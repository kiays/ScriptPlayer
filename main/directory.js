const { app } = require("electron");
const fs = require("fs/promises");
const exists = require("fs").existsSync;
const path = require("path");
const dataRoot = app.getPath("userData");

const traverseDirectory = async (dirPath) => {
  const dir = await fs.readdir(dirPath);
  const { fileTypeFromFile } = await import("file-type");

  return dir.reduce(async (promise, name) => {
    const acc = await promise;
    const p = path.join(dirPath, name);
    const s = await fs.stat(p);
    let type = null,
      children = null;

    if (s.isDirectory()) {
      type = "dir";
      children = await traverseDirectory(p);
    } else {
      const res = await fileTypeFromFile(p);
      if (res) {
        type = res.mime;
      }
    }
    return [
      ...acc,
      {
        path: p,
        type,
        children,
        name: name.replace(/[#/*\\\s\t,:;+'"@=%?]/g, "_"),
      },
    ];
  }, Promise.resolve([]));
};

const copyToDataDir = async (workPath) => {
  const name = path.basename(workPath);
  const dest = path.join(dataRoot, "works", name);
  if (exists(dest)) {
    return dest;
  }
  await fs.cp(workPath, dest, { recursive: true });
  return dest;
};

module.exports = {
  traverseDirectory,
  copyToDataDir,
};
