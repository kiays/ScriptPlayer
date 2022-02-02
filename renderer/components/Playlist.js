import React from "react";
import { useDrop } from "react-dnd";
import { NativeTypes } from "react-dnd-html5-backend";

const CsvField = ({ track, setCsv }) => {
  const [{ canDrop }, target] = useDrop(() => ({
    accept: [NativeTypes.FILE],
    drop(item) {
      if (item.files.length == 1) {
        setCsv(track, item.files[0]);
      }
    },
  }));
  if (track.csvUrl) {
    return <td>{track.csvUrl}</td>;
  }
  return <td ref={target}>Drop csv ...</td>;
};

const Playlist = ({ playlist: { name, tracks }, setCsv }) => {
  return (
    <div>
      <h1>Playlist {name}</h1>

      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>title</th>
            <th>csv</th>
          </tr>
        </thead>
        <tbody>
          {tracks.map((track, i) => (
            <tr key={track.url + i}>
              <td>{i}</td>
              <td>{track.title}</td>
              <CsvField track={track} setCsv={setCsv} />
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Playlist;
