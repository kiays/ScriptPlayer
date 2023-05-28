const { app } = require("electron");
const path = require("path");
const fs = require("fs");
const dataRoot = app.getPath("userData");
console.log("path:", dataRoot);

const dbPath = path.join(dataRoot, "app_database.json");
const dbBackupPath = path.join(
  dataRoot,
  `app_database.backup${Date.now()}.json`
);
if (!fs.existsSync(dbPath)) {
  console.log("app_database.json not found");
  const initialJsonStr = JSON.stringify({
    version: process.env.VERSION,
    tracks: {},
    works: {},
    csvs: {},
    playlists: {},
    state: {
      currentTrackID: null,
      currentPlaylistID: null,
    },
  });
  fs.writeFileSync(dbPath, initialJsonStr);
}
const data = JSON.parse(fs.readFileSync(dbPath, { encoding: "utf8" }));

// data migration
let dirty = false;
if (data.tracks) {
  for (let k in data.tracks) {
    const track = data.tracks[k];
    if (!track.sheetIds || !track.numPlayed || !track.id) dirty = true;
    if (!track.sheetIds) data.tracks[k].sheetIds = [];
    if (!track.numPlayed) data.tracks[k].numPlayed = 0;
    if (!track.id) data.tracks[k].id = Date.now() + Math.random();
  }
}
if (data.works) {
  for (let k in data.works) {
    const work = data.works[k];
    console.log(work, k, work.addedAt);
    if (!work.addedAt) dirty = true;
    if (!work.addedAt) data.works[k].addedAt = Date.now();
  }
}

// create backup
if (!data.version) {
  fs.writeFileSync(dbBackupPath, JSON.stringify(data));
  data.version = process.env.VERSION;
}

if (dirty) {
  fs.writeFileSync(dbBackupPath, JSON.stringify(data));
  fs.writeFileSync(dbPath, JSON.stringify(data));
}

const getAll = () => data;
const getAllWorks = () => data.works;
const getAllPlaylists = () => data.playlists;
const getAllTracks = () => data.tracks;
const getAllCSVs = () => data.csvs;
const setAllWorks = (works) => {
  data.works = works;
  save();
};
const setAllCSVs = (csvs) => {
  data.csvs = csvs;
  save();
};
const setAllTracks = (tracks) => {
  data.tracks = tracks;
  save();
};
const setAllPlaylists = (playlists) => {
  data.playlists = playlists;
  save();
};
const getJsonDataString = () => {
  return JSON.stringify(data);
};
const save = () => fs.writeFileSync(dbPath, JSON.stringify(data));
const dump = () => ({ data });
module.exports = {
  getJsonDataString,
  getAll,
  getAllCSVs,
  getAllPlaylists,
  getAllTracks,
  getAllWorks,
  setAllCSVs,
  setAllWorks,
  setAllPlaylists,
  setAllTracks,
  save,
  dump,
};
