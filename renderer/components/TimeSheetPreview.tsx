import React, { CSSProperties, useEffect, useRef, useState } from "react";
import { formatTime } from "../utils";
import { TimeSheetData } from "../types";

type TimeSheetPreviewProps = {
  content: TimeSheetData;
  onMouseDown?: (time: number) => void;
};
const TimeSheetPreview = ({ content, onMouseDown }: TimeSheetPreviewProps) => {
  const ref = useRef(null);
  const lastTimeStamp = content.length > 0 ? content[content.length - 1][0] : 0;
  const [mousePos, setMousePos] = useState({ x: 0, y: 0, time: 0 });
  const [showTimeStamp, setShowTimeStamp] = useState(false);
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const cvs: HTMLCanvasElement | null = ref.current;
    if (!cvs) return;
    const { width } = cvs;
    const { clientX, clientY } = e;
    const { left } = cvs.getBoundingClientRect();
    const x = clientX - left;

    const time = (x / width) * lastTimeStamp;
    setMousePos({ x: clientX, y: clientY, time });
  };
  const handleMouseDown = () => {
    if (onMouseDown) {
      onMouseDown(mousePos.time);
    }
  };
  useEffect(() => {
    const cvs: HTMLCanvasElement | null = ref.current;
    if (!cvs) return;
    const ctx = cvs.getContext("2d");
    const { width, height } = cvs;
    ctx.clearRect(0, 0, width, height);
    if (content.length == 0) {
      return;
    }
    const lastPoint = content[content.length - 1];
    const scaleFactorX = width / lastPoint[0];
    const scaleFactorY = height / 256;
    let lastY = height * 0.5;
    let nextY = lastY;
    ctx.beginPath();
    ctx.moveTo(0, height * 0.5);
    for (let i = 0; i < content.length; i++) {
      const [time, dir, val] = content[i];
      ctx.lineTo(time * scaleFactorX, lastY);
      nextY = ((dir ? val : -val) + 128) * scaleFactorY;
      ctx.lineTo(time * scaleFactorX, nextY);
      lastY = nextY;
    }
    ctx.stroke();
  }, [ref, content]);

  const style: CSSProperties = {
    position: "fixed",
    top: mousePos.y - 30,
    left: mousePos.x,
    transform: "translate(-50%, 0)",
    display: showTimeStamp ? "block" : "none",
  };
  return (
    <>
      <canvas
        ref={ref}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setShowTimeStamp(true)}
        onMouseLeave={() => setShowTimeStamp(false)}
      />
      <span style={style}>{formatTime(mousePos.time)}</span>
    </>
  );
};

export default TimeSheetPreview;
