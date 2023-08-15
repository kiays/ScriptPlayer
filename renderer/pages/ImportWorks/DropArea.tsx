import React from "react";
import { Card, CardContent, Typography } from "@mui/material";

const DropArea = ({
  onFileDrop,
}: {
  onFileDrop: (file: File & { path: string }) => void;
}) => {
  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    if (!event.dataTransfer.items) {
      return;
    }
    const file = event.dataTransfer.items[0].getAsFile() as File & {
      path: string;
    };
    if (file == null) {
      alert("ファイルが取得できませんでした");
      console.log(
        "ファイルが取得できませんでした",
        event.dataTransfer.items,
        event.dataTransfer.items[0],
        event.dataTransfer.files
      );
      return;
    }

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
    if (file.path == "") {
      alert(
        "ファイルのパスが取得できませんでした。音声ファイルの含まれたフォルダをドロップしてください"
      );
      return;
    }
    if (file.type == "") {
      onFileDrop(file);
      return;
    }
    alert(
      "サポートされていない形式のファイルです。音声ファイルの含まれたフォルダをドロップしてください"
    );
  };
  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };
  return (
    <Card
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      sx={{ backgroundColor: "primary.light", color: "primary.contrastText" }}>
      <CardContent sx={{ height: "60vh", margin: 0 }}>
        <Typography sx={{ fontSize: 24 }}>
          音声作品フォルダをドロップしてください
        </Typography>
      </CardContent>
    </Card>
  );
};

export default DropArea;
