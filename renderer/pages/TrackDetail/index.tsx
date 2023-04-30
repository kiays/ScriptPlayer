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
  const [dirty, setDirty] = useState(false);

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
    const newSheets = await Promise.all(files.map(createTimeSheet));

    // delete duplicates
    const sheets = newSheets.filter(
      (s) => sheetIds.findIndex((id) => id === s.hash) === -1
    );

    setDirty(true);
    setSheetDict(
      sheets.reduce((acc, s) => ({ ...acc, [s.hash]: s }), sheetDict)
    );
    setSheetIds([...sheetIds, ...sheets.map((s) => s.hash)]);
  };
  const save = () => {
    saveTrack(update(track, { sheetIds: { $set: sheetIds } }));
    setDirty(false);
  };

  const deleteSheet = (id: string) => () => {
    const ids = sheetIds.filter((e) => e != id);
    setSheetIds(ids);
    setDirty(true);
  };

  if (!track) return null;
  return (
    <Box>
      <h1>{track.name}</h1>
      <Button onClick={save} disabled={!dirty}>
        save
      </Button>
      <Paper
        sx={{ width: "75%", minHeight: "5rem" }}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}>
        <div>Drop CSV file here</div>
      </Paper>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell></TableCell>
            <TableCell></TableCell>
            <TableCell></TableCell>
            <TableCell></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sheetIds.map((id) => (
            <SheetRow
              key={`sheet-${id}`}
              sheet={sheetDict[id]}
              onDelete={deleteSheet(id)}
              allowReload
            />
          ))}
        </TableBody>
      </Table>
    </Box>
  );
};
export default TrackDetailPage;
