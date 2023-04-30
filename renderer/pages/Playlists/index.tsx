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
  Menu,
  MenuItem,
} from "@mui/material";
import React, { useState } from "react";
import { useNavigate } from "react-router";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { playlistsState } from "../../states/playlists";
import { tracksState } from "../../states/tracks";
import { formatDate, formatTime } from "../../utils";
import {
  usePopupState,
  bindContextMenu,
  bindMenu,
} from "material-ui-popup-state/hooks";

const Playlists = () => {
  const navigate = useNavigate();
  const playlists = useRecoilValue(playlistsState);
  const trackDict = useRecoilValue(tracksState);
  const setPlayLists = useSetRecoilState(playlistsState);
  const popupState = usePopupState({ variant: "popover", popupId: "playlist" });
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const createPlaylist = () => {
    navigate("/playlists/new");
  };
  const selectPlaylist = (id) => {
    navigate(`/playlists/${id}`);
  };

  const handleContextMenu = (id: string) => {
    const { onContextMenu } = bindContextMenu(popupState);
    return (e) => {
      setSelectedId(id);
      onContextMenu(e);
    };
  };

  const deletePlaylist = () => {
    setPlayLists((playlists) => {
      const newPlaylists = { ...playlists };
      delete newPlaylists[selectedId];
      return newPlaylists;
    });
    popupState.close();
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
                <TableRow
                  key={id}
                  onClick={() => selectPlaylist(id)}
                  onContextMenu={handleContextMenu(id)}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{playlist.name}</TableCell>
                  <TableCell>{playlist.tracks.length}</TableCell>
                  <TableCell>{formatTime(duration)}</TableCell>
                  <TableCell>{formatDate(playlist.createdAt)}</TableCell>
                </TableRow>
              );
            })}
            <Menu
              {...bindMenu(popupState)}
              anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
              transformOrigin={{ vertical: "top", horizontal: "left" }}>
              <MenuItem onClick={deletePlaylist}>Delete {selectedId}</MenuItem>
            </Menu>
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default Playlists;
