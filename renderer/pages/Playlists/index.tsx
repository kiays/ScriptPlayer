import { Box, Button } from "@mui/material";
import React from "react";
import { useNavigate } from "react-router";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { playlistsState } from "../../states/playlists";
import { tracksState } from "../../states/tracks";
import { formatDate, formatTime } from "../../utils";
import SortableTable from "../../components/SortableTable";

const Playlists = () => {
  const navigate = useNavigate();
  const playlists = useRecoilValue(playlistsState);
  const trackDict = useRecoilValue(tracksState);
  const setPlayLists = useSetRecoilState(playlistsState);
  if (playlists === null) return <div>Loading...</div>;

  const createPlaylist = () => {
    navigate("/playlists/new");
  };
  const selectPlaylist = (id) => {
    navigate(`/playlists/${id}`);
  };

  const schema = {
    id: {
      order: 0,
      name: "#",
      sortable: true,
      render: (playlist) => playlist.index + 1,
    },
    name: {
      order: 1,
      name: "name",
      sortable: true,
    },
    tracks: {
      order: 2,
      name: "tracks",
      sortable: true,
      render: (playlist) => playlist.tracks.length,
    },
    duration: {
      order: 3,
      name: "duration",
      sortable: false,
      render: (playlist) => {
        const duration = playlist.tracks
          .map(({ hash }) => trackDict[hash])
          .filter(Boolean)
          .reduce((acc, t) => acc + t.duration, 0);
        return formatTime(duration);
      },
    },
    createdAt: {
      order: 4,
      name: "Created At",
      sortable: true,
      render: (playlist) => formatDate(playlist.createdAt),
    },
    $onRowClicked: (id) => selectPlaylist(Object.keys(playlists)[id]),
    $onContextMenu: {
      Delete: (index) => {
        const id = Object.keys(playlists)[index];
        setPlayLists((playlists) => {
          const newPlaylists = { ...playlists };
          delete newPlaylists[id];
          return newPlaylists;
        });
      },
    },
  };

  return (
    <Box>
      <h1>Playlists</h1>
      <Button onClick={createPlaylist}>New Playlist</Button>
      {playlists ? (
        <SortableTable
          data={Object.keys(playlists).map((id, index) => ({
            id,
            index,
            ...playlists[id],
          }))}
          schema={schema}
          sortable={true}
        />
      ) : (
        <div>プレイリストが存在しません</div>
      )}
    </Box>
  );
};

export default Playlists;
