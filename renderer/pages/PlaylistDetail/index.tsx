import {
  Box,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableContainer,
  TableBody,
  Paper,
} from "@mui/material";
import React, { useCallback } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { useParams, useNavigate } from "react-router";
import { playlistsState } from "../../states/playlists";
import { worksState } from "../../states/works";
import { tracksState } from "../../states/tracks";
import { formatTime } from "../../utils";
import Player from "../../components/Player";
import { useDrop } from "react-dnd";
import { NativeTypes } from "react-dnd-html5-backend";
import update from "immutability-helper";
import { readFile } from "../../utils";

const CsvField = ({ track, setCsv }) => {
  const [{ canDrop }, target] = useDrop(
    () => ({
      accept: [NativeTypes.FILE],
      drop(item) {
        if (item.files.length == 1) {
          setCsv(track, item.files[0]);
        }
      },
    }),
    [track, setCsv]
  );
  if (track.csvName) {
    return <div>{track.csvName}</div>;
  }
  return <div ref={target}>Drop csv ...</div>;
};

const PlaylistDetail = () => {
  const { playlistId } = useParams();
  const [playlists, setPlaylists] = useRecoilState(playlistsState);
  const trackDict = useRecoilValue(tracksState);

  const playlist = playlists[playlistId];
  const tracks =
    playlist &&
    playlist.tracks
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

      const newPlaylists = update(playlists, {
        [playlistId]: {
          tracks: {
            [trackIndex]: {
              csvUrl: { $set: csv.path },
              csvName: { $set: csv.name },
              csvContent: { $set: csvContent },
            },
          },
        },
      });
      setPlaylists(newPlaylists);
    },
    [playlist, playlists, tracks]
  );
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
                <TableRow key={track.id}>
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
      <Player tracks={tracks} />
    </Box>
  );
};

export default PlaylistDetail;
