
import React, { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { PointMaterial, Float } from '@react-three/drei';
import * as THREE from 'three';

const DNAStrand = ({ nodeColor = '#00ffff', lineColor = '#2266aa', count = 400 }) => {
    const pointsRef = useRef<THREE.Points>(null);
    const linesRef = useRef<THREE.LineSegments>(null);
    const groupRef = useRef<THREE.Group>(null);

    // Generate points in a double helix (DNA) structure
    const { particles, connections } = useMemo(() => {
        const temp = new Float32Array(count * 3);
        const linePositions: number[] = [];

        const radius = 3.5;
        const height = 40; // Height of the strand
        const turns = 4; // Number of full twists

        // Generate particles
        for (let i = 0; i < count; i++) {
            const i3 = i * 3;
            const t = i / count; // 0 to 1

            // We want two distinct strands. 
            // We can split the count: first half is strand A, second half is strand B
            const isStrandA = i % 2 === 0;
            const strandOffset = isStrandA ? 0 : Math.PI;

            // Angle moves along the height
            const angle = (t * turns * Math.PI * 2) + strandOffset;
            const y = (t - 0.5) * height; // Centered vertically

            // Add some "neural" jitter so it's not a perfect geometric line
            const jitter = 0.6;
            const r = radius + (Math.random() - 0.5) * jitter;

            const x = r * Math.cos(angle);
            const z = r * Math.sin(angle);

            // Jitter the position slightly for organic feel
            temp[i3] = x + (Math.random() - 0.5) * jitter;
            temp[i3 + 1] = y + (Math.random() - 0.5) * jitter;
            temp[i3 + 2] = z + (Math.random() - 0.5) * jitter;
        }

        // Generate connections (synapses)
        // 1. Backbone connections (connect nearby points on same strand)
        // 2. Base pair connections (connect across strands)
        for (let i = 0; i < count; i++) {
            const x1 = temp[i * 3];
            const y1 = temp[i * 3 + 1];
            const z1 = temp[i * 3 + 2];

            for (let j = i + 1; j < count; j++) {
                const x2 = temp[j * 3];
                const y2 = temp[j * 3 + 1];
                const z2 = temp[j * 3 + 2];

                const dist = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2 + (z2 - z1) ** 2);

                // Connection Rules:
                // - Close neighbors (backbone + neural noise)
                // - Special check for "base pairs" (roughly diameter distance, same height)

                // Adjustable threshold for "neural mesh" density
                const meshThreshold = 2.5;

                // Add probability to reduce clutter if needed
                if (dist < meshThreshold) {
                    linePositions.push(x1, y1, z1);
                    linePositions.push(x2, y2, z2);
                }

                // Explicit Base Pairs (Rungs): Check if they are "partners" across the helix
                // This is a bit heuristic: similar Y, roughly 2*radius distance apart
                if (Math.abs(y1 - y2) < 0.5 && dist > (radius * 1.5) && dist < (radius * 2.5)) {
                    // Add rungs with lower probability to keep it clean
                    if (Math.random() > 0.85) {
                        linePositions.push(x1, y1, z1);
                        linePositions.push(x2, y2, z2);
                    }
                }
            }
        }

        return {
            particles: temp,
            connections: new Float32Array(linePositions)
        };
    }, [count]);

    useFrame((state) => {
        if (groupRef.current) {
            // Slow, majestic rotation
            groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.1;

            // Subtle "breathing" or floating
            groupRef.current.position.y = Math.sin(state.clock.getElapsedTime() * 0.5) * 0.5;
        }
    });

    return (
        <group ref={groupRef}>
            <points ref={pointsRef}>
                <bufferGeometry>
                    <bufferAttribute
                        attach="attributes-position"
                        count={particles.length / 3}
                        array={particles}
                        itemSize={3}
                        args={[particles, 3]}
                    />
                </bufferGeometry>
                <PointMaterial
                    transparent
                    color={nodeColor}
                    size={0.12} // Slightly smaller for elegance
                    sizeAttenuation={true}
                    depthWrite={false}
                    opacity={0.8}
                />
            </points>
            <lineSegments ref={linesRef}>
                <bufferGeometry>
                    <bufferAttribute
                        attach="attributes-position"
                        count={connections.length / 3}
                        array={connections}
                        itemSize={3}
                        args={[connections, 3]}
                    />
                </bufferGeometry>
                <lineBasicMaterial
                    attach="material"
                    color={lineColor}
                    transparent
                    opacity={0.15} // Very subtle lines
                    linewidth={1}
                />
            </lineSegments>
        </group>
    );
};

interface NeuralMeshwork3DProps {
    nodeColor?: string;
    lineColor?: string;
}

const NeuralMeshwork3D: React.FC<NeuralMeshwork3DProps> = ({
    nodeColor = '#00f2ff', // Cyan for nodes
    lineColor = '#4488ff' // Blueish for lines
}) => {
    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            zIndex: -1,
            // Premium deep void background
            background: 'radial-gradient(ellipse at bottom, #050510 0%, #000000 100%)'
        }}>
            <Canvas camera={{ position: [0, 0, 20], fov: 45 }} dpr={[1, 2]}>
                <fog attach="fog" args={['#000000', 10, 50]} />
                <ambientLight intensity={0.5} />

                <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
                    <DNAStrand nodeColor={nodeColor} lineColor={lineColor} />
                </Float>
            </Canvas>
        </div>
    );
};

export default NeuralMeshwork3D;
