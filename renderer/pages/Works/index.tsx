import React, { useState } from "react";
import {
  Avatar,
  Box,
  InputAdornment,
  Rating,
  TextField,
  IconButton,
} from "@mui/material";
import { useRecoilValue } from "recoil";
import { worksState } from "../../states/works";
import { useNavigate } from "react-router";
import SortableTable from "../../components/SortableTable";
import { Work } from "../../types";
import {
  Search as SearchIcon,
  Cancel as CancelIcon,
} from "@mui/icons-material";

const Works = () => {
  const works = useRecoilValue(worksState);
  const [searchText, setSearchText] = useState("");
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
      order: 2,
      sortable: true,
      name: "評価",
      render: (work) => <Rating value={work.rating} readOnly />,
    },
    numTracks: {
      order: 3,
      sortable: true,
      comparator: (a, b) => a.trackIds.length - b.trackIds.length,
      name: "トラック数",
      width: "10rem",
      render: (work) => `${work.trackIds.length} tracks`,
    },
    addedAt: {
      order: 4,
      sortable: true,
      name: "追加日",
      width: "8rem",
      render: (work) => new Date(work.addedAt).toLocaleDateString(),
    },
    $onRowClicked: (key) => navigate(`/works/${key}`),
  };
  const filteredWorks = Object.fromEntries(
    Object.entries(works).filter(([_key, work]) =>
      searchText ? work.name.includes(searchText) : true
    )
  );
  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}>
        <h1>Works</h1>
        <TextField
          onChange={(e) => setSearchText(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                {searchText && (
                  <IconButton onClick={() => setSearchText("")}>
                    <CancelIcon />
                  </IconButton>
                )}
              </InputAdornment>
            ),
          }}
        />
      </Box>
      <SortableTable<Work>
        data={filteredWorks}
        schema={schema}
        sortable
        defaultSearchParams={new URLSearchParams("order=asc&orderBy=addedAt")}
      />
    </Box>
  );
};
export default Works;
