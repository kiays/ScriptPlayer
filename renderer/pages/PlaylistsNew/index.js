import React, { useRef, useState } from "react";
import {
  Box,
  TextField,
  Button,
  ListItem,
  ListItemText,
  List,
  ListItemButton,
} from "@mui/material";
import TrackPickModal from "./TrackPickModal";
import { useRecoilValue } from "recoil";
import { tracksState } from "../../states/tracks";
import update from "immutability-helper";
import { useDrag, useDrop } from "react-dnd";

const Track = ({ track, id, index, moveTrack, removeTrack }) => {
  const ref = useRef(null);
  const [{ handlerId }, drop] = useDrop({
    accept: "TRACK",
    collect(monitor) {
      return { handlerId: monitor.getHandlerId() };
    },
    hover(item, monitor) {
      // https://github.com/react-dnd/react-dnd/blob/main/packages/examples/src/04-sortable/simple/Card.tsx
      if (!ref.current) return;
      const dragIndex = item.index;
      const hoverIndex = index;
      console.log(item, item.index, index);
      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return;
      }

      // Determine rectangle on screen
      const hoverBoundingRect = ref.current.getBoundingClientRect();

      // Get vertical middle
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

      // Determine mouse position
      const clientOffset = monitor.getClientOffset();

      // Get pixels to the top
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;

      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%

      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }

      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }
      moveTrack(dragIndex, hoverIndex);

      item.index = index;
    },
  });
  const [{ isDragging }, drag] = useDrag({
    type: "TRACK",
    item: () => {
      return { id, index };
    },
    collect: (monitor) => ({ isDragging: monitor.isDragging }),
  });
  drag(drop(ref));
  return (
    <ListItem ref={ref}>
      <ListItemText primary={track.name} />
      <ListItemButton onClick={() => removeTrack(id)}>
        <Button>Delete</Button>
      </ListItemButton>
    </ListItem>
  );
};

const PlaylistNew = () => {
  const [editing, setEditing] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState("New Playlist");
  const trackDict = useRecoilValue(tracksState);
  const [tracks, setTracks] = useState([]);
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
          }}
        >
          {name}
        </h1>
      )}
      <Button onClick={() => setModalOpen(true)}>add track</Button>
      <List>
        {tracks.map(({ hash, id }, index) => {
          const track = trackDict[hash];
          if (!track) return null;
          return (
            <Track
              {...{ track, id, index, index, removeTrack, moveTrack }}
              key={id}
            />
          );
        })}
      </List>
    </Box>
  );
};

export default PlaylistNew;
