import React from "react";

type FileDropAreaProps = {
  children: React.ReactNode;
  fileType: string; // text/csv
  onDrop: (files: File[]) => void;
};
const FileDropArea = ({
  children,
  fileType = null,
  onDrop,
}: FileDropAreaProps) => {
  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const items = Array.from(event.dataTransfer.items);
    const result = items.flatMap((item) => {
      const file = item.getAsFile();
      if (fileType && file.type !== fileType) return;
      return file;
    });
    onDrop(result);
  };
  return (
    <div onDrop={handleDrop} onDragOver={(e) => e.preventDefault()}>
      {children}
    </div>
  );
};

export default FileDropArea;
