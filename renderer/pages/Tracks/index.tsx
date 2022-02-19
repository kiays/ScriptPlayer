import {
  Avatar,
  Box,
  Link,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import React, { useCallback } from "react";
import { useNavigate } from "react-router";
import { useRecoilValue } from "recoil";
import { tracksWithWork } from "../../states/tracks";
import { formatTime } from "../../utils";

const TrackListPage = () => {
  const navigate = useNavigate();
  const tracks = useRecoilValue(tracksWithWork);
  const toWorkPage = useCallback(
    (track: TrackWithWork) => (e: React.MouseEvent<HTMLElement>) => {
      e.stopPropagation();
      navigate(`/works/${track.workName}`);
    },
    [navigate]
  );
  const toTrackPage = useCallback(
    (track: TrackWithWork) => (e: React.MouseEvent<HTMLElement>) => {
      e.stopPropagation();
      navigate(`/tracks/${track.hash}`);
    },
    [navigate]
  );
  return (
    <Box>
      <h1>Track List</h1>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>icon</TableCell>
              <TableCell>name</TableCell>
              <TableCell>work</TableCell>
              <TableCell>duration</TableCell>
              <TableCell># of timesheets</TableCell>
              <TableCell># of played</TableCell>
              <TableCell>added at</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.keys(tracks).map((hash, i) => {
              const track = tracks[hash];
              return (
                <TableRow hover key={hash} onClick={toTrackPage(track)}>
                  <TableCell>{i}</TableCell>
                  <TableCell>
                    <Avatar src={track.work?.thumbnailPath} variant="square" />
                  </TableCell>
                  <TableCell>{track.name}</TableCell>
                  <TableCell>
                    <Link onClick={toWorkPage(track)}>{track.workName}</Link>
                  </TableCell>
                  <TableCell>{formatTime(track.duration)}</TableCell>
                  <TableCell>{track.sheetIds?.length || 0}</TableCell>
                  <TableCell>{track.numPlayed}</TableCell>
                  <TableCell>{track.work?.addedAt}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default TrackListPage;
