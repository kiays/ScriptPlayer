import React, { useState, useRef, useEffect } from "react";
import * as Sentry from "@sentry/browser";
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
import {
  useUfoDataGenerator,
  createBuffer,
  runDevice,
  handleDeviceError,
} from "../devices/ufo";

const PlayerSingleton = {
  promise: Promise.resolve(),
};

const Player = () => {
  const [open, setOpen] = useState(false);
  const [
    { tracks, trackIndex, playing, transitions, playlistType },
    setPlayerState,
  ] = useRecoilState(playerState);
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
      Sentry.addBreadcrumb({
        category: "player",
        message: `track changed: ${tracks[trackIndex].name}`,
        level: "info",
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
      (PlayerSingleton.promise || Promise.resolve()).then(() => {
        PlayerSingleton.promise = audioElem.play();
      });
    } else {
      (PlayerSingleton.promise || Promise.resolve()).then(() => {
        PlayerSingleton.promise = audioElem.pause();
      });
    }
  }, [audioRef, trackIndex, playing, audioSrc, tracks, setNotifications]);

  useEffect(() => {
    if (!tracks || !tracks[trackIndex]) return;
    const track = tracks[trackIndex];
    const sheetIds = track.sheetIds || [];
    const handleReadCsvFileError = (e) => {
      if (!e) return false;
      setNotifications((ns) => [
        ...ns,
        {
          severity: "error",
          createdAt: new Date(),
          done: false,
          title: e.message,
          scope: "player:read_csv_file",
        },
      ]);
      return true;
    };
    let shouldFallThrough = Promise.resolve(true);
    if (sheetIds.length != 0) {
      const sheetId = sheetIds[0];
      const sheet = sheetDict[sheetId];
      if (!sheet) return;
      shouldFallThrough = readCsvFile(sheet.path)
        .then(setValues)
        .then(() => false)
        .catch(handleReadCsvFileError);
    }
    if (track.csvUrl) {
      shouldFallThrough
        .then((go) => (go ? readCsvFile(track.csvUrl) : Promise.reject()))
        .then(setValues)
        .catch(handleReadCsvFileError);
    }
  }, [tracks, trackIndex, sheetDict, setNotifications]);

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
    const data = generateUfoData(lastVal);
    device?.writeValue(createBuffer(data)).catch(handleDeviceError);
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
    if (playlistType == "graph") {
      if (transitions[trackIndex].next.length === 0) return;
      if (transitions[trackIndex].next.length === 1)
        setTrackIndex(transitions[trackIndex].next[0]);
      else {
        const nextTrackIndex =
          transitions[trackIndex].next[
            Math.floor(Math.random() * transitions[trackIndex].next.length)
          ];
        setTrackIndex(nextTrackIndex);
      }
      return;
    }
    if (trackIndex >= tracks.length - 1) return;
    setTrackIndex(trackIndex + 1);
  };

  const prev = () => {
    if (playlistType == "graph") {
      return;
    }
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
      <IconButton
        aria-label="プレイヤーコントロールをトグルする"
        onClick={() => setOpen(!open)}>
        {open ? <CloseIcon /> : <OpenIcon />}
      </IconButton>
      {open && (
        <div>
          <div>
            <button
              aria-label="デバイスに接続する"
              onClick={() => requestDevice()}
              disabled={connected || connecting}>
              connect
            </button>
            <button
              aria-label="デバイスから切断する"
              onClick={() => {
                device.service.device.gatt.disconnect();
              }}
              disabled={!connected}>
              disconnect
            </button>
            <button
              aria-label="デバイスの動作確認を行う"
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
              aria-label="デバイスの左側の動作確認を行う"
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
              aria-label="デバイスの右側の動作確認を行う"
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
            <button
              aria-label="デバイスの動作停止"
              onClick={() =>
                device
                  ?.writeValue(createBuffer([5, 0, 0]))
                  .catch(handleDeviceError)
              }>
              停止
            </button>
            <button
              aria-label="デバイスの左右を入れ替える"
              onClick={() => setInverted(!inverted)}>
              左右反転
            </button>
            <input
              aria-label="デバイスの強度を変更する"
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
