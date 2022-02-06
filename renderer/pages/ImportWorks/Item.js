import React, { useState } from "react";
import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  IconButton,
  Modal,
  Typography,
  Box,
  Checkbox,
  ListItemText,
  Collapse,
} from "@mui/material";
import FileTypeIcon from "./FileTypeIcon";
import { ExpandMore, ExpandLess } from "@mui/icons-material";
import update from "immutability-helper";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};
const LightBox = ({ open, onClose, src }) => (
  <Modal
    open={open}
    onClose={onClose}
    aria-labelledby="modal-modal-title"
    aria-describedby="modal-modal-description"
  >
    <Box sx={style}>
      <img
        src={src}
        loading="lazy"
        style={{ objectFit: "contain", maxWidth: "80vw" }}
      />
    </Box>
  </Modal>
);

const Item = ({
  fileInfo: { name, path, type, children },
  checked,
  setChecked,
  nest = 0,
  setThumbnail,
  thumbnailPath,
}) => {
  const [open, setOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const isChecked = checked[path] || false;
  const isDir = type == "dir";
  const isImage = type && type.startsWith("image");
  const checkable = type && type.startsWith("audio");
  const handleClick = () => {
    if (isDir) {
      setOpen(!open);
      return;
    }
    if (type && type.startsWith("image")) {
      setModalOpen(true);
    }
  };
  return (
    <>
      <ListItem
        key={path}
        disablePadding
        secondaryAction={
          isImage ? (
            path == thumbnailPath ? (
              <ListItemText
                primary="thumbnail"
                sx={{ bgColor: "primary.main" }}
              />
            ) : (
              <ListItemButton onClick={() => setThumbnail(path)}>
                <ListItemText primary="set as thumbnail" />
              </ListItemButton>
            )
          ) : null
        }
      >
        {isImage && (
          <LightBox
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            src={path}
          />
        )}
        <ListItemButton
          role={undefined}
          dense
          onClick={handleClick}
          sx={{ pl: 4 * nest }}
        >
          <ListItemIcon>
            <Checkbox
              edge="start"
              checked={isChecked}
              disabled={!checkable}
              tabIndex={-1}
              disableRipple
              onChange={() =>
                setChecked((s) => update(s, { [path]: { $set: !isChecked } }))
              }
            />
          </ListItemIcon>
          <ListItemIcon>
            <FileTypeIcon type={type} />
          </ListItemIcon>
          <ListItemText primary={name} />
          {isDir && (open ? <ExpandLess /> : <ExpandMore />)}
        </ListItemButton>
      </ListItem>
      {isDir && (
        <Collapse in={open} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {children.map((c) => (
              <Item
                key={c.path}
                fileInfo={c}
                checked={checked}
                setChecked={setChecked}
                thumbnailPath={thumbnailPath}
                setThumbnail={setThumbnail}
                nest={nest + 1}
              />
            ))}
          </List>
        </Collapse>
      )}
    </>
  );
};
export default Item;
