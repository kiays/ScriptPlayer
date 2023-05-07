import { Button, ListItem, ListItemButton, ListItemText } from "@mui/material";
import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Track } from "../../types";
type TrackRowPropType = {
  track: Track;
  id: number;
  index: number;
  removeTrack: (id: number) => void;
};

const TrackRow = ({ track, id, removeTrack }: TrackRowPropType) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  return (
    <ListItem ref={setNodeRef} style={style} {...listeners} {...attributes}>
      <ListItemText primary={track.name} />
      <ListItemButton onClick={() => removeTrack(id)}>
        <Button>Delete</Button>
      </ListItemButton>
    </ListItem>
  );
};

export default TrackRow;
