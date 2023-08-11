import React, { useCallback } from "react";
import { Handle, Position, NodeProps } from "reactflow";

const handleStyle = { left: 10 };

type TrackNodeData = {
  trackId: string;
};

function TrackNode(props: NodeProps<TrackNodeData>) {
  const { data } = props;

  return (
    <>
      <Handle type="target" position={Position.Top} />
      <div>
        <label htmlFor="text">Text:</label>
      </div>
      <Handle type="source" position={Position.Bottom} id="a" />
      <Handle
        type="source"
        position={Position.Bottom}
        id="b"
        style={handleStyle}
      />
    </>
  );
}
export default TrackNode;
