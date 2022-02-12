import React, { useEffect, useRef } from "react";

type TimeSheetPreviewProps = {
  content: TimeSheetData;
};
const TimeSheetPreview = ({ content }: TimeSheetPreviewProps) => {
  const ref = useRef(null);
  useEffect(() => {
    const cvs: HTMLCanvasElement | null = ref.current;
    if (!cvs || content.length == 0) return;
    const ctx = cvs.getContext("2d");
    const lastPoint = content[content.length - 1];
    const { width, height } = cvs;
    const scaleFactorX = width / lastPoint[0];
    const scaleFactorY = height / 256;
    let lastY = 128;
    let nextY = lastY;
    ctx.moveTo(0, 128);
    for (let i = 0; i < content.length; i++) {
      const [time, dir, val] = content[i];
      ctx.lineTo(time * scaleFactorX, lastY);
      nextY = ((dir ? val : -val) + 128) * scaleFactorY;
      ctx.lineTo(time * scaleFactorX, nextY);
      lastY = nextY;
    }
    ctx.stroke();
  }, [ref, content]);
  return <canvas ref={ref} />;
};

export default TimeSheetPreview;
