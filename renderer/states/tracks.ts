import { atom, selectorFamily, selector } from "recoil";
import RecoilKeys from "./keys";
import { playlistSelector } from "./playlists";
import { worksState } from "./works";
import update from "immutability-helper";
import {
  AllTracks,
  AllTracksWithWork,
  PlaylistTrack,
  Track,
  TrackWithWork,
} from "../types";

const ipcEffect = ({ setSelf, onSet }) => {
  window.mainProc.getAllTracks().then(setSelf);
  onSet(async (newValue, _prevValue, _isReset) => {
    await window.mainProc.setAllTracks(newValue);
  });
};
export const tracksState = atom<AllTracks>({
  key: RecoilKeys.TRACKS,
  default: {},
  effects: [ipcEffect],
});

export const tracksWithWork = selector<AllTracksWithWork>({
  key: RecoilKeys.TRACKS_WITH_WORK,
  get: ({ get }) => {
    const worksDict = get(worksState);
    const tracks = get(tracksState);
    return Object.keys(tracks).reduce((acc, hash) => {
      const track = tracks[hash];
      const work = worksDict[track.workName];
      return { ...acc, [hash]: { ...track, work } };
    }, {});
  },
});

export const tracksByPlaylist = selectorFamily<
  Array<PlaylistTrack & Track>,
  string
>({
  key: RecoilKeys.TRACKS_BY_PLAYLIST,
  get:
    (id) =>
    ({ get }) => {
      const trackDict = get(tracksState);
      const playlist = get(playlistSelector(id));
      if (!playlist) return [];
      if ("nodes" in playlist) return [];
      return playlist.tracks
        .filter(Boolean)
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

export const trackById = selectorFamily<TrackWithWork | null, string>({
  key: RecoilKeys.TRACK_BY_ID,
  get:
    (id: string) =>
    ({ get }) => {
      const tracksDict = get(tracksState);
      const track = tracksDict[id];
      if (!track) return null;
      const worksDict = get(worksState);
      const work = worksDict[track.workName];
      return {
        ...track,
        work,
      };
    },
  set:
    (trackId: string) =>
    ({ set, get }, newTrack: TrackWithWork) => {
      const tracksDict = get(tracksState);
      const { name, id, hash, path, duration, workName, sheetIds, numPlayed } =
        newTrack;
      set(
        tracksState,
        update(tracksDict, {
          [trackId]: {
            $set: {
              name,
              id,
              hash,
              path,
              duration,
              workName,
              sheetIds,
              numPlayed,
            },
          },
        })
      );
    },
});
