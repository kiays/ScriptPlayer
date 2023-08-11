import { atom, selectorFamily } from "recoil";
import RecoilKeys from "./keys";
import update from "immutability-helper";
import { AllPlaylists, GraphPlaylist, Playlist } from "../types";

import { testPlaylist } from "../pages/GraphPlaylistDetail/testdata";

const ipcEffect = ({ setSelf, onSet }) => {
  window.mainProc.getAllPlaylists().then(setSelf);
  onSet(async (newValue: AllPlaylists) => {
    await window.mainProc.setAllPlaylists(newValue);
  });
};

export const playlistsState = atom<AllPlaylists>({
  key: RecoilKeys.PLAYLISTS,
  default: {},
  effects: [ipcEffect],
});

export const playlistSelector = selectorFamily<
  Playlist | GraphPlaylist | null,
  string
>({
  key: RecoilKeys.PLAYLIST_SELECTOR,
  get:
    (id) =>
    ({ get }) => {
      if (id === "test-graph-playlist") {
        return testPlaylist;
      }
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
