import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import React, { useState } from "react";
import { useDrop } from "react-dnd";
import { NativeTypes } from "react-dnd-html5-backend";
import { useParams } from "react-router";
import { useRecoilValue } from "recoil";
import TimeSheetPreview from "../../components/TimeSheetPreview";
import { trackById } from "../../states/tracks";
import { formatTime, getFileHash, readCsvFile } from "../../utils";

type Item = {
  files: Array<File>;
};

const createTimeSheet = async (file: File): Promise<TimeSheet> => {
  const [content, hash] = await Promise.all([
    readCsvFile(file),
    getFileHash(file.path),
  ]);
  return {
    hash,
    content,
    path: file.path,
    name: file.name,
  };
};

const TrackDetailPage = () => {
  const { trackId } = useParams();
  const track = useRecoilValue(trackById(trackId));
  const [sheetIds, setSheetIds] = useState(track ? track.sheetIds : []);
  const [sheetDict, setSheetDict] = useState({});
  const [_, target] = useDrop(
    () => ({
      accept: [NativeTypes.FILE],
      drop: async (item: Item) => {
        const sheets = await Promise.all(item.files.map(createTimeSheet));
        setSheetDict(
          sheets.reduce((acc, s) => ({ ...acc, [s.hash]: s }), sheetDict)
        );
        setSheetIds([...sheetIds, ...sheets.map((s) => s.hash)]);
        return;
      },
    }),
    [sheetDict, sheetIds, setSheetDict, setSheetIds]
  );
  if (!track) return null;
  console.log({ sheetIds, sheetDict });
  return (
    <Box>
      <h1>{track.name}</h1>
      <Button>new TimeSheet</Button>
      <Paper
        sx={{ width: "75%", minHeight: "5rem", bgcolor: "secondary.main" }}
        ref={target}>
        <Button>add TimeSheet from File</Button>
      </Paper>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>name</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sheetIds.map((id) => {
            const sheet = sheetDict[id];
            if (!sheet) return null;
            return (
              <TableRow key={`sheet-${id}`}>
                <TableCell>{sheet.name}</TableCell>
                <TableCell>
                  {formatTime(sheet.content[sheet.content.length - 1][0])}
                </TableCell>
                <TableCell>
                  <TimeSheetPreview content={sheet.content} />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Box>
  );
};
export default TrackDetailPage;
