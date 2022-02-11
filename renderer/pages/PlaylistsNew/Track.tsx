import { Button, ListItem, ListItemButton, ListItemText } from "@mui/material";
import React, { useRef } from "react";
import { useDrag, useDrop } from "react-dnd";

type TrackRowPropType = {
  track: Track;
  id: number;
  index: number;
  moveTrack: (dragIndex: number, hoverIndex: number) => void;
  removeTrack: (id: number) => void;
};

type DraggableItem = {
  index: number;
};

const TrackRow = ({
  track,
  id,
  index,
  moveTrack,
  removeTrack,
}: TrackRowPropType) => {
  const ref = useRef(null);
  const [{ handlerId: _ }, drop] = useDrop({
    accept: "TRACK",
    collect(monitor) {
      return { handlerId: monitor.getHandlerId() };
    },
    hover(item: DraggableItem, monitor) {
      // https://github.com/react-dnd/react-dnd/blob/main/packages/examples/src/04-sortable/simple/Card.tsx
      if (!ref.current) return;
      const dragIndex = item.index;
      const hoverIndex = index;
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
  const [_collected, drag] = useDrag({
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

export default TrackRow;
