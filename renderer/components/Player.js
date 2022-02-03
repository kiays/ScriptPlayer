import React, { useState, useRef, useEffect } from "react";
import update from "immutability-helper";
import { ipcRenderer } from "electron";
import PlayerControl from "./PlayerControl";

const Player = ({ playlist }) => {
  const [playing, setPlaying] = useState(false);
  const [audioSrc, setTrack] = useState(null);
  const [trackIndex, setTrackIndex] = useState(0);
  const [playerInfo, setPlayerInfo] = useState({
    duration: 0,
    currentTime: 0,
    title: "",
  });
  const audioRef = useRef(null);
  const values =
    playlist.tracks.length > 0 && playlist.tracks[trackIndex].csvContent
      ? playlist.tracks[trackIndex].csvContent
      : [];

  useEffect(() => {
    const audioElem = audioRef.current;
    if (!audioElem) return;
    if (playlist.tracks.length <= trackIndex) return;

    const curretTrackUrl = playlist.tracks[trackIndex].url;
    if (audioSrc != curretTrackUrl) {
      console.log("update track", playlist.tracks[trackIndex]);
      audioElem.src = curretTrackUrl;
      setTrack(curretTrackUrl);
      setPlayerInfo({
        title: playlist.tracks[trackIndex].title,
        duration: audioElem.duration,
        currentTime: 0,
      });
    }
    if (playing) {
      audioElem.play();
    } else {
      audioElem.pause();
    }
  }, [audioRef, trackIndex, playing]);

  const seek = (e) => {
    const audioElem = audioRef.current;
    if (!audioElem) return;
    setPlayerInfo((info) =>
      update(info, { currentTime: { $set: e.target.value } })
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
      lastVal[2] + (lastVal[1] ? 128 : 0),
    ]);
  };

  const durationChanged = (e) => {
    const audioElem = audioRef.current;
    if (!audioElem) return;
    setPlayerInfo((info) =>
      update(info, { duration: { $set: audioElem.duration } })
    );
  };

  const playEnded = () => {
    if (trackIndex < playlist.tracks.length - 1) {
      setTrackIndex((i) => i + 1);
    } else {
      setPlaying(false);
      setTrackIndex(0);
    }
  };

  const next = () => {
    if (trackIndex >= playlist.tracks.length - 1) return;
    setTrackIndex(trackIndex + 1);
  };

  const prev = () => {
    if (trackIndex <= 0) return;
    setTrackIndex(trackIndex - 1);
  };

  return (
    <div>
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
      <audio
        ref={audioRef}
        onTimeUpdate={timeUpdated}
        onDurationChange={durationChanged}
        onEnded={playEnded}
      />
    </div>
  );
};

export default Player;
