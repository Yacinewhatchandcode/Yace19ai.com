
import { Float, PointMaterial } from "@react-three/drei";
import { Canvas, useFrame } from '@react-three/fiber';
import React, { useMemo, useRef, useState } from "react";
import * as THREE from 'three';

// Shared helix parameters
const HELIX_PARAMS = {
    radius: 3.5,
    height: 40,
    turns: 4,
    count: 500
};

// Helper to get position on helix at t (0-1)
// strand: 0 for A, 1 for B
const getHelixPos = (t: number, strand: 0 | 1) => {
    const angle = (t * HELIX_PARAMS.turns * Math.PI * 2) + (strand === 0 ? 0 : Math.PI);
    const y = (t - 0.5) * HELIX_PARAMS.height;
    // Add subtle variation
    const r = HELIX_PARAMS.radius;
    const x = r * Math.cos(angle);
    const z = r * Math.sin(angle);
    return new THREE.Vector3(x, y, z);
};

// 4 Blue "Snake" particles that build/traverse the structure
const SnakeBuilders = ({ progress }: { progress: number }) => {
    const snakesRef = useRef<THREE.Group>(null);
    const trailCount = 30; // Longer trail for "trace" effect
    const snakeCount = 4;
    
    // Create trails for each snake
    const trails = useMemo(() => {
        return Array.from({ length: snakeCount }).map(() => ({
            positions: new Float32Array(trailCount * 3),
            currentPos: new THREE.Vector3(0, 0, 0)
        }));
    }, []);

    useFrame((state) => {
        trails.forEach((snake, i) => {
            // Calculate head position based on progress
            // 4 snakes: 2 on Strand A, 2 on Strand B, slightly offset
            const strand = i < 2 ? 0 : 1; // 0 or 1
            const offset = (i % 2) * 0.05; // Slight offset for pairs
            
            // Current t along helix (clamped 0 to 1)
            // Add a "lead" so they are at the front of construction
            let t = progress + offset;
            if (t > 1) t = 1; // Stop at end or loop?
            
            const target = getHelixPos(t, strand as 0 | 1);
            
            // Add some "scouting" sine wave motion around the target point
            const time = state.clock.getElapsedTime();
            const wobble = Math.sin(time * 10 + i) * 0.5;
            target.x += wobble;
            target.z += wobble;

            // Update head
            snake.currentPos.copy(target);

            // Shift trail positions
            for (let j = trailCount - 1; j > 0; j--) {
                snake.positions[j * 3] = snake.positions[(j - 1) * 3];
                snake.positions[j * 3 + 1] = snake.positions[(j - 1) * 3 + 1];
                snake.positions[j * 3 + 2] = snake.positions[(j - 1) * 3 + 2];
            }
            
            // Set new head position
            snake.positions[0] = snake.currentPos.x;
            snake.positions[1] = snake.currentPos.y;
            snake.positions[2] = snake.currentPos.z;
        });

        if (snakesRef.current) {
            snakesRef.current.children.forEach((mesh, i) => {
                const geometry = (mesh as THREE.Line).geometry;
                geometry.attributes.position.array.set(trails[i].positions);
                geometry.attributes.position.needsUpdate = true;
                
                // Fade trail opacity based on progress (hide if not started)
                const material = (mesh as THREE.Line).material as THREE.LineBasicMaterial;
                material.opacity = progress > 0.01 ? 0.8 : 0;
            });
        }
    });

    return (
        <group ref={snakesRef}>
            {trails.map((_, i) => (
                <line key={i}>
                    <bufferGeometry>
                        <bufferAttribute
                            attach="attributes-position"
                            count={trailCount}
                            array={new Float32Array(trailCount * 3)}
                            itemSize={3}
                            args={[new Float32Array(trailCount * 3), 3]}
                        />
                    </bufferGeometry>
                    <lineBasicMaterial
                        color="#00ffff" // Cyan/Blue builders
                        transparent
                        opacity={0}
                        linewidth={2}
                        blending={THREE.AdditiveBlending}
                    />
                </line>
            ))}
        </group>
    );
};

