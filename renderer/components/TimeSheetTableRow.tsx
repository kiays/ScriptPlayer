import { TableCell, TableRow, IconButton, Tooltip } from "@mui/material";
import React, { useEffect, useState } from "react";
import TimeSheetPreview from "./TimeSheetPreview";
import { formatTime, readCsvFile } from "../utils";
import {
  Delete as DeleteIcon,
  Cached as ReloadIcon,
  Error as ErrorIcon,
} from "@mui/icons-material";
import { TimeSheetMeta } from "../types";

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
  const [error, setError] = useState<Error | null>(null);
  const reload = () => {
    if (!sheet) return;
    readCsvFile(sheet.path).then(setContent).catch(setError);
  };
  useEffect(() => {
    if (!sheet) return;
    readCsvFile(sheet.path).then(setContent).catch(setError);
  }, [sheet, setContent]);
  if (!sheet) return null;
  return (
    <TableRow>
      <TableCell>
        {sheet.name}
        {error && (
          <Tooltip title={error.message}>
            <ErrorIcon
              sx={{
                color: "red",
                width: "1rem",
                height: "1rem",
                marginBottom: "-0.25rem",
              }}
            />
          </Tooltip>
        )}
      </TableCell>
      <TableCell>
        {content && formatTime(content[content.length - 1][0])}
      </TableCell>
      <TableCell>{content && <TimeSheetPreview content={content} />}</TableCell>
      {onDelete && (
        <TableCell>
          <Tooltip title="CSVを削除">
            <IconButton onClick={onDelete}>
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </TableCell>
      )}
      {allowReload && (
        <TableCell>
          <Tooltip title="CSVファイルから再読み込み">
            <IconButton onClick={reload}>
              <ReloadIcon />
            </IconButton>
          </Tooltip>
        </TableCell>
      )}
    </TableRow>
  );
};

export default TimeSheetTableRow;
