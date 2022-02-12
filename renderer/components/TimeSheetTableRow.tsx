import { TableCell, TableRow } from "@mui/material";
import React, { useEffect, useState } from "react";
import TimeSheetPreview from "./TimeSheetPreview";
import { formatTime, readCsvFile } from "../utils";

type TimeSheetRowProps = {
  sheet?: TimeSheetMeta;
};
const TimeSheetTableRow = ({ sheet }: TimeSheetRowProps) => {
  const [content, setContent] = useState(null);
  useEffect(() => {
    if (!sheet) return;
    readCsvFile(sheet.path).then(setContent);
  }, [sheet, setContent]);
  if (!sheet) return null;
  if (!content) return null;
  return (
    <TableRow>
      <TableCell>{sheet.name}</TableCell>
      <TableCell>{formatTime(content[content.length - 1][0])}</TableCell>
      <TableCell>
        <TimeSheetPreview content={content} />
      </TableCell>
    </TableRow>
  );
};

export default TimeSheetTableRow;
