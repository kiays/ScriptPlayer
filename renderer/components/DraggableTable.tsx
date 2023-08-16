/* eslint-disable no-prototype-builtins */
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  closestCenter,
  useSensors,
  useSensor,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  IconButton,
  Menu,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import {
  bindContextMenu,
  bindMenu,
  usePopupState,
} from "material-ui-popup-state/hooks";
import { DragHandle as DragIcon } from "@mui/icons-material";
import React, { useState } from "react";

type DraggableTableSchema<T> = {
  name?: string;
  order?: number;
  hide?: boolean;
  render?: (value: T, index: number) => React.ReactNode;
};

type DraggableTableEventHandlerSpec = {
  $onContextMenu?: {
    [name: string]: (id: ID) => void;
  };
  $onRowClicked?: (id: ID) => void;
};

type DraggableTableProps<T> = {
  items: T[];
  onSort: (items: T[]) => void;
  schema: { [Key in keyof T]: DraggableTableSchema<T> } & {
    [id: string]: DraggableTableSchema<T>;
  } & DraggableTableEventHandlerSpec;
};

type ID = string | number;
type ItemWithId = {
  id: ID;
};

type DraggableTableRowProps<T> = {
  item: T;
  index: number;
  onRowClicked: (id: ID) => void;
  onContextMenu: (e) => void;
  schemaKeys: string[];
  schema: { [Key in keyof T]: DraggableTableSchema<T> } & {
    [id: string]: DraggableTableSchema<T>;
  } & DraggableTableEventHandlerSpec;
};
const DraggableTableRow = <T extends ItemWithId>({
  item,
  onRowClicked,
  onContextMenu,
  schemaKeys,
  schema,
  index,
}: DraggableTableRowProps<T>) => {
  const { id } = item;
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  return (
    <TableRow
      hover
      key={`table-row-${id}`}
      aria-label={`テーブル行: ${id}`}
      onClick={(e) => {
        e.stopPropagation();
        onRowClicked(id);
      }}
      onContextMenu={onContextMenu}
      ref={setNodeRef}
      style={style}
      {...attributes}>
      <TableCell>{index}</TableCell>
      {schemaKeys.map((k) => (
        <TableCell key={`table-cell-${k}`}>
          {schema[k].render
            ? schema[k].render(item, index)
            : item.hasOwnProperty(k)
            ? item[k]
            : ""}
        </TableCell>
      ))}
      <TableCell>
        <IconButton {...listeners}>
          <DragIcon />
        </IconButton>
      </TableCell>
    </TableRow>
  );
};
const DraggableTable = <T extends ItemWithId>({
  items,
  onSort,
  schema,
}: DraggableTableProps<T>) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!active || !over) return;
    if (active.id !== over.id) {
      const oldIndex = items.findIndex((t) => t.id == active.id);
      const newIndex = items.findIndex((t) => t.id == over.id);
      onSort(arrayMove(items, oldIndex, newIndex));
    }
  };

  const firstItem = items[0] || {};
  const schemaKeys = Object.keys(schema)
    .sort((a, b) => schema[a].order || 0 - schema[b].order || 0)
    .filter((key) => !schema[key].hide)
    .filter((key) => key !== "$onContextMenu" && key !== "$onRowClicked")
    .filter((key) => firstItem.hasOwnProperty(key) || schema[key].render);

  const popupState = usePopupState({
    variant: "popover",
    popupId: "draggable_table",
  });
  const [selectedId, setId] = useState<string | number | null>(null);
  const handleContextMenu = (id: ID) => {
    const { onContextMenu } = bindContextMenu(popupState);
    return (e: React.MouseEvent<HTMLTableRowElement, MouseEvent>) => {
      e.stopPropagation();
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

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}>
      <SortableContext
        items={items.map((item) => item.id)}
        strategy={verticalListSortingStrategy}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              {schemaKeys.map((key) => (
                <TableCell key={`table-head-${key}`}>
                  {schema[key].name || key}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item, index) => (
              <DraggableTableRow
                key={item.id}
                item={item}
                index={index}
                onContextMenu={handleContextMenu(item.id)}
                onRowClicked={onRowClicked}
                schema={schema}
                schemaKeys={schemaKeys}
              />
            ))}
            {schema.$onContextMenu && (
              <Menu
                {...bindMenu(popupState)}
                anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                transformOrigin={{ vertical: "top", horizontal: "left" }}>
                {Object.keys(contextMenuItems).map((name) => (
                  <MenuItem
                    key={`context-menu-item-${name}`}
                    aria-label={`コンテキストメニュー: ${name}`}
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
      </SortableContext>
    </DndContext>
  );
};

export default DraggableTable;
