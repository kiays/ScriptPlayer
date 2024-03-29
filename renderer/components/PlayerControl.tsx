import React from "react";
import { formatTime } from "../utils";

type PlayerControlProps = {
  onSeek: (value: number) => void;
  onPrev: () => void;
  onNext: () => void;
  playing: boolean;
  onPlayPause: () => void;
  playerInfo: {
    currentTime: number;
    duration: number;
    title: string;
  };
};

const PlayerControl = ({
  playerInfo,
  onSeek,
  onPrev,
  onNext,
  onPlayPause,
  playing,
}: PlayerControlProps) => {
  return (
    <>
      {formatTime(playerInfo.currentTime)} / {formatTime(playerInfo.duration)}
      <button aria-label="再生/停止" onClick={onPlayPause}>
        {playing ? "pause" : "play"}
      </button>
      <button aria-label="次のトラックを再生する" onClick={onPrev}>
        prev
      </button>
      <button aria-label="前のトラックを再生する" onClick={onNext}>
        next
      </button>
      <input
        aria-label="再生位置"
        type="range"
        value={playerInfo.currentTime}
        max={playerInfo.duration || 0}
        min={0}
        step={0.01}
        onChange={(e) => onSeek(Number(e.target.value))}></input>
      {playerInfo.title}
    </>
  );
};

export default PlayerControl;
