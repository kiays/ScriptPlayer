import React, { Suspense } from "react";
import { RecoilRoot } from "recoil";
import { HashRouter, Route, Routes } from "react-router-dom";
import Loading from "./components/Loading";
import { ThemeProvider, createTheme } from "@mui/material";

import ImportWork from "./pages/ImportWorks/index";
import Works from "./pages/Works";
import "@mui/material/styles";
import Layout from "./layout";
import WorkDetail from "./pages/WorkDetail";
import Playlists from "./pages/Playlists";
import PlaylistNew from "./pages/PlaylistsNew";
import PlaylistDetail from "./pages/PlaylistDetail";
import TimeSheets from "./pages/TimeSheets";
import TimeSheetDetail from "./pages/TimeSheetDetail";
import TrackList from "./pages/Tracks";
import TrackDetail from "./pages/TrackDetail";
import Player from "./components/Player";
import Home from "./pages/Home/Index";
import Settings from "./pages/Settings";
import ComponentCatalog from "./pages/ComponentCatalog";
import GraphPlaylistDetail from "./pages/GraphPlaylistDetail";
import GraphPlaylists from "./pages/GraphPlaylists";

const theme = createTheme();

const App = () => {
  return (
    <>
      <RecoilRoot>
        <ThemeProvider theme={theme}>
          <HashRouter>
            <Suspense fallback={<Loading loading={true} />}>
              <Layout>
                <div style={{ width: "100%", height: "100%" }}>
                  <Routes>
                    <Route path="/playlists" element={<Playlists />} />
                    <Route
                      path="/graphplaylists"
                      element={<GraphPlaylists />}
                    />
                    <Route path="/playlists/new" element={<PlaylistNew />} />
                    <Route
                      path="/playlists/:playlistId"
                      element={<PlaylistDetail />}
                    />
                    <Route
                      path="/graphplaylists/:playlistId"
                      element={<GraphPlaylistDetail />}
                    />
                    <Route path="/tracks" element={<TrackList />} />
                    <Route path="/tracks/:trackId" element={<TrackDetail />} />
                    <Route path="/works" element={<Works />} />
                    <Route
                      path="/component-catalog"
                      element={<ComponentCatalog />}
                    />
                    <Route path="/works/:workId" element={<WorkDetail />} />
                    <Route path="/works/import" element={<ImportWork />} />
                    <Route path="/csvs/:csvId" element={<TimeSheetDetail />} />
                    <Route path="/csvs" element={<TimeSheets />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/" element={<Home />} />
                    <Route path="*" element={<div>not found</div>} />
                  </Routes>
                </div>
              </Layout>
              <Player />
            </Suspense>
          </HashRouter>
        </ThemeProvider>
      </RecoilRoot>
    </>
  );
};

export default App;
