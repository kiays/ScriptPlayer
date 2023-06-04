import React from "react";
import { Avatar, Box } from "@mui/material";
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
      name: "アイコン",
      render: (work) => <Avatar src={work.thumbnailPath} variant="square" />,
    },
    name: {
      order: 1,
      sortable: true,
      name: "作品名",
    },
    numTracks: {
      order: 2,
      sortable: true,
      comparator: (a, b) => a.trackIds.length - b.trackIds.length,
      name: "トラック数",
      render: (work) => `${work.trackIds.length} tracks`,
    },
    addedAt: {
      order: 3,
      sortable: true,
      name: "追加日",
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
