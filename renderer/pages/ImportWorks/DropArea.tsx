import React from "react";
import { useRecoilState } from "recoil";

import { droppedFilePathState } from "../../states/droppedFile";
import { Card, CardContent, Typography } from "@mui/material";

const DropArea = () => {
  const [_path, setDroppedFilePath] = useRecoilState(droppedFilePathState);

  const handleDrop = (event: React.DragEvent) => {
    console.log("drop", event);
    event.preventDefault();
    if (!event.dataTransfer.items) {
      return;
    }
    const file = event.dataTransfer.items[0].getAsFile();

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
  };
  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };
  console.log("test");
  return (
    <Card
      onDrop={handleDrop}
      onDragOver={handleDragOver}
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
