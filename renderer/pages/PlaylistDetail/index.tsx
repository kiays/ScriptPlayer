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
} from "@mui/material";
import { PlayArrow as PlayIcon } from "@mui/icons-material";
import React, { useCallback } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { useParams, useNavigate } from "react-router";
import { playlistSelector } from "../../states/playlists";
import { tracksByPlaylist, tracksState } from "../../states/tracks";
import { formatTime } from "../../utils";
import update from "immutability-helper";
import { readFile } from "../../utils";
import { playerState } from "../../states/player";
import FileDropArea from "../../components/FileDropArea";

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
  const navigate = useNavigate();
  const { playlistId } = useParams();
  const [playlist, setPlaylist] = useRecoilState(playlistSelector(playlistId));
  const tracks = useRecoilValue(tracksByPlaylist(playlistId));
  const trackDict = useRecoilValue(tracksState);
  const [_player, setPlayerState] = useRecoilState(playerState);

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

  return (
    <Box>
      <h1>Playlist: {playlist.name}</h1>
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
            {tracks.map((track, index) => {
              return (
                <TableRow
                  key={track.id}
                  onClick={() => navigate(`/tracks/${track.hash}`)}>
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
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default PlaylistDetail;
