import React from "react";
import { Handle, Position, NodeProps, NodeToolbar } from "reactflow";
import { useRecoilValue } from "recoil";
import { trackById } from "../../states/tracks";
import { formatTime } from "../../utils";

type TrackNodeData = {
  trackId: string;
};

const shortenTrackName = (name: string) => {
  if (name.length < 20) return name;
  const i = name.lastIndexOf("/");
  if (i === -1) return name;
  return name.slice(i + 1);
};

function TrackNode(props: NodeProps<TrackNodeData>) {
  const { data, selected } = props;
  const { trackId } = data;
  const track = useRecoilValue(trackById(trackId));
  if (!track) return null;
  return (
    <>
      <NodeToolbar isVisible={selected}>
        <button>test</button>
        <button>test</button>
        <button>test</button>
      </NodeToolbar>
      <Handle type="target" position={Position.Top} />
      <div className="track-node">
        <img className="icon" src={track.work?.thumbnailPath} />
        <div className="name">{shortenTrackName(track.name)}</div>
        <div className="duration">{formatTime(track.duration)}</div>
      </div>
      <Handle type="source" position={Position.Bottom} id="a" />
    </>
  );
}
export default TrackNode;
