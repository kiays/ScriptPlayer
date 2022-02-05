import { Box, List, ListItem, ListItemText } from "@mui/material";
import React, { useEffect } from "react";
import { useParams } from "react-router";
import { useRecoilState, useRecoilValue } from "recoil";
import { tracksState } from "../../states/tracks";
import { currentWorkIdState, currentWorkState } from "../../states/works";
import { formatTime } from "../../utils";

const WorkDetail = () => {
  const { workId } = useParams();
  const [currentWorkId, setCurrentWork] = useRecoilState(currentWorkIdState);
  const work = useRecoilValue(currentWorkState);
  const tracks = useRecoilValue(tracksState);
  useEffect(() => {
    if (workId != currentWorkId) {
      setCurrentWork(workId);
    }
  }, [workId, currentWorkId, setCurrentWork]);

  if (!work || !tracks) return <div>loading...</div>;
  const { thumbnailPath, trackIds } = work;
  return (
    <Box>
      <h1>{currentWorkId}</h1>
      <img src={thumbnailPath} />
      <List>
        {trackIds.map((id) => {
          const track = tracks[id];
          if (!track) return null;
          console.log(track, tracks, id);
          return (
            <ListItem key={id}>
              <ListItemText primary={track.name} />
              <ListItemText primary={formatTime(track.duration)} />
            </ListItem>
          );
        })}
      </List>
    </Box>
  );
};
export default WorkDetail;
