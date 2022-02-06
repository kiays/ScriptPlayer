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
import { useRecoilState, useRecoilValue } from "recoil";
import { playlistsState } from "../../states/playlists";
import { tracksState } from "../../states/tracks";
import { worksState } from "../../states/works";
import { formatTime } from "../../utils";
import { format, fromUnixTime } from "date-fns";
const Playlists = () => {
  const navigate = useNavigate();
  const [playlists, setPlaylists] = useRecoilState(playlistsState);
  const trackDict = useRecoilValue(tracksState);
  const worksDict = useRecoilValue(worksState);

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
                  <TableCell>
                    {format(
                      fromUnixTime(playlist.createdAt * 0.001 || 0),
                      "yyyy-MM-dd"
                    )}
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

export default Playlists;