// Synaptic Sparks: Random flashes on the helix
const SynapticSparks = ({ points, progress }: { points: Float32Array, progress: number }) => {
    const sparksRef = useRef<THREE.Points>(null);
    const sparkCount = 20;
    
    const sparkData = useMemo(() => {
        const positions = new Float32Array(sparkCount * 3);
        const indices = new Float32Array(sparkCount); 
        return { positions, indices };
    }, []);

    useFrame((state) => {
        const time = state.clock.getElapsedTime();
        
        if (sparksRef.current && progress > 0.1) { // Only spark if partially built
            const positions = sparksRef.current.geometry.attributes.position.array as Float32Array;
            const maxIndex = Math.floor((points.length / 3) * progress); // Only spark on visible part
            
            if (maxIndex > 0) {
                for (let i = 0; i < sparkCount; i++) {
                    if (Math.random() > 0.9) {
                        // Pick random point within BUILT range
                        const ptIdx = Math.floor(Math.random() * maxIndex);
                        const idx = ptIdx * 3;
                        positions[i*3] = points[idx];
                        positions[i*3+1] = points[idx+1];
                        positions[i*3+2] = points[idx+2];
                    }
                }
                sparksRef.current.geometry.attributes.position.needsUpdate = true;
            }
            
            const material = sparksRef.current.material as THREE.PointsMaterial;
            material.opacity = (0.8 + Math.sin(time * 20) * 0.2) * (progress > 0.2 ? 1 : progress * 5);
        }
    });

    return (
        <points ref={sparksRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={sparkCount}
                    array={sparkData.positions}
                    itemSize={3}
                    args={[sparkData.positions, 3]}
                />
            </bufferGeometry>
            <PointMaterial
                transparent
                color="#ffffff"
                size={0.5}
                sizeAttenuation={true}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
                opacity={0}
            />
        </points>
    );
};

// Electron/Proton Orbiters
const OrbitingParticles = ({ progress }: { progress: number }) => {
    const groupRef = useRef<THREE.Group>(null);
    const particleCount = 50;
    
    const particles = useMemo(() => {
        const pos = new Float32Array(particleCount * 3);
        const randoms = new Float32Array(particleCount * 3);
        for(let i=0; i<particleCount*3; i++) randoms[i] = Math.random();
        return { pos, randoms };
    }, []);

    useFrame((state) => {
        const time = state.clock.getElapsedTime();
        if (groupRef.current) {
            const positions = (groupRef.current.children[0] as THREE.Points).geometry.attributes.position.array as Float32Array;
            
            for(let i=0; i<particleCount; i++) {
                // Scale height based on progress - they emerge with the DNA
                
                const r = 5 + particles.randoms[i*3] * 3;
                const speed = 0.5 + particles.randoms[i*3+1];
                const angle = time * speed + particles.randoms[i*3+2] * Math.PI * 2;
                
                // Allow particles to exist up to the current build height
                // Initial random height clamped
                let height = Math.sin(time * 0.5 + particles.randoms[i*3] * 10) * 20;
                
                // Clamp height to progress
                const heightLimit = (progress - 0.5) * HELIX_PARAMS.height;
                if (height > heightLimit) height = heightLimit - Math.random() * 5; // Push down if above limit
                
                positions[i*3] = Math.cos(angle) * r;
                positions[i*3+1] = height;
                positions[i*3+2] = Math.sin(angle) * r;
            }
            (groupRef.current.children[0] as THREE.Points).geometry.attributes.position.needsUpdate = true;
            
            // Fade in entire group
            const material = (groupRef.current.children[0] as THREE.Points).material as THREE.PointsMaterial;
            material.opacity = progress * 0.6;
        }
    });

    return (
        <group ref={groupRef}>
             <points>
                <bufferGeometry>
                    <bufferAttribute
                        attach="attributes-position"
                        count={particleCount}
                        array={particles.pos}
                        itemSize={3}
                        args={[particles.pos, 3]}
                    />
                </bufferGeometry>
                <PointMaterial
                    transparent
                    color="#4488ff"
                    size={0.15}
                    sizeAttenuation={true}
                    depthWrite={false}
                    opacity={0}
                    blending={THREE.AdditiveBlending}
                />
            </points>
        </group>
    );
};

const DNAStrand = ({ nodeColor = '#00ffff', lineColor = '#00aaff', progress = 1.0 }) => {
    const pointsRef = useRef<THREE.Points>(null);
    const linesRef = useRef<THREE.LineSegments>(null);
    const groupRef = useRef<THREE.Group>(null);

    // Generate points in a double helix (DNA) structure
    const { particles, connections } = useMemo(() => {
        const count = HELIX_PARAMS.count;
        const temp = new Float32Array(count * 3);
        const linePositions: number[] = [];

        // Generate particles
        for (let i = 0; i < count; i++) {
            const t = i / count; // 0 to 1 (Bottom to top if mapped correctly)
            const isStrandA = i % 2 === 0;

            const pos = getHelixPos(t, isStrandA ? 0 : 1);

            // Add some "neural" jitter
            const jitter = 0.6;
            temp[i * 3] = pos.x + (Math.random() - 0.5) * jitter;
            temp[i * 3 + 1] = pos.y + (Math.random() - 0.5) * jitter;
            temp[i * 3 + 2] = pos.z + (Math.random() - 0.5) * jitter;
        }

        // Generate connections
        for (let i = 0; i < count; i++) {
            const x1 = temp[i * 3];
            const y1 = temp[i * 3 + 1];
            const z1 = temp[i * 3 + 2];

            for (let j = i + 1; j < count; j++) {
                const x2 = temp[j * 3];
                const y2 = temp[j * 3 + 1];
                const z2 = temp[j * 3 + 2];

                const dist = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2 + (z2 - z1) ** 2);

                // Connection Logic
                const meshThreshold = 3.0;

                // Standard mesh connection
                let shouldConnect = false;
                if (dist < meshThreshold) shouldConnect = true;
                
                // Rungs (Base pairs)
                // Connect if roughly same height but different strand distance
                if (Math.abs(y1 - y2) < 0.5 && dist > (HELIX_PARAMS.radius * 1.5)) {
                    if (Math.random() > 0.85) shouldConnect = true;
                }

                if (shouldConnect) {
                    linePositions.push(x1, y1, z1);
                    linePositions.push(x2, y2, z2);
                }
            }
        }

        return {
            particles: temp,
            connections: new Float32Array(linePositions)
        };
    }, []);

    useFrame((state) => {
        const time = state.clock.getElapsedTime();
        
        if (groupRef.current) {
            groupRef.current.rotation.y = time * 0.1;
            groupRef.current.position.y = Math.sin(time * 0.5) * 0.5;
        }

        // Limit visibility based on progress
        if (pointsRef.current && linesRef.current) {
            const count = HELIX_PARAMS.count;
            // Particles: simple draw range
            // Assumes particles are generated linearly from bottom to top (t=0 to 1)
            const visibleParticles = Math.floor(count * progress);
            pointsRef.current.geometry.setDrawRange(0, visibleParticles);
            
            // Lines: Trickier as they connect disparate indices.
            // We can approximate by scaling total draw count, OR better:
            // Since lines are static, we can't easily filter by "height" without checking coordinates.
            // Simple approach: Scale line draw range by progress^2 (non-linear to match density)
            // Or just scale by progress. Since connections are local, lines roughly follow particle order.
            const visibleLines = Math.floor((connections.length / 3) * progress);
            linesRef.current.geometry.setDrawRange(0, visibleLines * 3); // *3 for vertices
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
                    size={0.25}
                    sizeAttenuation={true}
                    depthWrite={false}
                    opacity={0.8}
                    blending={THREE.AdditiveBlending}
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
                    opacity={0.4}
                    linewidth={2}
                    blending={THREE.AdditiveBlending}
                />
            </lineSegments>
            <SynapticSparks points={particles} progress={progress} />
        </group>
    );
};

interface NeuralMeshwork3DProps {
    nodeColor?: string;
    lineColor?: string;
}

const NeuralMeshwork3D: React.FC<NeuralMeshwork3DProps> = ({
    nodeColor = '#00ffff', // Bright cyan for nodes
    lineColor = '#00aaff' // Brighter blue for lines
}) => {
    // Construction Animation State
    // 0 = invisible, 1 = fully built
    const [progress, setProgress] = useState(0);
    
    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 0,
            pointerEvents: 'none',
            background: 'radial-gradient(ellipse at bottom, #050510 0%, #000000 100%)'
        }}>
            <Canvas camera={{ position: [0, 0, 20], fov: 45 }} dpr={[1, 2]}>
                <fog attach="fog" args={['#000000', 15, 60]} />
                <ambientLight intensity={1.2} />
                <pointLight position={[10, 10, 10]} intensity={1.2} color="#00f2ff" />
                <pointLight position={[-10, -10, -10]} intensity={1.0} color="#4488ff" />
                <pointLight position={[0, 15, 0]} intensity={0.8} color="#ff00ff" />
                <pointLight position={[0, -15, 0]} intensity={0.8} color="#00ffff" />

                <ConstructionController setProgress={setProgress} />

                <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
                    <DNAStrand nodeColor={nodeColor} lineColor={lineColor} progress={progress} />
                    <SnakeBuilders progress={progress} />
                    <OrbitingParticles progress={progress} />
                </Float>
            </Canvas>
        </div>
    );
};

// Controls the "building" animation timeline
const ConstructionController = ({ setProgress }: { setProgress: (p: number) => void }) => {
    useFrame((state) => {
        const time = state.clock.getElapsedTime();
        // Animate from 0 to 1 over 5 seconds, then stay at 1
        // Maybe loop for demonstration? "We will see the conception of it."
        // User implied a process. Let's make it loop slowly or one-shot? 
        // "DNA double stranded is not displayed at first... then... full building"
        // A loop helps visualize "conception" repeatedly.
        const duration = 8;
        const p = (time % (duration + 2)) / duration; // +2 for pause at full build
        const clampedP = Math.min(p, 1);
        setProgress(clampedP);
    });
    return null;
};

export default NeuralMeshwork3D;
