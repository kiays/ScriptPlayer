import React from "react";
import { useRecoilState } from "recoil";

import { useDrop } from "react-dnd";
import { NativeTypes } from "react-dnd-html5-backend";
import { droppedFilePathState } from "../../states/droppedFile";

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
  return <div ref={dropTarget}>音声作品フォルダをドロップしてください</div>;
};

export default DropArea;
