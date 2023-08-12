import React, { useState } from "react";
import { List, Checkbox, FormGroup, FormControlLabel } from "@mui/material";
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
import Loading from "../../components/Loading";

const ImportWork = () => {
  const [droppedFolder, setDroppedFolder] = useState<
    (File & { path: string }) | null
  >(null);
  const [fileList, setFileList] = useState<FileInfo[] | null>(null);

  const [works, setWorks] = useRecoilState(worksState);
  const [tracks, setTracks] = useRecoilState(tracksState);
  const [checked, setChecked] = useState({});
  const [thumbnailPath, setThumbnail] = useState<string | null>(NoImage);
  const [shouldCopy, setShouldCopy] = useState(true);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const doImport = async () => {
    setLoading(true);
    try {
      const dest = await window.mainProc.importWork(
        droppedFolder.path,
        shouldCopy
      );
      const prevDirName = dirname(droppedFolder.path);
      const newDirName = dirname(dest);
      const newTrackPaths = Object.keys(checked)
        .filter((k) => checked[k])
        .map((k) => k.replace(prevDirName, newDirName));
      const hashes: string[] = [];
      const reducer = async (
        p: Promise<{ [key: string]: Track }>,
        trackPath: string
      ) => {
        const acc = await p;
        const name = trackPath.replace(dest + "/", "");
        const t = await createTrack({ name, path: trackPath });
        const hash = await window.mainProc.getFileHash(trackPath);
        hashes.push(hash);
        const track: Track = {
          id: Date.now() * Math.random(),
          path: trackPath,
          name,
          hash,
          duration: t.duration,
          workName: droppedFolder.name,
          numPlayed: 0,
          sheetIds: [],
        };
        return {
          ...acc,
          [hash]: track,
        };
      };
      const tracksInfo: { [key: string]: Track } = await newTrackPaths.reduce(
        reducer,
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
          rating: null,
        },
      };
      setTracks({ ...tracks, ...tracksInfo });
      setWorks(newWorks);
      setChecked({});
      setThumbnail(null);
      navigate(`/works/${droppedFolder.name}`);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleFileDrop = async (file: File & { path: string }) => {
    setDroppedFolder(file);
    const directory = await window.mainProc.checkDroppedFile(file.path);
    setFileList(directory);
  };
  if (!droppedFolder || !fileList)
    return <DropArea onFileDrop={handleFileDrop} />;
  return (
    <>
      <Loading loading={loading} />
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
        <FormGroup>
          <FormControlLabel
            control={
              <Checkbox
                aria-label="ライブラリへコピーするかどうかのチェックボックス"
                checked={shouldCopy}
                onChange={() => setShouldCopy(!shouldCopy)}
              />
            }
            label="ライブラリへコピーする"
          />
        </FormGroup>
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
    </>
  );
};
export default ImportWork;
