import { TableCell, TableRow, IconButton } from "@mui/material";
import React, { useEffect, useState } from "react";
import TimeSheetPreview from "./TimeSheetPreview";
import { formatTime, readCsvFile } from "../utils";
import {
  Delete as DeleteIcon,
  Cached as ReloadIcon,
} from "@mui/icons-material";

type TimeSheetRowProps = {
  sheet?: TimeSheetMeta;
  onDelete?: () => void;
  allowReload?: boolean;
};
const TimeSheetTableRow = ({
  sheet,
  onDelete,
  allowReload,
}: TimeSheetRowProps) => {
  const [content, setContent] = useState(null);
  const reload = () => {
    if (!sheet) return;
    readCsvFile(sheet.path).then(setContent);
  };
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
      {onDelete && (
        <TableCell>
          <IconButton onClick={onDelete}>
            <DeleteIcon />
          </IconButton>
        </TableCell>
      )}
      {allowReload && (
        <TableCell>
          <IconButton onClick={reload}>
            <ReloadIcon />
          </IconButton>
        </TableCell>
      )}
    </TableRow>
  );
};

export default TimeSheetTableRow;
