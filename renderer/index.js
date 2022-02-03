import React, { useState } from "react";
import { render } from "react-dom";
import { DndProvider, useDrop } from "react-dnd";
import { NativeTypes, HTML5Backend } from "react-dnd-html5-backend";
import Playlist from "./components/Playlist";
import update from "immutability-helper";
import Player from "./components/Player";
import { useEffect } from "react/cjs/react.development";
import { readFile, createTrack } from "./utils";

const App = () => {
  const [playlist, setPlaylist] = useState({ name: "new", tracks: [] });
  const [playlistUrl, setPlaylistUrl] = useState("");
  useEffect(() => {
    const s = JSON.stringify(playlist);
    const b = new Blob([s], { type: "application/json" });
    setPlaylistUrl(URL.createObjectURL(b));
  }, [playlist]);
  const [{ canDrop, isOver }, drop] = useDrop(() => ({
    accept: [NativeTypes.FILE],
    async drop(item) {
      if (item.files.length == 1 && item.files[0].type == "application/json") {
        readFile(item.files[0])
          .then(JSON.parse)
          .then((p) => setPlaylist(p));
        return;
      }
      const tracks = await Promise.all(item.files.map(createTrack));
      setPlaylist((p) => update(p, { tracks: { $push: tracks } }));
    },
    collect(monitor) {
      return { isOver: monitor.isOver, canDrop: monitor.canDrop };
    },
  }));

  const setCsv = async (track, csv) => {
    const csvContentStr = await readFile(csv);
    const csvContent = csvContentStr
      .split("\r\n")
      .map((l) => l.split(",").map(Number))
      .map(([time, dir, val]) => [time * 0.1, dir, val]);
    setPlaylist((p) => {
      const index = p.tracks.findIndex((t) => t == track);
      return update(p, {
        tracks: {
          [index]: {
            csvUrl: { $set: csv.path },
            csvName: { $set: csv.name },
            csvFile: { $set: csv },
            csvContent: { $set: csvContent },
          },
        },
      });
    });
  };

  return (
    <div>
      <Player playlist={playlist} />
      <Playlist playlist={playlist} setCsv={setCsv} />
      <a download={`${playlist.name}.json`} href={playlistUrl}>
        save
      </a>
      <div
        ref={drop}
        style={{ width: "500px", height: "400px", backgroundColor: "pink" }}
      >
        drop here
      </div>
    </div>
  );
};

render(
  <DndProvider backend={HTML5Backend}>
    <App />
  </DndProvider>,
  document.getElementById("root")
);
