import React from "react";
import { useRecoilState } from "recoil";

import { useDrop } from "react-dnd";
import { NativeTypes } from "react-dnd-html5-backend";
import { droppedFilePathState } from "../../states/droppedFile";
import { Card, CardContent, Typography } from "@mui/material";

type Item = {
  files: Array<File>;
};

const DropArea = () => {
  const [_path, setDroppedFilePath] = useRecoilState(droppedFilePathState);

  const [_, dropTarget] = useDrop(() => ({
    accept: [NativeTypes.FILE],
    async drop(item: Item) {
      if (item.files.length != 1) return;
      const file = item.files[0];
      console.log(item);
      if (file.type == "application/zip") {
        alert(
          "zipファイルはインポートできません。解凍したフォルダをドロップしてください。"
        );
        return;
      }
      if (file.type == "application/x-rar") {
        alert(
          "rarファイルはインポートできません。解凍したフォルダをドロップしてください。"
        );
        return;
      }
      if (file.type == "") {
        setDroppedFilePath(file);
        return;
      }
      alert(
        "サポートされていない形式のファイルです。音声ファイルの含まれたフォルダをドロップしてください"
      );
    },
  }));
  return (
    <Card
      ref={dropTarget}
      sx={{ backgroundColor: "primary.light", color: "primary.contrastText" }}>
      <CardContent sx={{ height: "75vh" }}>
        <Typography sx={{ fontSize: 24 }}>
          音声作品フォルダをドロップしてください
        </Typography>
      </CardContent>
    </Card>
  );
};

export default DropArea;
