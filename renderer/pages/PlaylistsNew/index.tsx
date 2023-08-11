import React, { useState } from "react";
import { Box, TextField, Button, List } from "@mui/material";
import TrackPickModal from "../../components/TrackPickModal";
import { useRecoilState, useRecoilValue } from "recoil";
import { tracksState } from "../../states/tracks";
import update from "immutability-helper";
import { playlistsState } from "../../states/playlists";
import TrackRow from "./Track";
import {
  DndContext,
  useSensor,
  useSensors,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
  arrayMove,
} from "@dnd-kit/sortable";

const PlaylistNew = () => {
  const [editing, setEditing] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [id, _setId] = useState<string | null>(String(Date.now()));
  const [name, setName] = useState("New Playlist");
  const trackDict = useRecoilValue(tracksState);
  const [tracks, setTracks] = useState([]);
  const [allPlaylists, setPlaylists] = useRecoilState(playlistsState);
  const addTrack = (hash) => {
    setTracks((t) =>
      update(t, { $push: [{ hash, id: Date.now() * Math.random() }] })
    );
  };
  const removeTrack = (id) => {
    setTracks((t) => t.filter((tr) => tr.id != id));
  };

  const save = () => {
    setPlaylists({
      ...allPlaylists,
      [id]: {
        name,
        id,
        tracks,
        createdAt: Date.now(),
        rating: null,
      },
    });
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setTracks((items) => {
        const oldIndex = items.findIndex((t) => t.id == active.id);
        const newIndex = items.findIndex((t) => t.id == over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
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
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}>
          <SortableContext
            items={tracks.map((t) => t.id)}
            strategy={verticalListSortingStrategy}>
            {tracks.map(({ hash, id }, index) => {
              const track = trackDict[hash];
              if (!track) return null;
              return (
                <TrackRow {...{ track, id, index, removeTrack }} key={id} />
              );
            })}
          </SortableContext>
        </DndContext>
      </List>
    </Box>
  );
};

export default PlaylistNew;
