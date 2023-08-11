import { Box, Button } from "@mui/material";
import React from "react";
import { useNavigate } from "react-router";

const GraphPlaylists = () => {
  const navigate = useNavigate();
  const createGraphPlaylist = () => {
    navigate("/graphplaylists/new");
  };
  return (
    <Box>
      <h1>GraphPlaylists</h1>
      <Button onClick={createGraphPlaylist}>Create Graph Playlist</Button>
    </Box>
  );
};
export default GraphPlaylists;
