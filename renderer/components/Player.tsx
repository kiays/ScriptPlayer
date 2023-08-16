import React, { useState, useRef, useEffect, forwardRef } from "react";
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
  Launch as FullscreenIcon,
  UnfoldLess as CloseIcon,
  Cancel as CancelIcon,
  Expand as OpenIcon,
  Tv as DisplayIcon,
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
import styled from "@emotion/styled";

const PlayerSingleton = {
  promise: Promise.resolve(),
};

type PlayerProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
};
const Player = forwardRef<HTMLDivElement, PlayerProps>(function Player(
  { open, setOpen },
  ref
) {
  const [{ tracks, trackIndex, playing, hideControls }, setPlayerState] =
    useRecoilState(playerState);
  const [trackSrc, setTrack] = useState(null);
  const sheetDict = useRecoilValue(allTimeSheets);
  const [ufoScaleFactor, setScaleFactor] = useState(1.0);
  const { device, connected, connecting, requestDevice } = useBluetooth();
  const [playerInfo, setPlayerInfo] = useState({
    duration: 0,
    currentTime: 0,
    title: "",
  });
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [values, setValues] = useState([]);
  const [inverted, setInverted] = useState(false);
  const setTrackInfo = useSetRecoilState(trackById(tracks[trackIndex]?.hash));
  const setNotifications = useSetRecoilState(notificationsState);
  const [isAudioTrack, setIsAudioTrack] = useState(true);
  const [showVideo, setShowVideo] = useState(false);
  const generateUfoData = useUfoDataGenerator(ufoScaleFactor, inverted);
  const getMediaElem = (): HTMLAudioElement | HTMLVideoElement | null =>
    isAudioTrack ? audioRef.current : videoRef.current;

  const setHideControls = (hide: boolean) =>
    setPlayerState((s) => update(s, { hideControls: { $set: hide } }));
  const setTrackIndex = (index) => {
    setPlayerState((s) => update(s, { trackIndex: { $set: index } }));
  };

  const setPlaying = (isPlaying: boolean) => {
    setPlayerState((s) => update(s, { playing: { $set: isPlaying } }));
    if (!isAudioTrack && isPlaying) {
      setShowVideo(true);
    }
  };

  useEffect(() => {
    if (!tracks) return;
    if (tracks.length <= trackIndex) return;

    const curretTrackUrl = tracks[trackIndex].path;
    const isAudioTrack =
      curretTrackUrl.endsWith(".mp3") || curretTrackUrl.endsWith(".wav");
    const isVideoTrack = !isAudioTrack;
    const audioElem = audioRef.current;
    const videoElem = videoRef.current;
    let elem: HTMLVideoElement | HTMLAudioElement | null = null;
    if (isAudioTrack && !audioElem) return;
    if (isVideoTrack && !videoElem) return;
    if (isAudioTrack) {
      elem = audioElem;
    } else {
      elem = videoElem;
      setShowVideo(true);
    }

    if (trackSrc != curretTrackUrl) {
      elem.src = curretTrackUrl;
      setTrack(curretTrackUrl);
      setIsAudioTrack(isAudioTrack);
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
        PlayerSingleton.promise = elem.play();
      });
    } else {
      (PlayerSingleton.promise || Promise.resolve()).then(() => {
        PlayerSingleton.promise = Promise.resolve();
        elem.pause();
      });
    }
  }, [
    audioRef,
    videoRef,
    trackIndex,
    playing,
    trackSrc,
    tracks,
    setNotifications,
    setIsAudioTrack,
  ]);

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
    const elem = getMediaElem();
    if (!elem) return;
    elem.currentTime = time;
  };
  const seek = (value: number) => {
    const elem = getMediaElem();
    if (!elem) return;
    setPlayerInfo((info) => update(info, { currentTime: { $set: value } }));
    elem.currentTime = value;
  };

  const timeUpdated = () => {
    const elem = getMediaElem();
    if (!elem) return;
    setPlayerInfo((info) =>
      update(info, { currentTime: { $set: elem.currentTime } })
    );
    if (values.length == 0) return;
    let lastVal = null;
    const currentTime = elem.currentTime;
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
    const elem = getMediaElem();
    if (!elem) return;
    setPlayerInfo((info) =>
      update(info, { duration: { $set: elem.duration } })
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
    <>
      <VideoContainer $showVideo={showVideo}>
        <video
          style={{ width: "100%", height: "100%" }}
          ref={videoRef}
          onTimeUpdate={timeUpdated}
          onDurationChange={durationChanged}
          onEnded={playEnded}
          onDoubleClick={() => videoRef.current.requestFullscreen()}
        />
        <IconButton
          onClick={() => setShowVideo(false)}
          style={{
            position: "absolute",
            top: "5rem",
            right: "2.5rem",
            color: "rgba(255,255,255,0.5)",
          }}>
          <CancelIcon />
        </IconButton>
      </VideoContainer>
      <Paper
        ref={ref}
        sx={{
          zIndex: 1250,
          bottom: 0,
          margin: 0,
          padding: 2,
          color: "info.contrastText",
          bgcolor: "info.main",
          position: "fixed",
          display: hideControls ? "none" : "block",
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
        <IconButton
          aria-label="プレイヤーコントロールを非表示にする"
          onClick={() => setHideControls(true)}>
          {hideControls ? <OpenIcon /> : <CancelIcon />}
        </IconButton>
        {!isAudioTrack && videoRef.current?.src && (
          <IconButton
            aria-label="動画をフルスクリーンにする"
            onClick={() => {
              setShowVideo(true);
              videoRef.current.requestFullscreen();
            }}>
            <FullscreenIcon />
          </IconButton>
        )}
        {!isAudioTrack && !showVideo && (
          <IconButton
            aria-label="動画を表示する"
            onClick={() => {
              setShowVideo(true);
            }}>
            <DisplayIcon />
          </IconButton>
        )}
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
            <TimeSheetPreview
              content={values}
              onMouseDown={onTimeSheetClicked}
            />
          </div>
        )}
        <audio
          ref={audioRef}
          onTimeUpdate={timeUpdated}
          onDurationChange={durationChanged}
          onEnded={playEnded}
        />
      </Paper>
    </>
  );
});

export default Player;

const VideoContainer = styled.div<{ $showVideo }>`
  position: fixed;
  display: ${({ $showVideo }) => ($showVideo ? "block" : "none")};
  background-color: black;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  z-index: 1000;
`;
