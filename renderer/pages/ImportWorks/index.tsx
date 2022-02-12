import React, { useState } from "react";
import { List } from "@mui/material";
import { useRecoilValue, useRecoilState } from "recoil";
import {
  droppedFilePathState,
  droppedFileState,
} from "../../states/droppedFile";
import Item from "./Item";
import { Button } from "@mui/material";
import { ipcRenderer } from "electron";
import { worksState } from "../../states/works";
import { tracksState } from "../../states/tracks";
import { createTrack } from "../../utils";
import { useNavigate } from "react-router";
import { dirname } from "path";

const ImportWork = () => {
  const [checked, setChecked] = useState({});
  const droppedFile = useRecoilValue(droppedFileState);
  const droppedFileInfo = useRecoilState(droppedFilePathState)[0];
  const [works, setWorks] = useRecoilState(worksState);
  const [tracks, setTracks] = useRecoilState(tracksState);
  const [thumbnailPath, setThumbnail] = useState(null);
  const navigate = useNavigate();

  const doImport = async () => {
    const dest = await ipcRenderer.invoke("import-work", droppedFileInfo.path);
    const prevDirName = dirname(droppedFileInfo.path);
    const newDirName = dirname(dest);
    const newTrackPaths = Object.keys(checked)
      .filter((k) => checked[k])
      .map((k) => k.replace(prevDirName, newDirName));
    const hashes = [];
    const tracksInfo = await newTrackPaths.reduce(async (p, trackPath) => {
      const acc = await p;
      const name = trackPath.replace(dest + "/", "");
      const t = await createTrack({ name, path: trackPath });
      const hash = await ipcRenderer.invoke("file-hash", trackPath);
      hashes.push(hash);
      return {
        ...acc,
        [hash]: {
          path: trackPath,
          name,
          hash,
          duration: t.duration,
          workName: droppedFileInfo.name,
        },
      };
    }, Promise.resolve({}));
    const newWorks = {
      ...works,
      [droppedFileInfo.name]: {
        path: dest,
        name: droppedFileInfo.name,
        trackFiles: newTrackPaths,
        trackIds: hashes,
        thumbnailPath: thumbnailPath.replace(prevDirName, newDirName),
      },
    };
    setTracks({ ...tracks, ...tracksInfo });
    setWorks(newWorks);
    setChecked({});
    navigate(`/works/${name}`);
  };
  if (!droppedFile) return <div>drop here</div>;
  return (
    <div>
      <div>
        <h1>Import {droppedFileInfo.name}</h1>
        {thumbnailPath && (
          <img
            src={thumbnailPath}
            style={{ width: "25%", objectFit: "contain" }}
          />
        )}
      </div>
      <Button onClick={doImport}>Import</Button>
      <List sx={{ width: "100%", bgcolor: "background.paper" }}>
        {droppedFile.map((fileInfo) => (
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
