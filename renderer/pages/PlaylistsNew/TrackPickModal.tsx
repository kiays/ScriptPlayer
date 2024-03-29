import React, { useState } from "react";
import {
  Modal,
  Box,
  ListItemButton,
  ListItemText,
  ListItemAvatar,
  Avatar,
  List,
  IconButton,
  ListItem,
} from "@mui/material";
import { useRecoilValue } from "recoil";
import { tracksState } from "../../states/tracks";
import { worksState } from "../../states/works";
import { Add } from "@mui/icons-material";
import { ArrowBack } from "@mui/icons-material";
import { Track, Work } from "../../types";

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

type WorkListProps = {
  works: { [key: string]: Work };
  setWorkId: (workId: string) => void;
};
const WorkList = ({ works, setWorkId }: WorkListProps) => {
  return (
    <List sx={{ height: "100%", overflowY: "scroll" }}>
      {Object.keys(works).map((workId) => {
        const work = works[workId];
        if (!work) return null;
        return (
          <ListItemButton
            aria-label="トラック選択モーダルで作品を開く"
            onClick={() => setWorkId(workId)}
            key={workId}>
            <ListItemAvatar>
              <Avatar src={work.thumbnailPath} variant="square" />
            </ListItemAvatar>
            <ListItemText primary={workId} />
          </ListItemButton>
        );
      })}
    </List>
  );
};

type TrackListProps = {
  works: { [key: string]: Work };
  workId: string;
  trackDict: { [key: string]: Track };
  addTrack: (hash: string) => void;
  onBack: () => void;
};
const TrackList = ({
  works,
  workId,
  trackDict,
  addTrack,
  onBack,
}: TrackListProps) => {
  const work = works[workId];
  if (!work) return null;
  const tracks = work.trackIds.map((id) => trackDict[id]);

  return (
    <>
      <IconButton aria-label="トラック選択モーダル中で戻る" onClick={onBack}>
        <ArrowBack />
      </IconButton>
      <List sx={{ height: "100%", overflowY: "scroll" }}>
        {tracks.map((track) => {
          return (
            <ListItem
              key={track.hash}
              secondaryAction={
                <IconButton
                  aria-label="プレイリストにトラックを追加する"
                  onClick={() => addTrack(track.hash)}>
                  <Add />
                </IconButton>
              }>
              <ListItemText primary={track.name} />
            </ListItem>
          );
        })}
      </List>
    </>
  );
};

type TrackPickModalProps = {
  onClose: () => void;
  open: boolean;
  addTrack: (hash: string) => void;
};
const TrackPickModal = ({ onClose, open, addTrack }: TrackPickModalProps) => {
  const [currentWorkId, setWorkId] = useState(null);
  const trackDict = useRecoilValue(tracksState);
  const works = useRecoilValue(worksState);

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={{ ...style, height: "80%" }}>
        {currentWorkId == null ? (
          <WorkList works={works} setWorkId={setWorkId} />
        ) : (
          <TrackList
            onBack={() => setWorkId(null)}
            works={works}
            workId={currentWorkId}
            trackDict={trackDict}
            addTrack={addTrack}
          />
        )}
      </Box>
    </Modal>
  );
};
export default TrackPickModal;
