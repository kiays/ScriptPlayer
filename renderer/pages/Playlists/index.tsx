import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import React from "react";
import { useNavigate } from "react-router";
import { useRecoilValue } from "recoil";
import { playlistsState } from "../../states/playlists";
import { tracksState } from "../../states/tracks";
import { formatDate, formatTime } from "../../utils";

const Playlists = () => {
  const navigate = useNavigate();
  const playlists = useRecoilValue(playlistsState);
  const trackDict = useRecoilValue(tracksState);

  const createPlaylist = () => {
    navigate("/playlists/new");
  };
  const selectPlaylist = (id) => {
    navigate(`/playlists/${id}`);
  };
  return (
    <Box>
      <h1>Playlists</h1>
      <Button onClick={createPlaylist}>New Playlist</Button>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>name</TableCell>
              <TableCell>tracks</TableCell>
              <TableCell>duration</TableCell>
              <TableCell>created at</TableCell>
              <TableCell># of playing</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.keys(playlists).map((id, index) => {
              const playlist = playlists[id];
              const duration = playlist.tracks
                .map(({ hash }) => trackDict[hash])
                .filter(Boolean)
                .reduce((acc, t) => acc + t.duration, 0);
              return (
                <TableRow key={id} onClick={() => selectPlaylist(id)}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{playlist.name}</TableCell>
                  <TableCell>{playlist.tracks.length}</TableCell>
                  <TableCell>{formatTime(duration)}</TableCell>
                  <TableCell>{formatDate(playlist.createdAt)}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default Playlists;
