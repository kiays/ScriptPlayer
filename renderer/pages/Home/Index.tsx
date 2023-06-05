import React from "react";
import {
  Button,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Grid,
  Rating,
  Stack,
  Typography,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { IS_DEVELOPMENT } from "../../utils";
import { useRecoilValue } from "recoil";
import { worksState } from "../../states/works";
import { playlistsState } from "../../states/playlists";

const Home = () => {
  const navigate = useNavigate();
  const works = useRecoilValue(worksState);
  const playlists = useRecoilValue(playlistsState);
  const resentWorks = Object.keys(works)
    .sort((a, b) => works[b].addedAt - works[a].addedAt)
    .slice(0, 6)
    .map((key) => ({ ...works[key], key }));
  const recentPlaylists = Object.keys(playlists)
    .sort((a, b) => playlists[b].createdAt - playlists[a].createdAt)
    .slice(0, 6)
    .map((key) => {
      const tracks = playlists[key].tracks;
      const thumbnails = Array.from(
        new Set(
          tracks
            .map((track) => {
              const k = Object.keys(works).find((workKey) =>
                works[workKey].trackIds.includes(track.hash)
              );
              if (!k) return;
              const work = works[k];
              return work.thumbnailPath;
            })
            .filter(Boolean)
        )
      );
      return {
        ...playlists[key],
        key,
        thumbnailPath: thumbnails.length > 0 ? thumbnails[0] : null,
      };
    });
  return (
    <div>
      <Stack direction="row" spacing={2} sx={{ marginY: 4 }}>
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
      <Grid
        container
        spacing={2}
        justifyContent="center"
        display={"flex"}
        flexGrow={1}
        sx={{ marginY: 4 }}
        alignItems="stretch">
        {resentWorks.map(({ key, name, rating, thumbnailPath }) => (
          <Grid key={key} item xs={4}>
            <Card>
              <CardActionArea onClick={() => navigate(`/works/${key}`)}>
                <CardMedia sx={{ height: 140 }} image={thumbnailPath} />
                <CardContent sx={{ height: 100 }}>
                  <Rating value={rating} readOnly />
                  <Typography
                    gutterBottom
                    component="div"
                    sx={{ WebkitLineClamp: 3 }}>
                    {name}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Grid
        container
        spacing={2}
        justifyContent="center"
        display={"flex"}
        flexGrow={1}
        alignItems="stretch">
        {recentPlaylists.map(({ key, name, rating, thumbnailPath }) => (
          <Grid key={key} item xs={4}>
            <Card>
              <CardActionArea onClick={() => navigate(`/playlists/${key}`)}>
                <CardMedia sx={{ height: 140 }} image={thumbnailPath} />
                <CardContent sx={{ height: 100 }}>
                  <Rating value={rating} readOnly />
                  <Typography
                    gutterBottom
                    component="div"
                    sx={{ WebkitLineClamp: 3 }}>
                    {name}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </div>
  );
};

export default Home;
