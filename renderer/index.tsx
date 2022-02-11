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

import ImportWork from "./pages/ImportWorks/index";
import Works from "./pages/Works";
import "@mui/material/styles";
import Layout from "./layout";
import { droppedFilePathState } from "./states/droppedFile";
import { loadingState } from "./states/loading";
import WorkDetail from "./pages/WorkDetail";
import Playlists from "./pages/Playlists";
import PlaylistNew from "./pages/PlaylistsNew";
import PlaylistDetail from "./pages/PlaylistDetail";

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
  const loading = useRecoilValue(loadingState);
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
          <Route path="/playlists/:playlistId" element={<PlaylistDetail />} />
          <Route path="/tracks" element={<div>tracks</div>} />
          <Route path="/works" element={<Works />} />
          <Route path="/works/:workId" element={<WorkDetail />} />
          <Route path="/works/import" element={<ImportWork />} />
          <Route path="/csvs" element={<div>csv</div>} />
          <Route path="/" element={<div>home</div>} />
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
          <Suspense fallback={<Loading loading={true} />}>
            <Layout>
              <App />
            </Layout>
          </Suspense>
        </HashRouter>
      </ThemeProvider>
    </DndProvider>
  </RecoilRoot>,
  document.getElementById("root")
);
