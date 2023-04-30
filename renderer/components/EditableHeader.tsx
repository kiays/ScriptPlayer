import { TextField, Typography } from "@mui/material";
import React, { useState } from "react";

type EditableHeaderProps = {
  text: string;
  onChange: (text: string) => void;
  style?: React.CSSProperties;
};
const EditableHeader = ({
  text,
  onChange,
  style = {},
}: EditableHeaderProps) => {
  const [editing, setEditing] = useState(false);
  const [newText, setText] = useState(text);
  if (editing) {
    const finishEditing = () => {
      setEditing(false);
      onChange(newText);
    };
    return (
      <TextField
        fullWidth
        multiline
        autoFocus
        defaultValue={text}
        onKeyDown={(e) => e.key == "Enter" && finishEditing()}
        inputProps={{ style: { ...style, fontSize: 24 } }}
        onClick={(e) => e.stopPropagation()}
        onChange={(e) => setText(e.target.value)}
        onBlur={() => {
          finishEditing();
        }}
      />
    );
  }

  return (
    <Typography
      component="h1"
      variant="h4"
      style={style}
      onClick={(e) => {
        setEditing(true);
        e.stopPropagation();
      }}>
      {text}
    </Typography>
  );
};
export default EditableHeader;
