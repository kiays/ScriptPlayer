import React from "react";
import { useDrop } from "react-dnd";
import { NativeTypes } from "react-dnd-html5-backend";
import { formatTime } from "../utils";


type CsvFieldProps = {
  track: Track,
  setCsv: (track:Track, csv: CSV) => void,
}

type Item = {
  files: Array<File>
}

const CsvField = ({ track, setCsv }: CsvFieldProps) => {
  const [{ canDrop }, target] = useDrop(() => ({
    accept: [NativeTypes.FILE],
    drop(item: Item) {
      if (item.files.length == 1) {
        setCsv(track, item.files[0]);
      }
    },
  }));
  if (track.csvUrl) {
    return <td>{track.csvName}</td>;
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
            <th>duration</th>
            <th>csv</th>
          </tr>
        </thead>
        <tbody>
          {tracks.map((track, i) => (
            <tr key={track.url + i}>
              <td>{i}</td>
              <td>{track.title}</td>
              <td>{formatTime(track.duration)}</td>
              <CsvField track={track} setCsv={setCsv} />
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Playlist;
