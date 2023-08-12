import React from "react";
import {
  Button,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Divider,
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

function shuffle<T>(array: T[]): T[] {
  let currentIndex = array.length,
    randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex != 0) {
    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }

  return array;
}

type GridItemProps = {
  name: string;
  rating: number;
  thumbnailPath: string;
  onClick: () => void;
};
const GridItem = ({ name, rating, thumbnailPath, onClick }: GridItemProps) => {
  return (
    <Grid item xs={4}>
      <Card>
        <CardActionArea aria-label="ホーム画面のカード" onClick={onClick}>
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
  );
};

const Home = () => {
  const navigate = useNavigate();
  const works = useRecoilValue(worksState);
  const allPlaylists = useRecoilValue(playlistsState);
  const [rating, _setRating] = React.useState(5);
  const resentWorks = Object.keys(works)
    .sort((a, b) => works[b].addedAt - works[a].addedAt)
    .slice(0, 6)
    .map((key) => ({ ...works[key], key }));
  const playlists = Object.keys(allPlaylists)
    .sort((a, b) => allPlaylists[b].createdAt - allPlaylists[a].createdAt)
    .map((key) => {
      const tracks = allPlaylists[key].tracks;
      const thumbnails = Array.from(
        new Set(
          tracks
            .filter(Boolean)
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
        ...allPlaylists[key],
        key,
        thumbnailPath: thumbnails.length > 0 ? thumbnails[0] : null,
      };
    });
  const recentPlaylists = playlists.slice(0, 6);
  const ratedWorks = shuffle(
    Object.keys(works)
      .filter((key) => works[key].rating >= rating)
      .sort((a, b) => works[b].rating - works[a].rating)
      .map((key) => ({ ...works[key], key }))
  ).slice(0, 6);
  const ratedPlaylists = shuffle(
    playlists.filter((p) => p.rating >= rating)
  ).slice(0, 6);
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
          <GridItem
            key={key}
            name={name}
            rating={rating}
            thumbnailPath={thumbnailPath}
            onClick={() => navigate(`/works/${key}`)}
          />
        ))}
      </Grid>
      <Divider />
      <Grid
        container
        spacing={2}
        justifyContent="center"
        display={"flex"}
        sx={{ marginY: 2 }}
        flexGrow={1}
        alignItems="stretch">
        {recentPlaylists.map(({ key, name, rating, thumbnailPath }) => (
          <GridItem
            key={key}
            name={name}
            rating={rating}
            thumbnailPath={thumbnailPath}
            onClick={() => navigate(`/playlists/${key}`)}
          />
        ))}
      </Grid>
      <Divider />
      <Grid
        container
        spacing={2}
        justifyContent="center"
        display={"flex"}
        flexGrow={1}
        sx={{ marginY: 2 }}
        alignItems="stretch">
        {ratedWorks.map(({ key, name, rating, thumbnailPath }) => (
          <GridItem
            key={key}
            name={name}
            rating={rating}
            thumbnailPath={thumbnailPath}
            onClick={() => navigate(`/works/${key}`)}
          />
        ))}
      </Grid>
      <Divider />
      <Grid
        container
        spacing={2}
        justifyContent="center"
        display={"flex"}
        flexGrow={1}
        sx={{ mt: 2, mb: 4 }}
        alignItems="stretch">
        {ratedPlaylists.map(({ key, name, rating, thumbnailPath }) => (
          <GridItem
            key={key}
            name={name}
            rating={rating}
            thumbnailPath={thumbnailPath}
            onClick={() => navigate(`/playlists/${key}`)}
          />
        ))}
      </Grid>
    </div>
  );
};

export default Home;
