import React from "react";
import { formatTime } from "../utils";

const PlayerControl = ({
  playerInfo,
  onSeek,
  onPrev,
  onNext,
  onPlayPause,
  playing,
}) => {
  return (
    <div>
      <div>
        {formatTime(playerInfo.currentTime)} / {formatTime(playerInfo.duration)}
      </div>
      <button onClick={onPlayPause}>{playing ? "pause" : "play"}</button>
      <button onClick={onPrev}>prev</button>
      <button onClick={onNext}>next</button>
      <input
        type="range"
        value={playerInfo.currentTime}
        max={playerInfo.duration || 0}
        min={0}
        step={0.01}
        onChange={onSeek}
      ></input>
      <div>{playerInfo.title}</div>
    </div>
  );
};

export default PlayerControl;
