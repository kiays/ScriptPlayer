import { atom } from "recoil";
import RecoilKeys from "./keys";
import { PlayerState } from "../types";

export const playerState = atom<PlayerState>({
  key: RecoilKeys.PLAYER_STATE,
  default: {
    currentTrackId: null,
    playlistPath: null,
    tracks: [],
    trackIndex: 0,
    playing: false,
    playlistType: null,
    playlistId: null,
    transitions: [],
  },
});
