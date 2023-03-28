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
import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import { useRecoilState } from "recoil";
import { trackById } from "../../states/tracks";
import { getFileHash, readCsvFile } from "../../utils";
import update from "immutability-helper";
import { allTimeSheets } from "../../states/timesheets";
import SheetRow from "../../components/TimeSheetTableRow";

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
  const [track, saveTrack] = useRecoilState(trackById(trackId));
  const [sheetIds, setSheetIds] = useState([]);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    if (!track || !track.sheetIds || loaded) return;
    setSheetIds([...track.sheetIds]);
    setLoaded(true);
  }, [track, sheetIds, setSheetIds, loaded]);
  const [sheetDict, setSheetDict] = useRecoilState(allTimeSheets);

  const handleDrop = async (event: React.DragEvent) => {
    const { items } = event.dataTransfer;
    const files = Array.from(items)
      .map((i) => i.getAsFile())
      .filter((f) => f.type === "text/csv");
    if (files.length === 0) {
      alert("No CSV file found");
      return;
    }
    const sheets = await Promise.all(files.map(createTimeSheet));
    setSheetDict(
      sheets.reduce((acc, s) => ({ ...acc, [s.hash]: s }), sheetDict)
    );
    setSheetIds([...sheetIds, ...sheets.map((s) => s.hash)]);
  };
  const save = () => {
    saveTrack(update(track, { sheetIds: { $set: sheetIds } }));
  };

  if (!track) return null;
  return (
    <Box>
      <h1>{track.name}</h1>
      <Button onClick={save}>save</Button>
      <Paper
        sx={{ width: "75%", minHeight: "5rem" }}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}>
        <div>Drop CSV file here</div>
      </Paper>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>name</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sheetIds.map((id) => (
            <SheetRow key={`sheet-${id}`} sheet={sheetDict[id]} />
          ))}
        </TableBody>
      </Table>
    </Box>
  );
};
export default TrackDetailPage;
