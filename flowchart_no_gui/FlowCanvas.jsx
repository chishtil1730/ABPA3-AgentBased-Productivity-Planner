import { useCallback, useMemo, useState, useEffect, useRef } from "react";
import Dock from "../Dock";
import { VscHome, VscArchive, VscAccount, VscSettingsGear } from "react-icons/vsc";
import {
    ReactFlow,
    ReactFlowProvider,
    Background,
    Controls,
    useNodesState,
    useEdgesState,
    addEdge,
    useReactFlow,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";
import NodeCustom from "./NodeCustom";
import NodeLabel from "./NodeLabel.jsx";
import NodeGroup from "./NodeGroup.jsx";


const nodeTypes = {
    glass: NodeCustom,
    label: NodeLabel,
    group: NodeGroup
};

const customStyles = `
  .react-flow__selection {
    background: rgba(255, 255, 255, 0.1) !important;
    border: 1px solid rgba(255, 255, 255, 0.8) !important;
  }
  
  .react-flow__nodesselection-rect {
    background: rgba(255, 255, 255, 0.1) !important;
    border: 1px solid rgba(255, 255, 255, 0.8) !important;
  }
`;

const STORAGE_KEY = "flowcanvas-v1";

const initialNodes = [
    {
        id: "n1",
        type: "glass",
        data: { title: "Start", desc: "..." },
        position: { x: 200, y: 100 }
    },
    {
        id: "lbl1",
        type: "label",
        data: { text: "Connects with" },
        position: { x: 260, y: 190 }
    },
    {
        id: "n2",
        type: "glass",
        data: { title: "Upsell Agent", desc: "..." },
        position: { x: 200, y: 300 }
    }
];

const initialEdges = [
    { id: "e1", source: "n1", target: "lbl1", type: "smoothstep", animated: false, style: { stroke: "white", opacity: 0.4 } },
    { id: "e2", source: "lbl1", target: "n2", type: "smoothstep", animated: false, style: { stroke: "white", opacity: 0.4 } }
];


function FlowCanvas() {
    const reactFlowInstance = useRef(null);

    const loadFromStorage = () => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return null;
            return JSON.parse(raw);
        } catch {
            return null;
        }
    };

    const saved = loadFromStorage();
    const savedViewportRef = useRef(saved?.viewport);
    const [isViewportReady, setIsViewportReady] = useState(false);

    const [nodes, setNodes, onNodesChange] = useNodesState(
        saved?.nodes ?? initialNodes
    );
    const [edges, setEdges, onEdgesChange] = useEdgesState(
        saved?.edges ?? initialEdges
    );

    useEffect(() => {
        if (!reactFlowInstance.current || !isViewportReady) return;

        // Debounce the save to avoid too many writes
        const timeoutId = setTimeout(() => {
            const data = {
                nodes: nodes.map(node => ({
                    ...node,
                    // Ensure all properties including style are preserved
                    data: { ...node.data },
                    style: { ...node.style },
                    position: { ...node.position }
                })),
                edges: edges.map(edge => ({ ...edge })),
                viewport: reactFlowInstance.current.getViewport(),
            };

            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        }, 100);

        return () => clearTimeout(timeoutId);
    }, [nodes, edges, isViewportReady]);

    const [selected, setSelected] = useState([]);

    const [history, setHistory] = useState([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const isUndoRedoRef = useRef(false);

    const { screenToFlowPosition } = useReactFlow();

    const saveToHistory = useCallback((nodes, edges) => {
        if (isUndoRedoRef.current) return;

        setHistory(prev => {
            const newHistory = prev.slice(0, historyIndex + 1);
            const newState = {
                nodes: JSON.parse(JSON.stringify(nodes)),
                edges: JSON.parse(JSON.stringify(edges))
            };
            const updatedHistory = [...newHistory, newState].slice(-50);
            setHistoryIndex(updatedHistory.length - 1);
            return updatedHistory;
        });
    }, [historyIndex]);

    const deleteSelectedNodes = useCallback(() => {
        if (!selected.length) return;

        setNodes((nds) => nds.filter((n) => !selected.includes(n.id)));
        setEdges((eds) =>
            eds.filter(
                (e) =>
                    !selected.includes(e.source) &&
                    !selected.includes(e.target)
            )
        );

        setSelected([]);
    }, [selected, setNodes, setEdges]);

    const undo = useCallback(() => {
        if (historyIndex > 0) {
            isUndoRedoRef.current = true;
            const prevState = history[historyIndex - 1];
            setNodes(prevState.nodes);
            setEdges(prevState.edges);
            setHistoryIndex(historyIndex - 1);
            setSelected([]);

            setTimeout(() => {
                isUndoRedoRef.current = false;
            }, 100);
        }
    }, [historyIndex, history, setNodes, setEdges]);

    const redo = useCallback(() => {
        if (historyIndex < history.length - 1) {
            isUndoRedoRef.current = true;
            const nextState = history[historyIndex + 1];
            setNodes(nextState.nodes);
            setEdges(nextState.edges);
            setHistoryIndex(historyIndex + 1);
            setSelected([]);

            setTimeout(() => {
                isUndoRedoRef.current = false;
            }, 100);
        }
    }, [historyIndex, history, setNodes, setEdges]);

    useEffect(() => {
        if (!isUndoRedoRef.current && nodes.length > 0) {
            const timeoutId = setTimeout(() => {
                saveToHistory(nodes, edges);
            }, 300);

            return () => clearTimeout(timeoutId);
        }
    }, [nodes, edges, saveToHistory]);

    const selectAllNodes = useCallback(() => {
        const allNodeIds = nodes.map(n => n.id);
        setSelected(allNodeIds);
    }, [nodes]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            const t = e.target;

            const isEditing =
                t.tagName === "INPUT" ||
                t.tagName === "TEXTAREA" ||
                t.isContentEditable;

            if (isEditing) return;

            if ((e.ctrlKey || e.metaKey) && e.key === "a") {
                e.preventDefault();
                selectAllNodes();
                return;
            }

            if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
                e.preventDefault();
                undo();
                return;
            }

            if (
                ((e.ctrlKey || e.metaKey) && e.key === "y") ||
                ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "z")
            ) {
                e.preventDefault();
                redo();
                return;
            }

            if (e.key === "Delete" && selected.length) {
                e.preventDefault();
                deleteSelectedNodes();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [
        selected,
        undo,
        redo,
        deleteSelectedNodes,
        selectAllNodes,
    ]);

    const onNodeClick = useCallback((_, node) => {
        setSelected((prev) => {
            if (prev.includes(node.id)) return prev.filter((id) => id !== node.id);
            if (prev.length === 2) return prev;
            return [...prev, node.id];
        });
    }, []);

    const addLabelNode = () => {
        if (selected.length !== 2) {
            alert("Please select exactly 2 nodes");
            return;
        }

        const [a, b] = selected;

        const nodeA = nodes.find(n => n.id === a);
        const nodeB = nodes.find(n => n.id === b);

        if (!nodeA || !nodeB) return;

        if (nodeA.type === "label" || nodeB.type === "label") {
            alert("Cannot add label between label nodes");
            return;
        }

        const midX = (nodeA.position.x + nodeB.position.x) / 2;
        const midY = (nodeA.position.y + nodeB.position.y) / 2;

        const labelId = "lbl-" + Date.now();

        setNodes(nds => [
            ...nds,
            {
                id: labelId,
                type: "label",
                position: { x: midX, y: midY },
                data: { text: "Label..." }
            }
        ]);

        setEdges(eds =>
            eds.filter(e => {
                const isDirect =
                    (e.source === a && e.target === b) ||
                    (e.source === b && e.target === a);
                return !isDirect;
            })
        );

        setTimeout(() => {
            setEdges(eds => [
                ...eds,
                {
                    id: "e-" + Date.now() + "-a",
                    source: a,
                    target: labelId,
                    type: "smoothstep",
                    animated: false,
                    style: { stroke: "rgba(255,255,255,0.6)", strokeWidth: 1.2 }
                },
                {
                    id: "e-" + Date.now() + "-b",
                    source: labelId,
                    target: b,
                    type: "smoothstep",
                    animated: false,
                    style: { stroke: "rgba(255,255,255,0.6)", strokeWidth: 1.2 }
                }
            ]);
        }, 0);

        setSelected([]);
    };

    const onSelectionChange = ({ nodes }) => {
        const ids = nodes?.map(n => n.id) ?? [];

        setSelected(prev => {
            const same =
                prev.length === ids.length &&
                prev.every((v, i) => v === ids[i]);

            return same ? prev : ids;
        });
    };

    const renderNodes = useMemo(
        () => nodes,
        [nodes]
    );

    const connectNodes = () => {
        if (selected.length !== 2) return;

        setEdges((eds) =>
            addEdge(
                {
                    id: Date.now().toString(),
                    source: selected[0],
                    target: selected[1],
                    type: "smoothstep",
                    animated: false,
                    style: { stroke: "rgba(255,255,255,0.6)", strokeWidth: 0.6 },
                },
                eds
            )
        );

        setSelected([]);
    };

    const addNode = () => {
        const id = Date.now().toString();

        const viewportCenter = screenToFlowPosition({
            x: window.innerWidth / 2,
            y: window.innerHeight / 2,
        });

        setNodes((ns) => [
            ...ns,
            {
                id,
                type: "glass",
                position: {
                    x: viewportCenter.x - 100,
                    y: viewportCenter.y - 50
                },
                data: { title: "New Node", desc: "..." },
            },
        ]);
    };

    const createGroupFromSelection = () => {
        if (selected.length < 2) {
            alert("Please select at least 2 nodes to create a group");
            return;
        }



        const selectedNodes = nodes.filter(n => selected.includes(n.id) && n.type !== 'group');

        if (selectedNodes.length < 2) {
            alert("Please select at least 2 non-group nodes");
            return;
        }

        // Calculate bounding box
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

        selectedNodes.forEach(node => {
            const nodeWidth = node.style?.width || 200;
            const nodeHeight = node.style?.height || 100;

            minX = Math.min(minX, node.position.x);
            minY = Math.min(minY, node.position.y);
            maxX = Math.max(maxX, node.position.x + nodeWidth);
            maxY = Math.max(maxY, node.position.y + nodeHeight);

        });

        const padding = 30;
        const groupId = "group-" + Date.now();

        const colors = [
            'rgba(139, 92, 246, 0.15)',  // purple
            'rgba(59, 130, 246, 0.15)',  // blue
            'rgba(16, 185, 129, 0.15)',  // green
            'rgba(251, 146, 60, 0.15)',  // orange
            'rgba(236, 72, 153, 0.15)',  // pink
        ];

        const randomColor = colors[Math.floor(Math.random() * colors.length)];

        setNodes(ns => [
            {
                id: groupId,
                type: "group",
                position: {
                    x: minX - padding,
                    y: minY - padding
                },
                style: {
                    width: maxX - minX + (padding * 2),
                    height: maxY - minY + (padding * 2),
                    zIndex: -1
                },
                data: {
                    title: "Group",
                    color: randomColor
                },
                draggable: true,
                selectable: true
            },
            ...ns
        ]);

        setSelected([]);
    };

    const items = [
        { label: "Connect", onClick: connectNodes },
        { label: "Add Node", onClick: addNode },
        { label: "Add Label", onClick: addLabelNode },
        { label: "Create Group", onClick: createGroupFromSelection },
        { label: "Delete", onClick: deleteSelectedNodes },
        { label: "Undo", onClick: undo },
        { label: "Redo", onClick: redo },
    ];

    return (
        <div style={{ width: "100vw", height: "100vh", background: "#2052a1" }}>
            <style>{customStyles}</style>
            <ReactFlow
                onInit={(instance) => {
                    reactFlowInstance.current = instance;

                    // Restore viewport after initialization
                    if (savedViewportRef.current) {
                        instance.setViewport(savedViewportRef.current, { duration: 0 });
                    }

                    // Mark viewport as ready
                    setIsViewportReady(true);
                }}
                nodeTypes={nodeTypes}
                style={{ opacity: isViewportReady ? 1 : 0 }}
                nodes={renderNodes}
                edges={edges}
                onNodeClick={onNodeClick}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onSelectionChange={onSelectionChange}
                selectionOnDrag
                panOnDrag={false}
                selectionMode="partial"
                minZoom={0.2}
                maxZoom={2}
            >
                <Background
                    color="rgba(255,255,255,0.05)"
                    gap={16}
                    size={1}
                />
            </ReactFlow>
            <Dock
                items={items}
                panelHeight={68}
                baseItemSize={50}
                magnification={70}
            />
        </div>
    );
}


export default FlowCanvas;