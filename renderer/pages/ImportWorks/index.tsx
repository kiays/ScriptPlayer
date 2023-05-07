import React, { useState } from "react";
import { List } from "@mui/material";
import { useRecoilState } from "recoil";
import Item from "./Item";
import { Button } from "@mui/material";
import { worksState } from "../../states/works";
import { tracksState } from "../../states/tracks";
import { createTrack } from "../../utils";
import { useNavigate } from "react-router";
import { dirname } from "../../utils";
import NoImage from "../../assets/no_image.png";
import DropArea from "./DropArea";
import { FileInfo, Track } from "../../types";

const ImportWork = () => {
  const [droppedFolder, setDroppedFolder] = useState<
    (File & { path: string }) | null
  >(null);
  const [fileList, setFileList] = useState<FileInfo[] | null>(null);

  const [works, setWorks] = useRecoilState(worksState);
  const [tracks, setTracks] = useRecoilState(tracksState);
  const [checked, setChecked] = useState({});
  const [thumbnailPath, setThumbnail] = useState<string | null>(NoImage);
  const navigate = useNavigate();

  const doImport = async () => {
    const dest = await window.mainProc.importWork(droppedFolder.path);
    const prevDirName = dirname(droppedFolder.path);
    const newDirName = dirname(dest);
    const newTrackPaths = Object.keys(checked)
      .filter((k) => checked[k])
      .map((k) => k.replace(prevDirName, newDirName));
    const hashes: string[] = [];
    const tracksInfo: { [key: string]: Track } = await newTrackPaths.reduce(
      async (p, trackPath) => {
        const acc = await p;
        const name = trackPath.replace(dest + "/", "");
        const t = await createTrack({ name, path: trackPath });
        const hash = await window.mainProc.getFileHash(trackPath);
        hashes.push(hash);
        return {
          ...acc,
          [hash]: {
            path: trackPath,
            name,
            hash,
            duration: t.duration,
            workName: droppedFolder.name,
          },
        };
      },
      Promise.resolve({})
    );
    const newWorks = {
      ...works,
      [droppedFolder.name]: {
        path: dest,
        name: droppedFolder.name,
        trackFiles: newTrackPaths,
        trackIds: hashes,
        thumbnailPath: thumbnailPath.replace(prevDirName, newDirName),
        addedAt: Date.now(),
      },
    };
    setTracks({ ...tracks, ...tracksInfo });
    setWorks(newWorks);
    setChecked({});
    setThumbnail(null);
    navigate(`/works/${droppedFolder.name}`);
  };

  const handleFileDrop = async (file: File & { path: string }) => {
    setDroppedFolder(file);
    const directory = await window.mainProc.checkDroppedFile(file.path);
    setFileList(directory);
  };
  if (!droppedFolder || !fileList)
    return <DropArea onFileDrop={handleFileDrop} />;
  return (
    <div>
      <div>
        <h1>Import {droppedFolder.name}</h1>
        {thumbnailPath && (
          <img
            src={thumbnailPath}
            style={{ width: "25%", objectFit: "contain" }}
          />
        )}
      </div>
      <Button onClick={doImport}>Import</Button>
      <List sx={{ width: "100%", bgcolor: "background.paper" }}>
        {fileList.map((fileInfo) => (
          <Item
            key={fileInfo.path}
            fileInfo={fileInfo}
            checked={checked}
            setChecked={setChecked}
            thumbnailPath={thumbnailPath}
            setThumbnail={setThumbnail}
          />
        ))}
      </List>
    </div>
  );
};
export default ImportWork;
