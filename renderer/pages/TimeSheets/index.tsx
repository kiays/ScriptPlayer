import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import React from "react";
import { useRecoilValue } from "recoil";
import TimeSheetTableRow from "../../components/TimeSheetTableRow";
import { allTimeSheets } from "../../states/timesheets";

const TimeSheetsPage = () => {
  const timesheets = useRecoilValue(allTimeSheets);
  return (
    <Box>
      <h1>TimeSheets</h1>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {Object.keys(timesheets).map((id) => {
            return <TimeSheetTableRow key={id} sheet={timesheets[id]} />;
          })}
        </TableBody>
      </Table>
    </Box>
  );
};
export default TimeSheetsPage;
