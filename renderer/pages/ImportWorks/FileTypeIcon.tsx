import React from "react";
import {
  AudioFile as AudioFileIcon,
  Article as TextIcon,
  Photo as PhotoIcon,
  FilePresent as FileIcon,
  Folder as FolderIcon,
} from "@mui/icons-material";

type FileTypeIconProps = {
  type: string;
};
const FileTypeIcon = ({ type }: FileTypeIconProps) => {
  if (!type) return <FileIcon />;
  if (type.startsWith("audio")) return <AudioFileIcon />;
  if (type.startsWith("image")) return <PhotoIcon />;
  if (type.startsWith("text")) return <TextIcon />;
  if (type == "dir") return <FolderIcon />;
  return <FileIcon />;
};

export default FileTypeIcon;
