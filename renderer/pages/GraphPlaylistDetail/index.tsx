import { Box, Button } from "@mui/material";
import React, { useCallback } from "react";
import ReactFlow, {
  Controls,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  addEdge,
  Node,
  Edge,
} from "reactflow";
import TrackNode from "./TrackNode";

import "reactflow/dist/style.css";
import "./style.css";
import BranchNode from "./BranchNode";

const nodeTypes = {
  track: TrackNode,
  branch: BranchNode,
};

const initialNodes: Node[] = [
  {
    id: "__start__",
    position: { x: 0, y: 0 },
    data: { label: "start" },
    type: "input",
  },
  {
    id: "__end__",
    position: { x: 0, y: 100 },
    data: { label: "end" },
    type: "output",
  },
];

const initialEdges: Edge[] = [{ id: "e1-2", source: "1", target: "2" }];
const GraphPlaylistDetail = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const changeNodeData = (id, nodes, data) => {
    const node = nodes.find((n) => n.id === id);
    console.log(node, nodes);
    if (node) {
      node.data = data;
      setNodes([...nodes]);
    }
  };
  const addTrack = () =>
    setNodes([
      ...nodes,
      {
        id: Math.random().toString(),
        type: "track",
        position: { x: 0, y: 0 },
        data: { label: "test" },
        width: 150,
        height: 40,
      },
    ]);
  const addBranch = () =>
    setNodes([
      ...nodes,
      {
        id: Math.random().toString(),
        type: "branch",
        position: { x: 0, y: 0 },
        data: { sources: [{ id: "0", ratio: 100 }], onChange: changeNodeData },
        width: 150,
        height: 40,
      },
    ]);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );
  return (
    <Box>
      <h1>GraphPlaylist Detail</h1>
      <div style={{ display: "flex" }}>
        <div
          style={{ width: "50vw", height: "100vh", border: "solid 1px red" }}>
          <Button onClick={addTrack}>add node</Button>
          <Button onClick={addBranch}>add branch</Button>
          <ReactFlow
            nodeTypes={nodeTypes}
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}>
            <Background color="#ccc" variant={BackgroundVariant.Cross} />
            <Controls />
          </ReactFlow>
        </div>
        <div
          style={{
            whiteSpace: "pre",
            fontFamily: "monospace",
            fontSize: "0.5rem",
          }}>
          data: {JSON.stringify({ nodes }, null, 2)}
        </div>
      </div>
    </Box>
  );
};

export default GraphPlaylistDetail;
