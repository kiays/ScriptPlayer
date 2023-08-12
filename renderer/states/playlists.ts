import { atom, selectorFamily } from "recoil";
import RecoilKeys from "./keys";
import update from "immutability-helper";
import { AllPlaylists, Playlist } from "../types";

const ipcEffect = ({ setSelf, onSet }) => {
  window.mainProc.getAllPlaylists().then((playlists) => {
    for (const k in playlists) {
      playlists[k].tracks = playlists[k].tracks.filter(Boolean);
    }
    setSelf(playlists);
  });
  onSet(async (newValue: AllPlaylists) => {
    await window.mainProc.setAllPlaylists(newValue);
  });
};

export const playlistsState = atom<AllPlaylists>({
  key: RecoilKeys.PLAYLISTS,
  default: {},
  effects: [ipcEffect],
});

export const playlistSelector = selectorFamily<Playlist | null, string>({
  key: RecoilKeys.PLAYLIST_SELECTOR,
  get:
    (id) =>
    ({ get }) => {
      const playlists = get(playlistsState);
      return playlists[id] || null;
    },
  set:
    (id) =>
    ({ get, set }, newPlaylist: Playlist) => {
      const playlists = get(playlistsState);
      set(playlistsState, update(playlists, { [id]: { $set: newPlaylist } }));
    },
});
