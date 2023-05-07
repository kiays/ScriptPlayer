import React from "react";
import { Avatar, Box } from "@mui/material";
import { useRecoilState } from "recoil";
import { worksState } from "../../states/works";
import { useNavigate } from "react-router";
import SortableTable from "../../components/SortableTable";
import { Work } from "../../types";

const Works = () => {
  const works = useRecoilState(worksState)[0];
  const navigate = useNavigate();
  const schema = {
    trackIds: { hide: true },
    thumbnailPath: {
      order: 0,
      name: "icon",
      render: (work) => <Avatar src={work.thumbnailPath} variant="square" />,
    },
    name: { order: 1, sortable: true },
    numTracks: {
      order: 2,
      sortable: true,
      comparator: (a, b) => a.trackIds.length - b.trackIds.length,
      name: "# of tracks",
      render: (work) => `${work.trackIds.length} tracks`,
    },
    addedAt: { hide: true },
    $onRowClicked: (key) => navigate(`/works/${key}`),
  };
  return (
    <Box>
      <h1>Works</h1>
      <SortableTable<Work> data={works} schema={schema} sortable />
    </Box>
  );
};
export default Works;
