import { Avatar, Box, Link } from "@mui/material";
import React, { useCallback } from "react";
import { useNavigate } from "react-router";
import { useRecoilValue } from "recoil";
import { tracksWithWork } from "../../states/tracks";
import { formatTime } from "../../utils";
import SortableTable from "../../components/SortableTable";

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

  const schema = {
    icon: {
      name: "icon",
      order: 0,
      render: (track) => (
        <Avatar src={track.work?.thumbnailPath} variant="square" />
      ),
    },
    name: { name: "name", order: 1, sortable: true },
    workName: {
      name: "work",
      order: 2,
      hide: false,
      sortable: true,
      render: (track: TrackWithWork) => (
        <Link onClick={toWorkPage(track)}>{track.workName}</Link>
      ),
    },
    duration: {
      name: "duration",
      order: 3,
      render: (track: TrackWithWork) => formatTime(track.duration),
      sortable: true,
    },
    numPlayed: { name: "# of played", order: 4, hide: false, sortable: true },
    addedAt: {
      name: "added at",
      order: 5,
      hide: true,
      sortable: true,
      render: (track: TrackWithWork) => track.work?.addedAt,
    },
    id: {},
    hash: { hide: true },
    path: { hide: true },
    sheetIds: { hide: true },
    $onRowClicked: (id) => navigate(`/tracks/${id}`),
  };
  return (
    <Box>
      <h1>Track List</h1>
      <SortableTable<TrackWithWork> data={tracks} schema={schema} sortable />
    </Box>
  );
};

export default TrackListPage;
