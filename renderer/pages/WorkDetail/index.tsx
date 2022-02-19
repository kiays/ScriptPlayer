import {
  Box,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import { PlayArrow as PlayIcon } from "@mui/icons-material";
import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { useRecoilState, useRecoilValue } from "recoil";
import { tracksState } from "../../states/tracks";
import { currentWorkIdState, currentWorkState } from "../../states/works";
import { formatTime } from "../../utils";
import { playerState } from "../../states/player";

const WorkDetail = () => {
  const navigate = useNavigate();
  const { workId } = useParams();
  const [currentWorkId, setCurrentWork] = useRecoilState(currentWorkIdState);
  const work = useRecoilValue(currentWorkState);
  const tracks = useRecoilValue(tracksState);
  const [_player, setPlayerState] = useRecoilState(playerState);
  useEffect(() => {
    if (workId != currentWorkId) {
      setCurrentWork(workId);
    }
  }, [workId, currentWorkId, setCurrentWork]);

  const play = (track: Track, index: number) => (e) => {
    e.stopPropagation();
    setPlayerState({
      currentTrackId: track.hash,
      trackIndex: index,
      tracks: trackIds.map((id) => tracks[id]),
      playlistPath: location.hash,
      playing: true,
    });
  };

  if (!work || !tracks) return <div>loading...</div>;
  const { thumbnailPath, trackIds } = work;
  return (
    <Box>
      <Stack direction="row" spacing={2}>
        <h1>{currentWorkId}</h1>
        <img src={thumbnailPath} style={{ width: "25%" }} />
      </Stack>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell></TableCell>

            <TableCell>name</TableCell>
            <TableCell>duration</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {trackIds.map((id, index) => {
            const track = tracks[id];
            if (!track) return null;
            return (
              <TableRow
                key={id}
                onClick={() => navigate(`/tracks/${track.hash}`)}
                hover>
                <TableCell>
                  <IconButton onClick={play(track, index)}>
                    <PlayIcon />
                  </IconButton>
                </TableCell>
                <TableCell>{track.name}</TableCell>
                <TableCell>{formatTime(track.duration)}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Box>
  );
};
export default WorkDetail;
