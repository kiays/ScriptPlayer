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
} from "@mui/material";
import {
  bindContextMenu,
  usePopupState,
  bindMenu,
} from "material-ui-popup-state/hooks";
import React, { useState } from "react";

type TableSchema<T> = {
  name?: string;
  order?: number;
  hide?: boolean;
  render?: (value: T) => React.ReactNode;
  sortable?: boolean;
  comparator?: (a: T, b: T) => number;
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
  const [selectedId, setId] = useState<string | null>(null);
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [orderBy, setOrderBy] = useState<keyof T | string>(schemaKeys[0]);

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

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            {schemaKeys.map((key) => (
              <TableCell key={`table-head-${key}`}>
                {sortable && schema[key].sortable ? (
                  <TableSortLabel
                    active={orderBy === key}
                    direction={orderBy === key ? order : "asc"}
                    onClick={createSortHandler(key)}>
                    {schema[key].name || key}
                  </TableSortLabel>
                ) : (
                  schema[key].name || key
                )}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedDataIdList.map((id) => (
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
  );
};

export default SortableTable;
