import React, { Suspense } from "react";
import { render } from "react-dom";
import { RecoilRoot, useRecoilState, useRecoilValue } from "recoil";
import { DndProvider, useDrop } from "react-dnd";
import { NativeTypes, HTML5Backend } from "react-dnd-html5-backend";
import { HashRouter, Route, Routes, Link, useNavigate } from "react-router-dom";
import {
  ThemeProvider,
  createTheme,
  Backdrop,
  CircularProgress,
} from "@mui/material";

import ImportWork from "./pages/ImportWorks";
import Works from "./pages/Works";
import "@mui/material/styles";
import Layout from "./layout";
import { droppedFilePathState } from "./states/droppedFile";
import { loadingState } from "./states/loading";
import WorkDetail from "./pages/WorkDetail";
import Playlists from "./pages/Playlists";
import PlaylistNew from "./pages/PlaylistsNew";
const theme = createTheme();

const Loading = ({ loading }) =>
  loading ? (
    <Backdrop
      sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
      open={true}
    >
      <CircularProgress color="inherit" />
    </Backdrop>
  ) : null;

const App = () => {
  const [_path, setDroppedFilePath] = useRecoilState(droppedFilePathState);
  const loading = useRecoilState(loadingState)[0];
  const navigate = useNavigate();
  const [_, dropTarget] = useDrop(() => ({
    accept: [NativeTypes.FILE],
    async drop(item) {
      if (item.files.length != 1) return;
      const file = item.files[0];
      if (file.type == "") {
        setDroppedFilePath(file);
        navigate("/works/import");
        return;
      }
    },
  }));
  return (
    <>
      <Loading loading={loading} />

      <div ref={dropTarget} style={{ width: "100%", height: "100%" }}>
        <Routes>
          <Route path="/playlists" element={<Playlists />} />
          <Route path="/playlists/new" element={<PlaylistNew />} />
          <Route path="/tracks" element={<div>tracks</div>} />
          <Route path="/works" element={<Works />} />
          <Route path="/works/:workId" element={<WorkDetail />} />
          <Route path="/works/import" element={<ImportWork />} />
          <Route path="/csvs" element={<div>csv</div>} />
          <Route path="/" exact element={<div>home</div>} />
          <Route path="*" element={<div>not found</div>} />
        </Routes>
      </div>
    </>
  );
};

render(
  <RecoilRoot>
    <DndProvider backend={HTML5Backend}>
      <ThemeProvider theme={theme}>
        <HashRouter>
          <Layout>
            <App />
          </Layout>
        </HashRouter>
      </ThemeProvider>
    </DndProvider>
  </RecoilRoot>,
  document.getElementById("root")
);

// const App2 = () => {
//   const [playlist, setPlaylist] = useRecoilState(currentPlaylistState);
//   const playlists = useRecoilValue(playlistsState);
//   console.log(playlists);
//   const [{ canDrop, isOver }, drop] = useDrop(() => ({
//     accept: [NativeTypes.FILE],
//     async drop(item) {
//       if (item.files.length == 1 && item.files[0].type == "application/json") {
//         readFile(item.files[0])
//           .then(JSON.parse)
//           .then((p) => setPlaylist(p));
//         return;
//       }
//       const tracks = await Promise.all(item.files.map(createTrack));
//       setPlaylist((p) => update(p, { tracks: { $push: tracks } }));
//     },
//     collect(monitor) {
//       return { isOver: monitor.isOver, canDrop: monitor.canDrop };
//     },
//   }));

//   const setCsv = async (track, csv) => {
//     const csvContentStr = await readFile(csv);
//     const csvContent = csvContentStr
//       .split("\r\n")
//       .map((l) => l.split(",").map(Number))
//       .map(([time, dir, val]) => [time * 0.1, dir, val]);
//     setPlaylist((p) => {
//       const index = p.tracks.findIndex((t) => t == track);
//       return update(p, {
//         tracks: {
//           [index]: {
//             csvUrl: { $set: csv.path },
//             csvName: { $set: csv.name },
//             csvFile: { $set: csv },
//             csvContent: { $set: csvContent },
//           },
//         },
//       });
//     });
//   };

//   return (
//     <div>
//       {/* <Player playlist={playlist} />
//       <Playlist playlist={playlist} setCsv={setCsv} />
//       <div
//         ref={drop}
//         style={{ width: "500px", height: "400px", backgroundColor: "pink" }}
//       >
//         drop here
//       </div> */}
//     </div>
//   );
// };
