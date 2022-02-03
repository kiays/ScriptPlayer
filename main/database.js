const { app } = require("electron");
const path = require("path");
const fs = require("fs");
const dataRoot = app.getPath("userData");
console.log("path:", dataRoot);

const dbPath = path.join(dataRoot, "app_database.json");
if (!fs.existsSync(dbPath)) {
  console.log("app_database.json not found");
  const initialJsonStr = JSON.stringify({
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
const data = fs.readFileSync(dbPath, { encoding: "utf8" });

const getAll = () => data;
const getAllWorks = () => data.works;
const getAllPlaylists = () => data.playlists;
const getAllTracks = () => data.tracks;
const getAllCSVs = () => data.csvs;
const save = () => fs.writeFileSync(dbPath, initialJsonStr);

module.exports = {
  getAll,
  getAllCSVs,
  getAllPlaylists,
  getAllTracks,
  getAllWorks,
  save,
};
