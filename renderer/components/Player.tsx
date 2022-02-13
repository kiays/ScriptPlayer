import React, { useState, useRef, useEffect } from "react";
import update from "immutability-helper";
import { ipcRenderer } from "electron";
import PlayerControl from "./PlayerControl";
import { Paper } from "@mui/material";
import { useRecoilState, useRecoilValue } from "recoil";
import { playerState } from "../states/player";
import { readCsvFile } from "../utils";
import { allTimeSheets } from "../states/timesheets";
import TimeSheetPreview from "./TimeSheetPreview";

const Player = () => {
  const [{ tracks, trackIndex, playing }, setPlayerState] =
    useRecoilState(playerState);
  const [audioSrc, setTrack] = useState(null);
  const sheetDict = useRecoilValue(allTimeSheets);
  const [ufoScaleFactor, setScaleFactor] = useState(1.0);
  const [playerInfo, setPlayerInfo] = useState({
    duration: 0,
    currentTime: 0,
    title: "",
  });
  const audioRef = useRef(null);
  const [values, setValues] = useState([]);

  const setTrackIndex = (index) => {
    setPlayerState((s) => update(s, { trackIndex: { $set: index } }));
  };

  const setPlaying = (isPlaying: boolean) => {
    setPlayerState((s) => update(s, { playing: { $set: isPlaying } }));
  };

  useEffect(() => {
    const audioElem = audioRef.current;
    if (!audioElem || !tracks) return;
    if (tracks.length <= trackIndex) return;

    const curretTrackUrl = tracks[trackIndex].path;

    if (audioSrc != curretTrackUrl) {
      console.log("update track", tracks[trackIndex]);
      audioElem.src = curretTrackUrl;
      setTrack(curretTrackUrl);
      setPlayerInfo({
        title: tracks[trackIndex].name,
        duration: audioElem.duration,
        currentTime: 0,
      });
    }
    if (playing) {
      audioElem.play();
    } else {
      audioElem.pause();
    }
  }, [audioRef, trackIndex, playing, audioSrc, tracks]);

  useEffect(() => {
    if (!tracks || !tracks[trackIndex]) return;
    const sheetIds = tracks[trackIndex].sheetIds || [];
    if (sheetIds.length == 0) return;
    const sheetId = sheetIds[0];
    const sheet = sheetDict[sheetId];
    if (!sheet) return;
    readCsvFile(sheet.path).then(setValues);
  }, [tracks, trackIndex, sheetDict]);

  const seek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audioElem = audioRef.current;
    if (!audioElem) return;
    setPlayerInfo((info) =>
      update(info, { currentTime: { $set: Number(e.target.value) } })
    );
    audioElem.currentTime = e.target.value;
  };

  const timeUpdated = () => {
    const audioElem = audioRef.current;
    if (!audioElem) return;
    setPlayerInfo((info) =>
      update(info, { currentTime: { $set: audioElem.currentTime } })
    );
    if (values.length == 0) return;
    let lastVal = null;
    const currentTime = audioElem.currentTime;
    for (let i = 0; i < values.length; i++) {
      if (values[i][0] < currentTime) {
        lastVal = values[i];
      } else {
        break;
      }
    }
    if (!lastVal) return;
    ipcRenderer.invoke("send-to-device", [
      0x02,
      0x00,
      Math.floor(lastVal[2] * ufoScaleFactor) + (lastVal[1] ? 128 : 0),
    ]);
  };

  const durationChanged = () => {
    const audioElem = audioRef.current;
    if (!audioElem) return;
    setPlayerInfo((info) =>
      update(info, { duration: { $set: audioElem.duration } })
    );
  };

  const playEnded = () => {
    if (trackIndex < tracks.length - 1) {
      setTrackIndex(trackIndex + 1);
    } else {
      setPlaying(false);
      setTrackIndex(0);
    }
  };

  const next = () => {
    if (trackIndex >= tracks.length - 1) return;
    setTrackIndex(trackIndex + 1);
  };

  const prev = () => {
    if (trackIndex <= 0) return;
    setTrackIndex(trackIndex - 1);
  };

  return (
    <Paper
      sx={{
        zIndex: 1250,
        position: "fixed",
        bottom: 0,
        margin: 2,
        padding: 2,
      }}>
      <PlayerControl
        playerInfo={playerInfo}
        onSeek={seek}
        onNext={next}
        onPrev={prev}
        onPlayPause={() => setPlaying(!playing)}
        playing={playing}
      />
      <button onClick={() => ipcRenderer.invoke("send-to-device", [2, 0, 100])}>
        test device
      </button>
      <button onClick={() => ipcRenderer.invoke("send-to-device", [2, 0, 0])}>
        stop device
      </button>
      <input
        onChange={(e) => setScaleFactor(Number(e.target.value))}
        type="range"
        min={0.1}
        max={1.0}
        step={0.01}
      />
      UFO Scale Factor: {ufoScaleFactor}
      <TimeSheetPreview content={values} />
      <audio
        ref={audioRef}
        onTimeUpdate={timeUpdated}
        onDurationChange={durationChanged}
        onEnded={playEnded}
      />
    </Paper>
  );
};

export default Player;
