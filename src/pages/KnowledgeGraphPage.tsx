import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { GitBranch } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface GraphNode {
    id: string;
    node_type: string;
    properties: Record<string, any>;
}

interface GraphEdge {
    id: string;
    from_node_id: string;
    to_node_id: string;
    relationship_type: string;
    properties: Record<string, any>;
}

const NODE_COLORS: Record<string, string> = {
    Repository: '#00FFFF',
    File: '#8B5CF6',
    Function: '#F59E0B',
    Class: '#EC4899',
    Issue: '#EF4444',
    PR: '#10B981',
    Document: '#3B82F6',
    Directory: '#6B7280',
};

const EDGE_COLORS: Record<string, string> = {
    IMPORTS: '#8B5CF6',
    CALLS: '#F59E0B',
    EXTENDS: '#EC4899',
    REFERENCES: '#3B82F6',
    DEPENDS_ON: '#EF4444',
    AUTHORED_BY: '#10B981',
    CONTAINS: '#6B7280',
};

export default function KnowledgeGraphPage() {
    const [nodes, setNodes] = useState<GraphNode[]>([]);
    const [edges, setEdges] = useState<GraphEdge[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
    const [typeFilter, setTypeFilter] = useState<string | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [positions, setPositions] = useState<Record<string, { x: number; y: number }>>({});

    useEffect(() => {
        (async () => {
            setLoading(true);
            const [{ data: n }, { data: e }] = await Promise.all([
                supabase.from('graph_nodes').select('*'),
                supabase.from('graph_edges').select('*'),
            ]);
            setNodes(n || []);
            setEdges(e || []);

            // Initialize positions in a circle layout
            const nodeList = n || [];
            const pos: Record<string, { x: number; y: number }> = {};
            const cx = 400, cy = 300, r = Math.min(250, nodeList.length * 20);
            nodeList.forEach((node, i) => {
                const angle = (2 * Math.PI * i) / nodeList.length;
                pos[node.id] = {
                    x: cx + r * Math.cos(angle) + (Math.random() - 0.5) * 40,
                    y: cy + r * Math.sin(angle) + (Math.random() - 0.5) * 40,
                };
            });
            setPositions(pos);
            setLoading(false);
        })();
    }, []);

    // Draw canvas
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || Object.keys(positions).length === 0) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const dpr = window.devicePixelRatio || 1;
        canvas.width = canvas.offsetWidth * dpr;
        canvas.height = canvas.offsetHeight * dpr;
        ctx.scale(dpr, dpr);
        ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

        // Draw edges
        edges.forEach(edge => {
            const from = positions[edge.from_node_id];
            const to = positions[edge.to_node_id];
            if (!from || !to) return;

            ctx.beginPath();
            ctx.moveTo(from.x, from.y);
            ctx.lineTo(to.x, to.y);
            ctx.strokeStyle = (EDGE_COLORS[edge.relationship_type] || '#333') + '40';
            ctx.lineWidth = 1;
            ctx.stroke();
        });

        // Draw nodes
        const filteredNodes = typeFilter ? nodes.filter(n => n.node_type === typeFilter) : nodes;
        filteredNodes.forEach(node => {
            const pos = positions[node.id];
            if (!pos) return;

            const color = NODE_COLORS[node.node_type] || '#666';
            const isSelected = selectedNode?.id === node.id;
            const radius = isSelected ? 12 : 8;

            // Glow
            if (isSelected) {
                ctx.beginPath();
                ctx.arc(pos.x, pos.y, 20, 0, Math.PI * 2);
                ctx.fillStyle = color + '20';
                ctx.fill();
            }

            // Node circle
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
            ctx.fillStyle = color;
            ctx.fill();
            ctx.strokeStyle = color + '80';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Label
            ctx.fillStyle = '#ffffff80';
            ctx.font = '10px monospace';
            ctx.textAlign = 'center';
            const label = (node.properties?.name || node.id).toString().slice(0, 20);
            ctx.fillText(label, pos.x, pos.y + radius + 14);
        });
    }, [nodes, edges, positions, selectedNode, typeFilter]);

    // Handle canvas click
    const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const clicked = nodes.find(n => {
            const pos = positions[n.id];
            return pos && Math.hypot(pos.x - x, pos.y - y) < 15;
        });
        setSelectedNode(clicked || null);
    };

    const nodeTypes = [...new Set(nodes.map(n => n.node_type))];
    const edgeTypes = [...new Set(edges.map(e => e.relationship_type))];

    return (
        <div className="min-h-screen pt-8 pb-20">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
                <h1 className="text-3xl font-black text-white mb-2 flex items-center gap-3">
                    <GitBranch className="w-8 h-8 text-cyan-400" />
                    <span className="bg-gradient-to-r from-cyan-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent">Knowledge Graph</span>
                </h1>
                <p className="text-white/40 text-sm">{nodes.length} nodes · {edges.length} edges · Codebase semantic map</p>
            </motion.div>

            {/* Legend */}
            <div className="flex flex-wrap gap-2 mb-4">
                <button onClick={() => setTypeFilter(null)}
                    className={`px-2 py-1 rounded-full text-[10px] font-bold border transition-all ${!typeFilter ? 'bg-white/10 border-white/30 text-white' : 'border-white/10 text-white/40 hover:text-white'}`}>ALL</button>
                {nodeTypes.map(t => (
                    <button key={t} onClick={() => setTypeFilter(typeFilter === t ? null : t)}
                        className={`px-2 py-1 rounded-full text-[10px] font-bold border transition-all flex items-center gap-1 ${typeFilter === t ? 'bg-white/10 border-white/30 text-white' : 'border-white/10 text-white/40 hover:text-white'}`}>
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: NODE_COLORS[t] || '#666' }} />
                        {t}
                    </button>
                ))}
            </div>

            {/* Canvas */}
            {loading ? (
                <div className="h-[500px] flex items-center justify-center text-white/30">Loading knowledge graph...</div>
            ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative">
                    <canvas
                        ref={canvasRef}
                        onClick={handleCanvasClick}
                        className="w-full h-[500px] rounded-2xl border border-white/[0.06] bg-[#050810] cursor-crosshair"
                        style={{ imageRendering: 'auto' }}
                    />
                    {/* Edge legend */}
                    <div className="absolute bottom-4 left-4 flex flex-wrap gap-2">
                        {edgeTypes.map(t => (
                            <span key={t} className="px-2 py-0.5 rounded text-[9px] font-mono text-white/30 border border-white/5 flex items-center gap-1">
                                <div className="w-3 h-[1px]" style={{ backgroundColor: EDGE_COLORS[t] || '#333' }} /> {t}
                            </span>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Node Detail */}
            {selectedNode && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-4 rounded-xl border border-cyan-500/20 bg-cyan-500/5">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: NODE_COLORS[selectedNode.node_type] || '#666' }} />
                        <span className="text-white font-bold text-sm">{selectedNode.properties?.name || selectedNode.id}</span>
                        <span className="text-white/30 text-xs font-mono">{selectedNode.node_type}</span>
                    </div>
                    <div className="text-white/40 text-xs font-mono">
                        Connections: {edges.filter(e => e.from_node_id === selectedNode.id || e.to_node_id === selectedNode.id).length}
                    </div>
                    {selectedNode.properties && Object.keys(selectedNode.properties).length > 0 && (
                        <pre className="mt-2 text-white/30 text-xs bg-black/30 rounded p-2 overflow-x-auto">
                            {JSON.stringify(selectedNode.properties, null, 2)}
                        </pre>
                    )}
                </motion.div>
            )}

            {/* Node Table */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mt-8">
                <h2 className="text-white font-bold text-lg mb-4">All Nodes</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {(typeFilter ? nodes.filter(n => n.node_type === typeFilter) : nodes).map(node => (
                        <button key={node.id} onClick={() => setSelectedNode(node)}
                            className={`p-3 rounded-xl border text-left transition-all ${selectedNode?.id === node.id ? 'border-cyan-500/40 bg-cyan-500/10' : 'border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]'}`}>
                            <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: NODE_COLORS[node.node_type] || '#666' }} />
                                <span className="text-white text-xs font-bold truncate">{node.properties?.name || node.id}</span>
                            </div>
                            <span className="text-white/30 text-[10px] font-mono ml-4">{node.node_type}</span>
                        </button>
                    ))}
                </div>
            </motion.div>
        </div>
    );
}
