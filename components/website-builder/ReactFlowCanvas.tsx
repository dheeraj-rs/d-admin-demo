'use client';
import { useCallback, useRef, useEffect } from 'react';
import ReactFlow, {
    Node,
    Edge,
    Background,
    useNodesState,
    useEdgesState,
    addEdge,
    Connection,
    Panel,
    NodeTypes,
    useReactFlow,
    ReactFlowProvider,
    ConnectionMode,
    MarkerType,
    EdgeTypes,
    getSmoothStepPath,
} from 'reactflow';
import 'reactflow/dist/style.css';
import {  AlignCenter, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import websiteBuilderStore from './store/websiteBuilderStore';
import HtmlPreview from '../code-preview/HtmlPreview';
import SectionNode from './components/SectionNode';

const nodeTypes: NodeTypes = {
    sectionNode: SectionNode,
};

const defaultEdgeOptions = {
    type: 'custom',
    markerEnd: {
        type: MarkerType.ArrowClosed,
    },
    style: { stroke: '#94a3b8' },
    animated: false,
};

// Custom edge component with remove button
const CustomEdge = ({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, style = {}, markerEnd, selected, onReorder }: any) => {
    const [edgePath, labelX, labelY] = getSmoothStepPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
    });

    const { setEdges, getNodes, getEdges } = useReactFlow();

    const onEdgeClick = useCallback(
        (evt: React.MouseEvent) => {
            evt.stopPropagation();
            setEdges((edges) => {
                const newEdges = edges.filter((e) => e.id !== id);
                // After removing edge, reorder nodes
                setTimeout(() => {
                    const nodes = getNodes();
                    const remainingEdges = getEdges();
                    onReorder(nodes, remainingEdges);
                }, 0);
                return newEdges;
            });
        },
        [id, setEdges, getNodes, getEdges, onReorder]
    );

    return (
        <>
            <path id={id} style={style} className="react-flow__edge-path" d={edgePath} markerEnd={markerEnd} />
            {selected && (
                <g transform={`translate(${labelX - 10} ${labelY - 10})`}>
                    <circle
                        r={5}
                        className="react-flow__edge-path"
                        // style={{ fill: '#fff', stroke: '#2563eb' }}
                        onClick={onEdgeClick}
                    />
                </g>
            )}
        </>
    );
};

