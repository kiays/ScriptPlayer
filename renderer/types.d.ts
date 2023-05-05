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

type PlaylistTrack = {
  id: number;
  hash: TrackHashID;
  sheetId?: TimeSheetHashID;
  csvUrl?: string;
  csvName?: string;
  csvContent?: Array<Array<number>>;
};
type Playlist = {
  name: string;
  tracks: Array<PlaylistTrack>;
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

interface MainProcAPI {
  checkDroppedFile: (path: string) => Promise<any>;
  importWork: (path: string) => Promise<any>;
  getFileHash: (path: string) => Promise<string>;
  readFileAsText: (path: string) => Promise<string>;
  setAllPlaylists: (playlists: any) => Promise<any>;
  getAllPlaylists: () => Promise<any>;
  setAllCSVs: (csvs: any) => Promise<any>;
  getAllCSVs: () => Promise<any>;
  setAllTracks: (tracks: any) => Promise<any>;
  getAllTracks: () => Promise<any>;
  setAllWorks: (works: any) => Promise<any>;
  getAllWorks: () => Promise<any>;
  mainWindowReady: () => void;
  addListener: (name: string, listener: () => void) => void;
  removeListener: (name: string, listener: () => void) => void;
}

interface Window {
  mainProc: MainProcAPI;
}
