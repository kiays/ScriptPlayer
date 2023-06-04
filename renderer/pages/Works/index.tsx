import React from "react";
import { Avatar, Box, Rating } from "@mui/material";
import { useRecoilValue } from "recoil";
import { worksState } from "../../states/works";
import { useNavigate } from "react-router";
import SortableTable from "../../components/SortableTable";
import { Work } from "../../types";

const Works = () => {
  const works = useRecoilValue(worksState);
  const navigate = useNavigate();
  const schema = {
    trackIds: { hide: true },
    thumbnailPath: {
      order: 0,
      name: " ",
      width: "3rem",
      render: (work) => <Avatar src={work.thumbnailPath} variant="square" />,
    },
    name: {
      order: 1,
      sortable: true,
      name: "作品名",
    },
    rating: {
      order: 4,
      sortable: true,
      name: "評価",
      render: (work) => <Rating value={work.rating} readOnly />,
    },
    numTracks: {
      order: 2,
      sortable: true,
      comparator: (a, b) => a.trackIds.length - b.trackIds.length,
      name: "トラック数",
      width: "10rem",
      render: (work) => `${work.trackIds.length} tracks`,
    },
    addedAt: {
      order: 3,
      sortable: true,
      name: "追加日",
      width: "8rem",
      render: (work) => new Date(work.addedAt).toLocaleDateString(),
    },
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
