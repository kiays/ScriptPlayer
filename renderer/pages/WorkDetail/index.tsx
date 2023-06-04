import {
  Box,
  IconButton,
  Rating,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
} from "@mui/material";
import { PlayArrow as PlayIcon } from "@mui/icons-material";
import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { useRecoilState, useRecoilValue } from "recoil";
import { tracksState } from "../../states/tracks";
import {
  currentWorkIdState,
  currentWorkState,
  worksState,
} from "../../states/works";
import { formatTime } from "../../utils";
import { playerState } from "../../states/player";
import EditableHeader from "../../components/EditableHeader";
import update from "immutability-helper";
import { Track } from "../../types";
const WorkDetail = () => {
  const navigate = useNavigate();
  const { workId } = useParams();
  const [currentWorkId, setCurrentWork] = useRecoilState(currentWorkIdState);
  const work = useRecoilValue(currentWorkState);
  const [allWorks, setAllWorks] = useRecoilState(worksState);
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

  const changeTitle = (title: string) => {
    setAllWorks(
      update(allWorks, { [currentWorkId]: { name: { $set: title } } })
    );
  };
  const changeRating = (rating: number) => {
    setAllWorks(
      update(allWorks, { [currentWorkId]: { rating: { $set: rating } } })
    );
  };

  if (!work || !tracks) return <div>loading...</div>;
  const { thumbnailPath, trackIds } = work;
  return (
    <Box>
      <Stack direction="row" spacing={2}>
        <EditableHeader text={work.name} onChange={changeTitle} />
        <img src={thumbnailPath} style={{ width: "25%" }} />
      </Stack>
      <Rating
        value={work.rating}
        onChange={(_e, value) => changeRating(value)}
      />
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
                  <Tooltip title="ここから再生する">
                    <IconButton onClick={play(track, index)}>
                      <PlayIcon />
                    </IconButton>
                  </Tooltip>
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
