import { Box, Button, IconButton } from "@mui/material";
import React, { useCallback, useState } from "react";
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
import { PlayArrow as PlayIcon } from "@mui/icons-material";

import "reactflow/dist/style.css";
import "./style.css";
import BranchNode from "./BranchNode";
import TrackNode from "./TrackNode";
import TrackPickModal from "../../components/TrackPickModal";

import { nodes as testNodes, edges as testEdges } from "./testdata";
import { playerState } from "../../states/player";
import { useRecoilState, useRecoilValue } from "recoil";
import { tracksWithWork } from "../../states/tracks";

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
  const [nodes, setNodes, onNodesChange] = useNodesState(testNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(testEdges);
  const [isModalOpen, setModalOpen] = useState(false);
  const [_player, setPlayerState] = useRecoilState(playerState);
  const allTracks = useRecoilValue(tracksWithWork);
  const changeNodeData = (id, nodes, data) => {
    const node = nodes.find((n) => n.id === id);
    console.log(node, nodes);
    if (node) {
      node.data = data;
      setNodes([...nodes]);
    }
  };
  const addTrack = (hash: string) =>
    setNodes([
      ...nodes,
      {
        id: Math.random().toString(),
        type: "track",
        position: { x: 0, y: 0 },
        data: { trackId: hash },
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

  const play = (e) => {
    const tracksWithNodeId = nodes
      .map((n) => {
        if (n.data?.trackId) {
          return { trackId: n.data.trackId, nodeId: n.id };
        }
        return null;
      })
      .filter(Boolean)
      .map((n, i) => {
        return {
          track: allTracks[n.trackId],
          nodeId: n.nodeId,
          index: i,
        };
      });
    const initialEdge = edges.find((e) => e.source == "__start__");
    const initialTrack = tracksWithNodeId.find(
      (o) => o.nodeId == initialEdge?.target
    );
    console.log(initialEdge, initialTrack);
    const getNode = (id) => nodes.find((n) => n.id == id);
    const getTrackNode = (id) => tracksWithNodeId.find((n) => n.nodeId == id);

    const transitionMap = nodes
      .map((n) => {
        const egressEdges = edges.filter((e) => e.source == n.id);
        const thisNode = getTrackNode(n.id);
        if (!thisNode) return null;
        return {
          next: egressEdges.flatMap((e) => {
            if (e.target == "__end__") {
              return null;
            }
            const nextNode = getTrackNode(e.target);
            if (nextNode) {
              return nextNode.index;
            }
            const branchNode = getNode(e.target);
            return edges
              .filter((e) => e.source == branchNode.id)
              .map((e) => getTrackNode(e.target))
              .filter(Boolean)
              .map((n) => n.index);
          }),
        };
      })
      .filter(Boolean);

    e.stopPropagation();
    setPlayerState({
      currentTrackId: null,
      trackIndex: initialTrack.index,
      tracks: tracksWithNodeId.map((t) => t.track),
      playlistPath: location.hash,
      playing: true,
      playlistType: "graph",
      playlistId: "test-graph-playlist",
      transitions: transitionMap,
    });
  };
  return (
    <Box>
      <h1>GraphPlaylist Detail</h1>
      <IconButton onClick={play}>
        <PlayIcon />
      </IconButton>
      <div style={{ display: "flex" }}>
        <div
          style={{ width: "50vw", height: "100vh", border: "solid 1px red" }}>
          <Button onClick={addBranch}>add branch</Button>
          <Button onClick={() => setModalOpen(true)}>add track</Button>
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
          data: {JSON.stringify({ nodes, edges }, null, 2)}
        </div>
      </div>
      <TrackPickModal
        open={isModalOpen}
        onClose={() => setModalOpen(false)}
        addTrack={addTrack}
      />
    </Box>
  );
};

export default GraphPlaylistDetail;
