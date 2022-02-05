import { Box, Button } from "@mui/material";
import React from "react";
import { useNavigate } from "react-router";

const Playlists = () => {
  const navigate = useNavigate();
  const handleClick = () => {
    navigate("/playlists/new");
  };
  return (
    <Box>
      <h1>Playlists</h1>
      <Button onClick={handleClick}>New Playlist</Button>
    </Box>
  );
};

export default Playlists;
