import React from "react";
import {
  Avatar,
  Box,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemButton,
} from "@mui/material";
import { useRecoilState } from "recoil";
import { worksState } from "../../states/works";
import { useNavigate } from "react-router";

const Works = () => {
  const works = useRecoilState(worksState)[0];
  const navigate = useNavigate();
  return (
    <Box>
      <h1>Works</h1>
      <List>
        {Object.keys(works).map((key) => (
          <ListItem key={key}>
            <ListItemButton onClick={() => navigate(`/works/${key}`)}>
              <ListItemAvatar>
                <Avatar src={works[key].thumbnailPath} variant="square" />
              </ListItemAvatar>
              <ListItemText primary={works[key].name} />
              <ListItemText primary={`${works[key].trackIds.length} tracks`} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};
export default Works;
