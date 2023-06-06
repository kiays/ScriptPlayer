import { Avatar, Box, Link } from "@mui/material";
import React, { useCallback } from "react";
import { useNavigate } from "react-router";
import { useRecoilValue } from "recoil";
import { tracksWithWork } from "../../states/tracks";
import { formatTime } from "../../utils";
import SortableTable from "../../components/SortableTable";
import { TrackWithWork } from "../../types";

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
      name: " ",
      order: 0,
      width: "3rem",
      render: (track) => (
        <Avatar src={track.work?.thumbnailPath} variant="square" />
      ),
    },
    name: {
      name: "トラック名",
      order: 1,
      sortable: true,
    },
    workName: {
      name: "音声作品",
      order: 2,
      hide: false,
      sortable: true,
      render: (track: TrackWithWork) => (
        <Link onClick={toWorkPage(track)}>{track.workName}</Link>
      ),
    },
    duration: {
      name: "再生時間",
      order: 3,
      render: (track: TrackWithWork) => formatTime(track.duration),
      sortable: true,
      width: "7.5rem",
    },
    numPlayed: {
      name: "再生回数",
      order: 4,
      hide: false,
      sortable: true,
      width: "7.5rem",
    },
    addedAt: {
      name: "追加日",
      order: 5,
      hide: true,
      sortable: true,
      render: (track: TrackWithWork) => track.work?.addedAt,
    },
    id: { hide: true },
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
