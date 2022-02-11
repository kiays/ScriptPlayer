import { ipcRenderer } from "electron";
import { atom, selectorFamily } from "recoil";
import RecoilKeys from "./keys";
import { playlistSelector } from "./playlists";

const ipcEffect = ({ setSelf, onSet }) => {
  ipcRenderer.invoke("getAllTracks").then(setSelf);
  onSet(async (newValue, _prevValue, _isReset) => {
    await ipcRenderer.invoke("setAllTracks", newValue);
  });
};
export const tracksState = atom({
  key: RecoilKeys.TRACKS,
  default: {},
  effects: [ipcEffect],
});

export const tracksByPlaylist = selectorFamily<Array<Track>, string>({
  key: RecoilKeys.TRACKS_BY_PLAYLIST,
  get:
    (id) =>
      ({ get }) => {
        const trackDict = get(tracksState);
        const playlist = get(playlistSelector(id));
        if (!playlist) return [];
        return playlist.tracks
          .map(({ hash, id, csvName, csvUrl, csvContent }) => {
            if (!trackDict[hash]) return null;
            return {
              ...trackDict[hash],
              id,
              csvName,
              csvUrl,
              csvContent,
            };
          })
          .filter(Boolean);
      },
});
