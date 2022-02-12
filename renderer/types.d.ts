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
};

type Work = {
  trackIds: Array<string>;
  thumbnailPath: string;
  name: string;
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
type TimeSheetData = Array<TimeSheetPoint>;
type TimeSheet = {
  hash: TimeSheetHashID;
  path: string;
  name: string;
  content: TimeSheetData;
};
