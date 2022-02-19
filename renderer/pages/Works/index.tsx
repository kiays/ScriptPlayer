import React from "react";
import {
  Avatar,
  Box,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
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
      <Table>
        <TableHead></TableHead>
        <TableBody>
          {Object.keys(works).map((key) => (
            <TableRow key={key} onClick={() => navigate(`/works/${key}`)}>
              <TableCell>
                <Avatar src={works[key].thumbnailPath} variant="square" />
              </TableCell>
              <TableCell>{works[key].name}</TableCell>
              <TableCell>{`${works[key].trackIds.length} tracks`}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
};
export default Works;
