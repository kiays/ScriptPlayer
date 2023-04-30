import {
  Box,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableContainer,
  TableBody,
  Paper,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import { PlayArrow as PlayIcon } from "@mui/icons-material";
import React, { useCallback, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { useParams, useNavigate } from "react-router";
import { playlistSelector } from "../../states/playlists";
import { tracksByPlaylist, tracksState } from "../../states/tracks";
import { formatTime } from "../../utils";
import update from "immutability-helper";
import { readFile } from "../../utils";
import { playerState } from "../../states/player";
import FileDropArea from "../../components/FileDropArea";
import {
  usePopupState,
  bindContextMenu,
  bindMenu,
} from "material-ui-popup-state/hooks";
import EditableHeader from "../../components/EditableHeader";

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

type TrackRowProps = {
  track: Track;
  index: number;
  navigate: (path: string) => void;
  play: (track: Track, index: number) => () => void;
  setCsv: (track: PlaylistTrack & Track, file: File) => void;
  onContextMenu: (e: React.SyntheticEvent) => void;
};
const TrackRow = ({
  track,
  index,
  navigate,
  play,
  setCsv,
  onContextMenu,
}: TrackRowProps) => {
  return (
    <TableRow
      key={track.id}
      onClick={() => navigate(`/tracks/${track.hash}`)}
      onContextMenu={onContextMenu}>
      <TableCell>
        <IconButton onClick={play(track, index)}>
          <PlayIcon />
        </IconButton>
      </TableCell>
      <TableCell>{index + 1}</TableCell>
      <TableCell>{track.name}</TableCell>
      <TableCell>{formatTime(track.duration)}</TableCell>
      <TableCell>
        <CsvField track={track} setCsv={setCsv} />
      </TableCell>
    </TableRow>
  );
};

const PlaylistDetail = () => {
  const navigate = useNavigate();
  const { playlistId } = useParams();
  const [playlist, setPlaylist] = useRecoilState(playlistSelector(playlistId));
  const tracks = useRecoilValue(tracksByPlaylist(playlistId));
  const trackDict = useRecoilValue(tracksState);
  const [_player, setPlayerState] = useRecoilState(playerState);
  const popupState = usePopupState({
    variant: "popover",
    popupId: "playlistDetail",
  });
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const setCsv = useCallback(
    async (track, csv) => {
      const csvContentStr = await readFile(csv);
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

  const handleContextMenu = (id: number) => {
    const { onContextMenu } = bindContextMenu(popupState);
    return (e) => {
      setSelectedId(id);
      onContextMenu(e);
    };
  };
  const deleteTrack = () => {
    const trackIndex = playlist.tracks.findIndex((e) => e.id == selectedId);
    setPlaylist(
      update(playlist, {
        tracks: {
          $unset: [trackIndex],
        },
      })
    );
    popupState.close();
  };

  const changePlaylistName = (name: string) => {
    setPlaylist({ ...playlist, name });
  }

  return (
    <Box>
      <h1>Playlist: <EditableHeader text={playlist.name} onChange={changePlaylistName} style={{ display: "inline" }} /></h1>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>name</TableCell>
              <TableCell>duration</TableCell>
              <TableCell>CSV</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tracks.map((track, index) => (
              <TrackRow
                key={`${track.id}-${index}`}
                onContextMenu={handleContextMenu(track.id)}
                {...{ track, index, setCsv, play, navigate }}
              />
            ))}
            <Menu
              {...bindMenu(popupState)}
              anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
              transformOrigin={{ vertical: "top", horizontal: "left" }}>
              <MenuItem onClick={deleteTrack}>プレイリストからこのトラックを削除する</MenuItem>
            </Menu>
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default PlaylistDetail;
