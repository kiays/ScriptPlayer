import React from "react";
import { useSetRecoilState } from "recoil";
import { notificationsState } from "../states/notifications";

type FileDropAreaProps = {
  children: React.ReactNode;
  fileType: string; // text/csv
  onDrop: (files: File[]) => void;
  onError?: (message: string) => void;
};
const FileDropArea = ({
  children,
  fileType = null,
  onDrop,
  onError,
}: FileDropAreaProps) => {
  const setNotifications = useSetRecoilState(notificationsState);
  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const items = Array.from(event.dataTransfer.items);
    const errors = [];
    const result = items
      .flatMap((item) => {
        const file = item.getAsFile();
        if (fileType && file.type !== fileType) {
          errors.push(`${file.name}の形式は${fileType}ではありません`);
          return null;
        }
        if (!file) {
          errors.push(`Cannot get file from ${item}`);
          return null;
        }
        return file;
      })
      .filter(Boolean);
    if (result.length === 0 && errors.length > 0) {
      if (onError) {
        onError(errors.join("\n"));
        return;
      }
      const newNotification: SnackbarNotification = {
        title: errors.join("\n"),
        severity: "error",
        createdAt: new Date(),
        done: false,
        scope: "file",
      };
      setNotifications((ns) => [...ns, newNotification]);
      return;
    }
    onDrop(result);
  };
  return (
    <div onDrop={handleDrop} onDragOver={(e) => e.preventDefault()}>
      {children}
    </div>
  );
};

export default FileDropArea;
