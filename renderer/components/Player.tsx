import React, { useState, useRef, useEffect } from "react";
import update from "immutability-helper";
import PlayerControl from "./PlayerControl";
import { IconButton, Paper } from "@mui/material";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { playerState } from "../states/player";
import { readCsvFile } from "../utils";
import { allTimeSheets } from "../states/timesheets";
import TimeSheetPreview from "./TimeSheetPreview";
import {
  Launch as OpenIcon,
  CloseFullscreen as CloseIcon,
} from "@mui/icons-material";
import { trackById } from "../states/tracks";
import { useBluetooth } from "../useBluetooth";
import { notificationsState } from "../states/notifications";
import { useUfoDataGenerator, createBuffer, runDevice } from "../devices/ufo";

const Player = () => {
  const [open, setOpen] = useState(false);
  const [{ tracks, trackIndex, playing }, setPlayerState] =
    useRecoilState(playerState);
  const [audioSrc, setTrack] = useState(null);
  const sheetDict = useRecoilValue(allTimeSheets);
  const [ufoScaleFactor, setScaleFactor] = useState(1.0);
  const { device, connected, connecting, requestDevice } = useBluetooth();
  const [playerInfo, setPlayerInfo] = useState({
    duration: 0,
    currentTime: 0,
    title: "",
  });
  const audioRef = useRef(null);
  const [values, setValues] = useState([]);
  const [inverted, setInverted] = useState(false);
  const setTrackInfo = useSetRecoilState(trackById(tracks[trackIndex]?.hash));
  const setNotifications = useSetRecoilState(notificationsState);
  const generateUfoData = useUfoDataGenerator(ufoScaleFactor, inverted);

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
      audioElem.src = curretTrackUrl;
      setTrack(curretTrackUrl);
      setPlayerInfo({
        title: tracks[trackIndex].name,
        duration: audioElem.duration,
        currentTime: 0,
      });
      setNotifications((ns) => [
        ...ns,
        {
          severity: "info",
          createdAt: new Date(),
          done: false,
          title: `${tracks[trackIndex].name}`,
          scope: "player:track_changed",
        },
      ]);
    }
    if (playing) {
      audioElem.play();
    } else {
      audioElem.pause();
    }
  }, [audioRef, trackIndex, playing, audioSrc, tracks, setNotifications]);

  useEffect(() => {
    if (!tracks || !tracks[trackIndex]) return;
    const track = tracks[trackIndex];
    const sheetIds = track.sheetIds || [];
    if (sheetIds.length != 0) {
      const sheetId = sheetIds[0];
      const sheet = sheetDict[sheetId];
      if (!sheet) return;
      readCsvFile(sheet.path).then(setValues);
    }
    if (track.csvUrl) {
      readCsvFile(track.csvUrl).then(setValues);
    }
  }, [tracks, trackIndex, sheetDict]);

  const onTimeSheetClicked = (time: number) => {
    const audioElem = audioRef.current;
    if (!audioElem) return;
    audioElem.currentTime = time;
  };
  const seek = (value: number) => {
    const audioElem = audioRef.current;
    if (!audioElem) return;
    setPlayerInfo((info) => update(info, { currentTime: { $set: value } }));
    audioElem.currentTime = value;
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
    if (!device) return;
    const data = generateUfoData(values);
    device?.writeValue(createBuffer(data));
  };

  const durationChanged = () => {
    const audioElem = audioRef.current;
    if (!audioElem) return;
    setPlayerInfo((info) =>
      update(info, { duration: { $set: audioElem.duration } })
    );
  };

  const playEnded = () => {
    setTrackInfo((s) => update(s, { numPlayed: { $set: s.numPlayed + 1 } }));
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
        color: "info.contrastText",
        bgcolor: "info.main",
      }}>
      <PlayerControl
        playerInfo={playerInfo}
        onSeek={seek}
        onNext={next}
        onPrev={prev}
        onPlayPause={() => setPlaying(!playing)}
        playing={playing}
      />
      <IconButton onClick={() => setOpen(!open)}>
        {open ? <CloseIcon /> : <OpenIcon />}
      </IconButton>
      {open && (
        <div>
          <div>
            <button
              onClick={() => requestDevice()}
              disabled={connected || connecting}>
              connect
            </button>
            <button
              onClick={() => {
                device.service.device.gatt.disconnect();
              }}
              disabled={!connected}>
              disconnect
            </button>
            <button
              onClick={() => {
                const records = [
                  [500, 0, 90, 0, 100],
                  [500, 0, 0, 0, 0],
                  [500, 0, 100, 0, 90],
                  [500, 0, 0, 0, 0],
                  [500, 0, 90, 0, 100],
                  [500, 0, 0, 0, 0],
                  [500, 0, 100, 0, 90],
                  [500, 0, 0, 0, 0],
                ];
                runDevice(records, device, generateUfoData);
              }}>
              動作確認同時
            </button>
            <button
              onClick={() => {
                const records = [
                  [500, 0, 100, 0, 0],
                  [500, 0, 0, 0, 0],
                  [500, 0, 100, 0, 0],
                  [500, 0, 0, 0, 0],
                  [500, 0, 100, 0, 0],
                  [500, 0, 0, 0, 0],
                ];
                runDevice(records, device, generateUfoData);
              }}>
              動作確認左
            </button>
            <button
              onClick={() => {
                const records = [
                  [500, 0, 0, 0, 100],
                  [500, 0, 0, 0, 0],
                  [500, 0, 0, 0, 100],
                  [500, 0, 0, 0, 0],
                  [500, 0, 0, 0, 100],
                  [500, 0, 0, 0, 0],
                ];
                runDevice(records, device, generateUfoData);
              }}>
              動作確認右
            </button>
            <button onClick={() => device?.writeValue(createBuffer([5, 0, 0]))}>
              停止
            </button>
            <button onClick={() => setInverted(!inverted)}>左右反転</button>
            <input
              onChange={(e) => setScaleFactor(Number(e.target.value))}
              type="range"
              min={0.1}
              max={1.5}
              step={0.01}
            />
            UFO Scale Factor: {ufoScaleFactor}
          </div>
          <TimeSheetPreview content={values} onMouseDown={onTimeSheetClicked} />
        </div>
      )}
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
