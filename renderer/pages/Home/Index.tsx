import React from "react";
import { Button, Stack } from "@mui/material";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div>
      <h1>Home</h1>
      <Stack direction="row" spacing={2} sx={{ marginTop: 4 }}>
        <Link to="/works/">
          <Button variant="contained">音声作品一覧</Button>
        </Link>
        <Link to="/playlists/">
          <Button variant="contained">プレイリスト一覧</Button>
        </Link>
        <Link to="/works/import">
          <Button variant="contained">音声作品のインポート</Button>
        </Link>
      </Stack>
    </div>
  );
};

export default Home;
