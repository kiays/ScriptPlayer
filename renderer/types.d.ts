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
