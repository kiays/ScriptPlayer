import React, { useCallback, useState } from "react";
import {
  Handle,
  Position,
  NodeProps,
  useUpdateNodeInternals,
  useNodes,
} from "reactflow";

type BranchData = {
  sources: { id: string; ratio: number }[];
  onChange: (id: string, nodes: Node[], data: BranchData) => void;
};

function BranchNode(props: NodeProps<BranchData>) {
  const updateNodeInternals = useUpdateNodeInternals();
  const nodes = useNodes();
  const { data, id } = props;
  const [sources, setSource] = useState(
    data.sources || [{ id: "0", ratio: 100 }]
  );
  const addSource = useCallback(() => {
    const newSources = [
      ...sources,
      { id: sources.length.toString(), ratio: 100 },
    ];
    setSource(newSources);
    data.onChange(id, nodes, { sources: newSources, onChange: data.onChange });
    updateNodeInternals(id);
  }, [sources, setSource, id, updateNodeInternals, nodes, data]);

  return (
    <>
      <Handle type="target" position={Position.Top} />
      <div className="branch-node">
        <label htmlFor="text">分岐</label>
        <button onClick={addSource}>+</button>
      </div>
      {sources.map((source, i) => (
        <Handle
          key={source.id}
          type="source"
          position={Position.Bottom}
          id={source.id}
          isConnectable={true}
          style={{ left: i * 30 }}
        />
      ))}
    </>
  );
}
export default BranchNode;
