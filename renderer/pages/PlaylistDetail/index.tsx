import { Box, IconButton, Rating, Tooltip } from "@mui/material";
import { PlayArrow as PlayIcon } from "@mui/icons-material";
import React, { useCallback } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { useParams } from "react-router";
import { playlistSelector } from "../../states/playlists";
import { tracksByPlaylist, tracksState } from "../../states/tracks";
import { formatTime } from "../../utils";
import update from "immutability-helper";
import { readFile } from "../../utils";
import { playerState } from "../../states/player";
import FileDropArea from "../../components/FileDropArea";
import EditableHeader from "../../components/EditableHeader";
import DraggableTable from "../../components/DraggableTable";
import { PlaylistTrack, Track } from "../../types";

type CsvFieldProps = {
  track: PlaylistTrack & Track;
  setCsv: (track: PlaylistTrack & Track, file: File) => void;
};

const CsvField = ({ track, setCsv }: CsvFieldProps) => {
  if (track.csvName) {
    return <div>{track.csvName}</div>;
  }
  return (
    <FileDropArea
      onDrop={(files) => setCsv(track, files[0])}
      fileType="text/csv">
      Drop CSV file here
    </FileDropArea>
  );
};

const PlaylistDetail = () => {
  const { playlistId } = useParams();
  const [playlist, setPlaylist] = useRecoilState(playlistSelector(playlistId));
  const tracks = useRecoilValue(tracksByPlaylist(playlistId));
  const trackDict = useRecoilValue(tracksState);
  const [_player, setPlayerState] = useRecoilState(playerState);

  const setCsv = useCallback(
    async (track: PlaylistTrack, csv) => {
      const csvContentStr = await readFile(csv);
      if (!csvContentStr) {
        return;
      }
      const csvContent = csvContentStr
        .split("\r\n")
        .map((l) => l.split(",").map(Number))
        .map(([time, dir, val]) => [time * 0.1, dir, val]);
      const trackIndex = tracks
        .map((t, i) => ({ ...t, index: i }))
        .filter((t) => t.id == track.id)[0].index;

      setPlaylist(
        update(playlist, {
          tracks: {
            [trackIndex]: {
              csvUrl: { $set: csv.path },
              csvName: { $set: csv.name },
              csvContent: { $set: csvContent },
            },
          },
        })
      );
    },

    [playlist, tracks, setPlaylist]
  );

  const play = (track: Track, index: number) => () => {
    setPlayerState({
      currentTrackId: track.hash,
      trackIndex: index,
      tracks: playlist.tracks.map(({ hash, csvName, csvUrl, csvContent }) => ({
        ...trackDict[hash],
        csvName,
        csvUrl,
        csvContent,
      })),
      playlistPath: location.hash,
      playing: true,
    });
  };
  if (!playlist) return <div>loading</div>;

  const deleteTrack = (id) => {
    const trackIndex = playlist.tracks.findIndex((e) => e.id == id);
    setPlaylist(
      update(playlist, {
        tracks: {
          $unset: [trackIndex],
        },
      })
    );
  };

  const deleteCsvOnTrack = (id) => {
    const trackIndex = playlist.tracks.findIndex((e) => e.id == id);
    setPlaylist(
      update(playlist, {
        tracks: {
          [trackIndex]: {
            csvUrl: { $set: null },
            csvName: { $set: null },
            csvContent: { $set: null },
          },
        },
      })
    );
  };

  const changePlaylistName = (name: string) => {
    setPlaylist({ ...playlist, name });
  };
  const setTrackOrder = (tracks: PlaylistTrack & Track[]) => {
    setPlaylist(update(playlist, { tracks: { $set: tracks } }));
  };
  const setRating = (rating: number) => {
    setPlaylist(update(playlist, { rating: { $set: rating } }));
  };

  const schema = {
    id: { hide: true },
    play: {
      order: 0,
      render: (track: Track, index) => (
        <Tooltip title="ここから再生する">
          <IconButton
            aria-label="プレイリストをここから再生する"
            onClick={(e) => {
              e.stopPropagation();
              play(track, index)();
            }}>
            <PlayIcon />
          </IconButton>
        </Tooltip>
      ),
    },
    name: { order: 1 },
    duration: { order: 2, render: (track) => formatTime(track.duration) },
    csv: {
      order: 3,
      render: (track: PlaylistTrack & Track) => (
        <CsvField track={track} setCsv={setCsv} />
      ),
    },
    hash: { hide: true },
    sheetId: { hide: true },
    csvUrl: { hide: true },
    csvName: { hide: true },
    csvContent: { hide: true },
    $onContextMenu: {
      プレイリストからこのトラックを削除する: deleteTrack,
      このトラックのCSVファイルを削除する: (id) => deleteCsvOnTrack(id),
    },
    $onRowClicked: () => {
      // const track = tracks.find((t) => t.id == id);
      // navigate(`/tracks/${track.hash}`);
    },
  };
  return (
    <Box>
      <span style={{ fontSize: 30 }}>Playlist:</span>
      <EditableHeader
        text={playlist.name}
        onChange={changePlaylistName}
        style={{ display: "inline" }}
      />
      <Box>
        <Rating
          value={playlist.rating}
          onChange={(_e, value) => setRating(value)}
        />
      </Box>
      <DraggableTable items={tracks} onSort={setTrackOrder} schema={schema} />
    </Box>
  );
};

export default PlaylistDetail;
