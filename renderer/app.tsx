import React, { Suspense, useEffect, useRef } from "react";
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

const theme = createTheme();

const App = () => {
  const [isPlayerOpen, setIsPlayerOpen] = React.useState(false);
  const [playerHeight, setPlayerHeight] = React.useState(0);
  const playerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!playerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      setPlayerHeight(entries[0]?.target?.clientHeight || 0);
    });
    observer.observe(playerRef.current);
    return () => observer.disconnect();
  }, [playerRef]);
  return (
    <>
      <RecoilRoot>
        <ThemeProvider theme={theme}>
          <HashRouter>
            <Suspense fallback={<Loading loading={true} />}>
              <Layout>
                <div
                  style={{
                    width: "100%",
                    height: `calc(100% - ${playerHeight + 65}px)`,
                    overflow: "scroll",
                  }}>
                  <Routes>
                    <Route path="/playlists" element={<Playlists />} />
                    <Route path="/playlists/new" element={<PlaylistNew />} />
                    <Route
                      path="/playlists/:playlistId"
                      element={<PlaylistDetail />}
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
                <Player
                  ref={playerRef}
                  open={isPlayerOpen}
                  setOpen={setIsPlayerOpen}
                />
              </Layout>
            </Suspense>
          </HashRouter>
        </ThemeProvider>
      </RecoilRoot>
    </>
  );
};

export default App;
