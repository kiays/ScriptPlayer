import { ipcRenderer } from "electron";
import { atom, selectorFamily } from "recoil";
import RecoilKeys from "./keys";
import update from "immutability-helper";

const ipcEffect = ({ setSelf, onSet }) => {
  ipcRenderer.invoke("getAllPlaylists").then(setSelf);
  onSet(async (newValue, _prevValue, _isReset) => {
    console.log("onSet: ", newValue);
    await ipcRenderer.invoke("setAllPlaylists", newValue);
  });
};

export const playlistsState = atom({
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
    ({ get, set }, newPlaylist) => {
      const playlists = get(playlistsState);
      set(playlistsState, update(playlists, { [id]: { $set: newPlaylist } }));
    },
});
