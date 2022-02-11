type TrackFile = {
  title: string;
  url: string;
  duration: number;
};
type Track = {
  name: string;
  id: number;
  csvUrl?: string;
  csvName?: string;
  csvContent?: Array<Array<number>>;
  hash: string;
  path: string;
  duration: number;
};

type Work = {
  trackIds: Array<string>;
  thumbnailPath: string;
  name: string;
};
type Playlist = {
  name: string;
  tracks: Array<Track>;
};