// Separate component for the flow content
const FlowContent = () => {
    const {
        viewportSize,
        page1SectionCodes,
        isPreviewMode,
        nodes: storeNodes,
        edges: storeEdges,
        setNodes: setStoreNodes,
        setEdges: setStoreEdges,
    } = websiteBuilderStore();

    const reactFlowWrapper = useRef<HTMLDivElement>(null);
    const [nodes, setNodes, onNodesChange] = useNodesState(storeNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(storeEdges);
    const { fitView, zoomIn, zoomOut, getNodes, getEdges } = useReactFlow();

    // Sync nodes and edges with store
    useEffect(() => {
        setStoreNodes(nodes);
    }, [nodes, setStoreNodes]);

    useEffect(() => {
        setStoreEdges(edges);
    }, [edges, setStoreEdges]);

    // Convert section codes to nodes
    useEffect(() => {
        if (page1SectionCodes.length > 0) {
            const newNodes: Node[] = page1SectionCodes.map((section, index) => ({
                id: section.id,
                type: 'sectionNode',
                position: { x: 250, y: index * 200 },
                data: { section },
            }));

            const newEdges: Edge[] = page1SectionCodes.slice(1).map((section, index) => ({
                id: `e${index}`,
                source: page1SectionCodes[index].id,
                target: section.id,
                ...defaultEdgeOptions,
            }));

            setNodes(newNodes);
            setEdges(newEdges);
        }
    }, [page1SectionCodes, setNodes, setEdges]);

    const reorderNodesByConnections = useCallback(
        (nodesToOrder = getNodes(), edgesToUse = getEdges()) => {
            // Create a map of node dependencies
            const nodeDependencies = new Map();
            edgesToUse.forEach((edge) => {
                if (!nodeDependencies.has(edge.target)) {
                    nodeDependencies.set(edge.target, []);
                }
                nodeDependencies.get(edge.target).push(edge.source);
            });

            // Find root nodes (nodes with no incoming edges)
            const rootNodes = nodesToOrder.filter((node) => !nodeDependencies.has(node.id));

            // Sort nodes based on dependencies
            const sortedNodes: Node[] = [];
            const visited = new Set();

            const visit = (nodeId: string) => {
                if (visited.has(nodeId)) return;
                visited.add(nodeId);

                const dependencies = nodeDependencies.get(nodeId) || [];
                dependencies.forEach(visit);

                const node = nodesToOrder.find((n) => n.id === nodeId);
                if (node) sortedNodes.push(node);
            };

            rootNodes.forEach((node) => visit(node.id));
            nodesToOrder.forEach((node) => visit(node.id));

            // Update node positions
            setNodes((nds) =>
                nds.map((node, index) => ({
                    ...node,
                    position: { x: 250, y: index * 200 },
                }))
            );
        },
        [getNodes, getEdges, setNodes]
    );

    const edgeTypes: EdgeTypes = {
        custom: (props) => <CustomEdge {...props} onReorder={reorderNodesByConnections} />,
    };

    const onConnect = useCallback(
        (params: Connection) => {
            setEdges((eds) => {
                const newEdges = addEdge(
                    {
                        ...params,
                        ...defaultEdgeOptions,
                    },
                    eds
                );
                // After adding new edge, reorder nodes
                setTimeout(() => {
                    const nodes = getNodes();
                    reorderNodesByConnections(nodes, newEdges);
                }, 0);
                return newEdges;
            });
        },
        [setEdges, getNodes, reorderNodesByConnections]
    );

    const arrangeNodesVertically = useCallback(() => {
        setNodes((nds) => {
            return nds.map((node, index) => ({
                ...node,
                position: { x: 250, y: index * 200 },
            }));
        });
    }, [setNodes]);

    const generateHtmlFromComponents = () => {
        if (!page1SectionCodes || page1SectionCodes.length === 0) {
            return '';
        }
        return page1SectionCodes.map((component) => component.snippet).join('\n');
    };

    const getDropZoneClass = () => {
        const baseClass = `editor__page editor__page--${viewportSize}`;
        if (isPreviewMode) return `${baseClass} preview-mode`;
        return baseClass;
    };

    return (
        <div className={getDropZoneClass()} ref={reactFlowWrapper}>
            {isPreviewMode ? (
                <div className="preview-container">
                    <HtmlPreview snippets={[{ language: 'html', code: generateHtmlFromComponents(), id: 'preview' }]} enableTailwind={true} />
                </div>
            ) : (
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    nodeTypes={nodeTypes}
                    edgeTypes={edgeTypes}
                    connectionMode={ConnectionMode.Loose}
                    defaultEdgeOptions={defaultEdgeOptions}
                    fitView
                    minZoom={0.1}
                    maxZoom={2}
                >
                    <Background />
                    <Panel position="bottom-left" className="layout-controls">
                        <button onClick={arrangeNodesVertically} title="Align Center" className="control-button">
                            <AlignCenter size={20} />
                        </button>
                        <button onClick={() => zoomIn()} title="Zoom In" className="control-button">
                            <ZoomIn size={20} />
                        </button>
                        <button onClick={() => zoomOut()} title="Zoom Out" className="control-button">
                            <ZoomOut size={20} />
                        </button>
                        <button onClick={() => fitView()} title="Fit View" className="control-button">
                            <Maximize2 size={20} />
                        </button>
                    </Panel>
                </ReactFlow>
            )}
        </div>
    );
};

// Main component
const ReactFlowCanvas = () => {
    return (
        <div className="website-builder-canvas__wrapper">
            <div className="editor__canvas-container" style={{ height: '100%', overflow: 'hidden' }}>
                <ReactFlowProvider>
                    <FlowContent />
                </ReactFlowProvider>
            </div>
        </div>
    );
};

export default ReactFlowCanvas;
