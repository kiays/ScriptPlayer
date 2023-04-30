import React from "react";
import {
  Avatar,
  Box,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Divider,
} from "@mui/material";
import { useRecoilState } from "recoil";
import { worksState } from "../../states/works";
import { useNavigate } from "react-router";
import SortableTable from "../../components/SortableTable";

const ComponentCatalog = () => {
  const works = useRecoilState(worksState)[0];
  const navigate = useNavigate();
  const data = {
    a: { x: 1, y: 2 },
    b: { x: 2, y: 3 },
    c: { x: 3, y: 4 },
    d: { x: 4, y: 5 },
  };
  const data2 = [
    { x: 1, y: 2 },
    { x: 2, y: 3 },
    { x: 3, y: 4 },
    { x: 4, y: 5 },
  ];
  const schema = {
    x: { name: "X", order: 1, sortable: true },
    y: {
      name: "Y",
      order: 10,
      render: (val) => <b>test: {val.y}</b>,
      sortable: true,
    },
    $onContextMenu: {
      delete: (id) => console.log("deleted: ", id),
      copy: (id) => console.log("copy: ", id),
    },
  };
  return (
    <Box>
      <h1>ComponentCatalog</h1>
      <SortableTable schema={schema} data={data} sortable={true} />
      <Divider />
      <SortableTable schema={schema} data={data2} />
      <Divider />
      <SortableTable<Work>
        schema={{
          trackIds: { name: "", hide: true },
          thumbnailPath: {
            order: 0,
            render: (val) => (
              <Avatar src={val.thumbnailPath} variant="square" />
            ),
          },
          name: { order: 1 },
          addedAt: {},
          numTracks: {
            name: "Tracks",
            order: 2,
            render: (val) => <span>{val.trackIds.length} tracks</span>,
          },
          $onRowClicked: (key) => navigate(`/works/${key}`),
        }}
        data={works}
      />
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
export default ComponentCatalog;
