import React, { useState } from "react";
import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  Modal,
  Box,
  Checkbox,
  ListItemText,
  Collapse,
} from "@mui/material";
import FileTypeIcon from "./FileTypeIcon";
import { ExpandMore, ExpandLess } from "@mui/icons-material";
import update from "immutability-helper";
import { FileInfo } from "../../types";

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

type LightBoxProps = {
  open: boolean;
  onClose: () => void;
  src: string;
};
const LightBox = ({ open, onClose, src }: LightBoxProps) => (
  <Modal
    open={open}
    onClose={onClose}
    aria-labelledby="modal-modal-title"
    aria-describedby="modal-modal-description">
    <Box sx={style}>
      <img
        src={src}
        loading="lazy"
        style={{ objectFit: "contain", maxWidth: "80vw" }}
      />
    </Box>
  </Modal>
);

type ItemProps = {
  fileInfo: FileInfo;
  checked: { [key: string]: boolean };
  setChecked: (
    updater: (prevState: { [key: string]: boolean }) => {
      [key: string]: boolean;
    }
  ) => void;
  nest?: number;
  setThumbnail: (path: string) => void;
  thumbnailPath: string | null;
};
const Item = ({
  fileInfo: { name, path, type, children },
  checked,
  setChecked,
  nest = 0,
  setThumbnail,
  thumbnailPath,
}: ItemProps) => {
  const [open, setOpen] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const isChecked = checked[path] || false;
  const isDir = type == "dir";
  const isImage = type && type.startsWith("image");
  const checkable =
    type && (type.startsWith("audio") || type.startsWith("video"));
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
              <ListItemButton
                aria-label="サムネイルとしてこの画像を指定する"
                onClick={() => setThumbnail(path)}>
                <ListItemText primary="set as thumbnail" />
              </ListItemButton>
            )
          ) : null
        }>
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
          sx={{ pl: 4 * nest }}>
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
