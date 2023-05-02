import React, { Suspense } from "react";
import { createRoot } from "react-dom/client";
import { RecoilRoot, useRecoilValue } from "recoil";

import { HashRouter, Route, Routes } from "react-router-dom";
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
import { loadingState } from "./states/loading";
import WorkDetail from "./pages/WorkDetail";
import Playlists from "./pages/Playlists";
import PlaylistNew from "./pages/PlaylistsNew";
import PlaylistDetail from "./pages/PlaylistDetail";
import TimeSheets from "./pages/TimeSheets";
import TimeSheetDetail from "./pages/TimeSheetDetail";
import TrackList from "./pages/Tracks";
import TrackDetail from "./pages/TrackDetail";
import Player from "./components/Player";
import { ipcRenderer } from "electron";
import Home from "./pages/Home/Index";
import Settings from "./pages/Settings";
import ComponentCatalog from "./pages/ComponentCatalog";

const theme = createTheme();

const Loading = ({ loading }: { loading: boolean }) =>
  loading ? (
    <Backdrop
      sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
      open={true}>
      <CircularProgress color="inherit" />
    </Backdrop>
  ) : null;

const App = () => {
  const loading = useRecoilValue(loadingState);

  return (
    <>
      <Loading loading={loading} />

      <div style={{ width: "100%", height: "100%" }}>
        <Routes>
          <Route path="/playlists" element={<Playlists />} />
          <Route path="/playlists/new" element={<PlaylistNew />} />
          <Route path="/playlists/:playlistId" element={<PlaylistDetail />} />
          <Route path="/tracks" element={<TrackList />} />
          <Route path="/tracks/:trackId" element={<TrackDetail />} />
          <Route path="/works" element={<Works />} />
          <Route path="/component-catalog" element={<ComponentCatalog />} />
          <Route path="/works/:workId" element={<WorkDetail />} />
          <Route path="/works/import" element={<ImportWork />} />
          <Route path="/csvs/:csvId" element={<TimeSheetDetail />} />
          <Route path="/csvs" element={<TimeSheets />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/" element={<Home />} />
          <Route path="*" element={<div>not found</div>} />
        </Routes>
      </div>
    </>
  );
};

const root = createRoot(document.getElementById("root"));
root.render(
  <RecoilRoot>
    <ThemeProvider theme={theme}>
      <HashRouter>
        <Suspense fallback={<Loading loading={true} />}>
          <Layout>
            <App />
          </Layout>
          <Player />
        </Suspense>
      </HashRouter>
    </ThemeProvider>
  </RecoilRoot>
);
ipcRenderer.invoke("main-window-ready");
