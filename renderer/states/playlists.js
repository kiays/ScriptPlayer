import { ipcRenderer } from "electron";
import { atom, selector } from "recoil";

export const playlistsState = selector({
  key: "playlists",
  get: async ({}) => {
    return await ipcRenderer.invoke("getAllPlaylists");
  },
});

export const currentPlaylistState = atom({
  key: "currentPlaylist",
  default: {
    name: "new",
    tracks: [],
  },
});
