import { MimeType } from "file-type";

type FileHash = string;

type TrackFile = {
  title: string;
  url: string;
  duration: number;
};

type TrackHashID = FileHash;
type Track = {
  name: string;
  id: number;
  hash: TrackHashID;
  path: string;
  duration: number;
  workName: string;
  sheetIds: Array<string>;
  numPlayed: number;
};

type Work = {
  trackIds: Array<string>;
  thumbnailPath: string;
  name: string;
  addedAt: number;
};

type TrackWithWork = Track & {
  work?: Work;
};
type All<T> = { [key: string]: T };
type AllTracksWithWork = All<TrackWithWork>;
type AllTracks = All<Track>;
type AllWorks = All<Work>;
type AllPlaylists = All<Playlist>;

type PlaylistTrack = {
  id: number;
  hash: TrackHashID;
  sheetId?: TimeSheetHashID;
  csvUrl?: string;
  csvName?: string;
  csvContent?: Array<Array<number>>;
};
type Playlist = {
  id: string;
  name: string;
  tracks: Array<PlaylistTrack>;
  createdAt: number;
};

type TimeSheetHashID = FileHash;
type TimeSheetPoint = [number, number, number];
type TimeSheetPointLR = [number, number, number, number, number];
type TimeSheetData = Array<TimeSheetPoint | TimeSheetPointLR>;
type TimeSheet = {
  hash: TimeSheetHashID;
  path: string;
  name: string;
  content: TimeSheetData;
};

type TimeSheetsWithWorkAndTrack = TimeSheetMeta & {
  track: Track;
  work: Work;
};

type TimeSheetMeta = Omit<TimeSheet, "content">;
type AllTimeSheets = All<TimeSheetMeta>;

type PlayerState = {
  currentTrackId: string | null;
  playlistPath: string | null;
  tracks: Array<Track & PlaylistTrack>;
  trackIndex: number;
  playing: boolean;
};

type SnackbarNotification = {
  title: string;
  severity: "error" | "warning" | "info" | "success";
  createdAt: Date;
  done: boolean;
  scope: string;
};

type FileInfo = {
  name: string;
  path: string;
  type: "dir" | MimeType | null;
  children?: FileInfo[];
};

interface MainProcAPI {
  checkDroppedFile: (path: string) => Promise<FileInfo[]>;
  importWork: (path: string, shouldCopy: boolean) => Promise<string>;
  getFileHash: (path: string) => Promise<string>;
  readFileAsText: (path: string) => Promise<string>;
  setAllPlaylists: (playlists: AllPlaylists) => Promise<void>;
  getAllPlaylists: () => Promise<AllPlaylists>;
  setAllCSVs: (csvs: AllTimeSheets) => Promise<void>;
  getAllCSVs: () => Promise<AllTimeSheets>;
  setAllTracks: (tracks: AllTracks) => Promise<void>;
  getAllTracks: () => Promise<AllTracks>;
  setAllWorks: (works: AllWorks) => Promise<void>;
  getAllWorks: () => Promise<AllWorks>;
  getJsonDataString: () => Promise<string>;
  mainWindowReady: () => void;
  addListener: (name: string, listener: () => void) => void;
  removeListener: (name: string, listener: () => void) => void;
  openFolder: (path: string) => void;
}

declare global {
  interface Window {
    mainProc: MainProcAPI;
  }
}
