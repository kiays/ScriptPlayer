/* eslint-disable no-prototype-builtins */
import {
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableCell,
  TableRow,
  TableBody,
  TableSortLabel,
  Menu,
  MenuItem,
  TablePagination,
} from "@mui/material";
import {
  bindContextMenu,
  usePopupState,
  bindMenu,
} from "material-ui-popup-state/hooks";
import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";

type TableSchema<T> = {
  name?: string;
  order?: number;
  hide?: boolean;
  render?: (value: T) => React.ReactNode;
  sortable?: boolean;
  comparator?: (a: T, b: T) => number;
  width?: number | string;
  minWidth?: number | string;
  maxWidth?: number | string;
};

type EventHandlerSpec = {
  $onContextMenu?: {
    [name: string]: (id: string) => void;
  };
  $onRowClicked?: (id: string) => void;
};

type SortableTableProps<T> =
  | {
      data: { [id: string]: T };
      schema: { [Key in keyof T]: TableSchema<T> } & {
        [id: string]: TableSchema<T>;
      } & EventHandlerSpec;
      sortable?: boolean;
    }
  | {
      data: T[];
      schema: { [Key in keyof T]: TableSchema<T> } & {
        [id: string]: TableSchema<T>;
      } & EventHandlerSpec;
      sortable?: boolean;
    };

const SortableTable = <T,>({
  data,
  schema,
  sortable = false,
}: SortableTableProps<T>) => {
  const firstItem = Object.values(data)[0] || {};
  const schemaKeys = Object.keys(schema)
    .sort((a, b) => schema[a].order || 0 - schema[b].order || 0)
    .filter((key) => !schema[key].hide)
    .filter((key) => key !== "$onContextMenu" && key !== "$onRowClicked")
    .filter((key) => firstItem.hasOwnProperty(key) || schema[key].render);

  const popupState = usePopupState({
    variant: "popover",
    popupId: "sortable_table",
  });

  const [params, setSearchParams] = useSearchParams();
  const [selectedId, setId] = useState<string | null>(null);
  const state = {
    order: (params.get("order") as "asc" | "desc") || "desc",
    orderBy: params.get("orderBy") || schemaKeys[0],
    page: params.get("page") || "0",
    rowsPerPage: params.get("rowsPerPage") || "10",
  };
  const setOrder = (order) => {
    setSearchParams({ ...state, order });
  };
  const setOrderBy = (orderBy) => {
    setSearchParams({ ...state, orderBy });
  };
  const setPage = (page) => {
    setSearchParams({ ...state, page: String(page) });
  };
  const setRowsPerPage = (rowsPerPage) =>
    setSearchParams({ ...state, rowsPerPage: String(rowsPerPage), page: "0" });
  const { order, orderBy } = state;
  const page = parseInt(state.page);
  const rowsPerPage = parseInt(state.rowsPerPage);

  const handleContextMenu = (id: string) => {
    const { onContextMenu } = bindContextMenu(popupState);
    return (e: React.MouseEvent<HTMLTableRowElement, MouseEvent>) => {
      setId(id);
      onContextMenu(e);
    };
  };
  const onRowClicked =
    schema.$onRowClicked ||
    ((_id) => {
      return;
    });
  const contextMenuItems = schema.$onContextMenu || {};
  const createSortHandler = (key: keyof T | string) => () => {
    if (orderBy === key) {
      setOrder(order === "asc" ? "desc" : "asc");
    } else {
      setOrderBy(key);
    }
  };
  const comparator =
    schema[orderBy].comparator ||
    ((a: T, b: T) => (a[orderBy as keyof T] > b[orderBy as keyof T] ? 1 : -1));

  const sortedDataIdList: string[] = Object.keys(data).sort((k1, k2) => {
    return comparator(data[k1], data[k2]) * (order === "asc" ? -1 : 1);
  });

  const handleChangePage = (
    _event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number
  ) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
  };

  const currentItemIndex = page * rowsPerPage;

  return (
    <>
      <TablePagination
        component="div"
        page={page}
        rowsPerPage={rowsPerPage}
        count={sortedDataIdList.length}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        color="primary"
      />
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              {schemaKeys.map((key) => {
                const s = schema[key];
                return (
                  <TableCell
                    key={`table-head-${key}`}
                    sx={{
                      maxWidth: s.maxWidth,
                      minWidth: s.minWidth,
                      width: s.width,
                    }}>
                    {sortable && s.sortable ? (
                      <TableSortLabel
                        active={orderBy === key}
                        direction={orderBy === key ? order : "asc"}
                        onClick={createSortHandler(key)}>
                        {s.name || key}
                      </TableSortLabel>
                    ) : (
                      s.name || key
                    )}
                  </TableCell>
                );
              })}
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedDataIdList
              .slice(currentItemIndex, currentItemIndex + rowsPerPage)
              .map((id) => (
                <TableRow
                  hover
                  key={`table-row-${id}`}
                  onClick={() => onRowClicked(id)}
                  onContextMenu={handleContextMenu(id)}>
                  {schemaKeys.map((k) => (
                    <TableCell key={`table-cell-${k}`}>
                      {schema[k].render
                        ? schema[k].render(data[id])
                        : data[id].hasOwnProperty(k)
                        ? data[id][k]
                        : ""}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            {schema.$onContextMenu && (
              <Menu
                {...bindMenu(popupState)}
                anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                transformOrigin={{ vertical: "top", horizontal: "left" }}>
                {Object.keys(contextMenuItems).map((name) => (
                  <MenuItem
                    key={`context-menu-item-${name}`}
                    onClick={() => {
                      contextMenuItems[name](selectedId);
                      popupState.close();
                    }}>
                    {name}
                  </MenuItem>
                ))}
              </Menu>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

export default SortableTable;
