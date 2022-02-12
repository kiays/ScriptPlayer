import React, { useState } from "react";
import { Box, TextField, Button, List } from "@mui/material";
import TrackPickModal from "./TrackPickModal";
import { useRecoilState, useRecoilValue } from "recoil";
import { tracksState } from "../../states/tracks";
import update from "immutability-helper";
import { playlistsState } from "../../states/playlists";
import TrackRow from "./Track";

const PlaylistNew = () => {
  const [editing, setEditing] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState("New Playlist");
  const trackDict = useRecoilValue(tracksState);
  const [tracks, setTracks] = useState([]);
  const [allPlaylists, setPlaylists] = useRecoilState(playlistsState);
  const addTrack = (hash) => {
    setTracks((t) => update(t, { $push: [{ hash, id: Date.now() }] }));
  };
  const removeTrack = (id) => {
    setTracks((t) => t.filter((tr) => tr.id != id));
  };
  const moveTrack = (dragIndex, hoverIndex) => {
    setTracks((p) =>
      update(p, {
        $splice: [
          [dragIndex, 1],
          [hoverIndex, 0, p[dragIndex]],
        ],
      })
    );
  };

  const save = () => {
    const id = String(Date.now());
    setPlaylists({
      ...allPlaylists,
      [id]: {
        name,
        id,
        tracks,
        createdAt: Date.now(),
      },
    });
  };

  return (
    <Box onClick={() => setEditing(false)} sx={{ height: "100%" }}>
      <TrackPickModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        addTrack={addTrack}
      />
      {editing ? (
        <TextField
          defaultValue={name}
          onChange={(e) => setName(e.target.value)}
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <h1
          onClick={(e) => {
            setEditing(true);
            e.stopPropagation();
          }}>
          {name}
        </h1>
      )}
      <Button onClick={() => setModalOpen(true)}>add track</Button>
      <Button onClick={() => save()} disabled={tracks.length == 0}>
        save
      </Button>
      <List>
        {tracks.map(({ hash, id }, index) => {
          const track = trackDict[hash];
          if (!track) return null;
          return (
            <TrackRow
              {...{ track, id, index, removeTrack, moveTrack }}
              key={id}
            />
          );
        })}
      </List>
    </Box>
  );
};

export default PlaylistNew;
