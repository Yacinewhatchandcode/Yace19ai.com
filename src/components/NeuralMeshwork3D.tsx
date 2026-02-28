import { Float, PointMaterial, Sphere, Html } from "@react-three/drei";
import { Canvas, useFrame } from '@react-three/fiber';
import React, { useMemo, useRef, useState, useEffect } from "react";
import * as THREE from 'three';
import { useNavigate } from "react-router-dom";

// Shared helix parameters
const HELIX_PARAMS = {
    radius: 3.2,
    height: 45,
    turns: 6,
    count: 800 // High density nodes
};

// Helper to get position on helix at t (0-1)
// strand: 0 for A, 1 for B
const getHelixPos = (t: number, strand: 0 | 1) => {
    const angle = (t * HELIX_PARAMS.turns * Math.PI * 2) + (strand === 0 ? 0 : Math.PI);
    const y = (t - 0.5) * HELIX_PARAMS.height;
    // Add subtle structural variation
    const r = HELIX_PARAMS.radius + Math.sin(t * Math.PI * 10) * 0.2;
    const x = r * Math.cos(angle);
    const z = r * Math.sin(angle);
    return new THREE.Vector3(x, y, z);
};

// "Amas de Galaxies" - Galaxy Clusters background
const GalaxyParticles = () => {
    const groupRef = useRef<THREE.Group>(null);
    const [particleCount, setParticleCount] = useState(3000); // Default to mobile-safe

    // Ensure edge device profiling is performed at mount
    React.useEffect(() => {
        const handleResize = () => {
            setParticleCount(window.innerWidth < 768 ? 3000 : 12000);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const particles = useMemo(() => {
        const pos = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);

        const coreColor = new THREE.Color("#ffffff");
        const cyanColor = new THREE.Color("#00ffff");
        const magentaColor = new THREE.Color("#8a2be2"); // deep purple/magenta

        for (let i = 0; i < particleCount; i++) {
            // Galaxy spiral generation
            const isCore = Math.random() > 0.8;
            const radius = isCore ? Math.random() * 15 : 15 + Math.random() * 35;
            const spinAngle = radius * 0.15 + (Math.random() * Math.PI * 2);

            // Cluster/arm effect
            const armOffset = Math.random() * Math.PI * 4;
            const swirl = (Math.random() > 0.5 ? 1 : -1) * armOffset;

            const x = Math.cos(spinAngle + swirl) * radius;
            const z = Math.sin(spinAngle + swirl) * radius;
            const y = (Math.random() - 0.5) * 50 * (5 / Math.max(radius, 1)); // Thinner at edges

            pos[i * 3] = x;
            pos[i * 3 + 1] = y;
            pos[i * 3 + 2] = z;

            // Mixed colors
            const mix = Math.random();
            let targetColor = mix < 0.4 ? cyanColor : mix < 0.8 ? magentaColor : coreColor;
            if (isCore && mix > 0.5) targetColor = coreColor; // Bright core

            targetColor.toArray(colors, i * 3);
            sizes[i] = (Math.random() * 0.05) + (isCore ? 0.04 : 0.02); // Slightly larger relative to screen
        }
        return { pos, colors, sizes };
    }, [particleCount]);

    useFrame((state) => {
        const time = state.clock.getElapsedTime();
        if (groupRef.current) {
            groupRef.current.rotation.y = time * 0.03;

            // Super responsive life: Galaxy reacts to pointer inversely and smoothly
            const targetX = state.pointer.y * 0.15;
            const targetY = state.pointer.x * 0.15;

            groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetX, 0.05);
            groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, -targetY, 0.05);
        }
    });

    return (
        <group ref={groupRef} position={[0, 0, -10]}>
            <points>
                <bufferGeometry>
                    <bufferAttribute attach="attributes-position" count={particleCount} array={particles.pos} itemSize={3} args={[particles.pos, 3]} />
                    <bufferAttribute attach="attributes-color" count={particleCount} array={particles.colors} itemSize={3} args={[particles.colors, 3]} />
                    <bufferAttribute attach="attributes-size" count={particleCount} array={particles.sizes} itemSize={1} args={[particles.sizes, 1]} />
                </bufferGeometry>
                <PointMaterial transparent vertexColors size={0.05} sizeAttenuation={true} depthWrite={false} opacity={0.3} blending={THREE.AdditiveBlending} />
            </points>
        </group>
    );
};

// Colored Biomarkers on the DNA structure
const BioMarkers = ({ points, progress }: { points: Float32Array, progress: number }) => {
    const markersRef = useRef<THREE.Points>(null);
    const markerCount = 80;

    const markerData = useMemo(() => {
        const positions = new Float32Array(markerCount * 3);
        const colors = new Float32Array(markerCount * 3);
        const sizes = new Float32Array(markerCount);

        // Vibrant organic bio-colors
        const colorPalette = [
            new THREE.Color("#ffd700"), // Gold
            new THREE.Color("#00ff88"), // Emerald/Bio green
            new THREE.Color("#ff00cc"), // Neon Pink/Magenta
            new THREE.Color("#00ffcc")  // Cyan variant
        ];

        for (let i = 0; i < markerCount; i++) {
            const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
            color.toArray(colors, i * 3);
            sizes[i] = Math.random() * 1.5 + 0.5; // Random initial scale
        }
        return { positions, colors, sizes };
    }, []);

    useFrame((state) => {
        const time = state.clock.getElapsedTime();
        if (markersRef.current && progress > 0.01) {
            const positions = markersRef.current.geometry.attributes.position.array as Float32Array;
            const maxIndex = Math.floor(((points.length / 3) - 1) * progress);

            for (let i = 0; i < markerCount; i++) {
                // Attach marker to specific normalized height of current DNA build progress
                // Let markers distribute along the strand
                const t = (i / markerCount); // 0 to 1
                const ptIdx = Math.floor(t * maxIndex);

                if (ptIdx >= 0 && ptIdx * 3 + 2 < points.length) {
                    positions[i * 3] = points[ptIdx * 3];
                    positions[i * 3 + 1] = points[ptIdx * 3 + 1];
                    positions[i * 3 + 2] = points[ptIdx * 3 + 2];
                }
            }
            markersRef.current.geometry.attributes.position.needsUpdate = true;

            const material = markersRef.current.material as THREE.PointsMaterial;
            material.opacity = (0.6 + Math.sin(time * 3) * 0.4) * (progress > 0.1 ? 1 : progress * 5);
        }
    });

    return (
        <points ref={markersRef}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" count={markerCount} array={markerData.positions} itemSize={3} args={[markerData.positions, 3]} />
                <bufferAttribute attach="attributes-color" count={markerCount} array={markerData.colors} itemSize={3} args={[markerData.colors, 3]} />
                {/* Passing size attribute if using custom shader, but PointMaterial uses uniform size. We'll use additive blending. */}
            </bufferGeometry>
            <PointMaterial transparent vertexColors size={0.35} sizeAttenuation={true} depthWrite={false} blending={THREE.AdditiveBlending} opacity={0} />
        </points>
    );
};

// 4 Blue "Snake" particles that build/traverse the structure
const SnakeBuilders = ({ progress }: { progress: number }) => {
    const snakesRef = useRef<THREE.Group>(null);
    const trailCount = 20;
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
            const strand = i < 2 ? 0 : 1;
            const offset = (i % 2) * 0.05;

            let t = progress + offset;
            if (t > 1) t = 1;

            const target = getHelixPos(t, strand as 0 | 1);

            const time = state.clock.getElapsedTime();
            const wobble = Math.sin(time * 15 + i) * 0.3;
            target.x += wobble;
            target.z += wobble;

            snake.currentPos.copy(target);

            for (let j = trailCount - 1; j > 0; j--) {
                snake.positions[j * 3] = snake.positions[(j - 1) * 3];
                snake.positions[j * 3 + 1] = snake.positions[(j - 1) * 3 + 1];
                snake.positions[j * 3 + 2] = snake.positions[(j - 1) * 3 + 2];
            }

            snake.positions[0] = snake.currentPos.x;
            snake.positions[1] = snake.currentPos.y;
            snake.positions[2] = snake.currentPos.z;
        });

        if (snakesRef.current) {
            snakesRef.current.children.forEach((mesh, i) => {
                const geometry = (mesh as THREE.Line).geometry;
                geometry.attributes.position.array.set(trails[i].positions);
                geometry.attributes.position.needsUpdate = true;

                const material = (mesh as THREE.Line).material as THREE.LineBasicMaterial;
                material.opacity = progress > 0.01 && progress < 0.99 ? 0.9 : 0; // Fade out once complete
            });
        }
    });

    return (
        <group ref={snakesRef}>
            {trails.map((_, i) => (
                <line key={i}>
                    <bufferGeometry>
                        <bufferAttribute attach="attributes-position" count={trailCount} array={new Float32Array(trailCount * 3)} itemSize={3} args={[new Float32Array(trailCount * 3), 3]} />
                    </bufferGeometry>
                    <lineBasicMaterial color="#00ffff" transparent opacity={0} linewidth={1} blending={THREE.AdditiveBlending} />
                </line>
            ))}
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
            const t = i / count;
            const isStrandA = i % 2 === 0;

            const pos = getHelixPos(t, isStrandA ? 0 : 1);

            // Added jitter for organic feel
            const jitter = 0.4;
            temp[i * 3] = pos.x + (Math.random() - 0.5) * jitter;
            temp[i * 3 + 1] = pos.y + (Math.random() - 0.5) * jitter;
            temp[i * 3 + 2] = pos.z + (Math.random() - 0.5) * jitter;
        }

        // Generate connections (rungs and backbone)
        for (let i = 0; i < count; i++) {
            const x1 = temp[i * 3];
            const y1 = temp[i * 3 + 1];
            const z1 = temp[i * 3 + 2];

            for (let j = i + 1; j < count; j++) {
                const x2 = temp[j * 3];
                const y2 = temp[j * 3 + 1];
                const z2 = temp[j * 3 + 2];

                const dist = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2 + (z2 - z1) ** 2);
                let shouldConnect = false;

                // Backbone connection
                if (dist < 2.5) shouldConnect = true;

                // Rungs (Base pairs across strands)
                if (Math.abs(y1 - y2) < 0.6 && dist > (HELIX_PARAMS.radius * 1.6)) {
                    if (Math.random() > 0.8) shouldConnect = true;
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
            // Natural autonomous DNA sway
            groupRef.current.rotation.y = time * 0.15;
            groupRef.current.position.y = Math.sin(time * 0.8) * 0.5;

            // SUPER RESPONSIVE LIFE: DNA violently/fluidly reacts to cursor presence
            // Amplified responsiveness to feel 'alive'
            const targetX = state.pointer.x * 0.3; // Responsive bending
            const targetY = state.pointer.y * 0.3;

            groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, -targetX, 0.1);
            groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetY, 0.1);
        }

        // Limit visibility based on progress
        if (pointsRef.current && linesRef.current) {
            const count = HELIX_PARAMS.count;
            const visibleParticles = Math.floor(count * progress);
            pointsRef.current.geometry.setDrawRange(0, visibleParticles);

            const visibleLines = Math.floor((connections.length / 3) * progress);
            linesRef.current.geometry.setDrawRange(0, visibleLines * 3);
        }
    });

    return (
        <group ref={groupRef}>
            <points ref={pointsRef}>
                <bufferGeometry>
                    <bufferAttribute attach="attributes-position" count={particles.length / 3} array={particles} itemSize={3} args={[particles, 3]} />
                </bufferGeometry>
                <PointMaterial transparent color={nodeColor} size={0.15} sizeAttenuation={true} depthWrite={false} opacity={0.6} blending={THREE.AdditiveBlending} />
            </points>
            <lineSegments ref={linesRef}>
                <bufferGeometry>
                    <bufferAttribute attach="attributes-position" count={connections.length / 3} array={connections} itemSize={3} args={[connections, 3]} />
                </bufferGeometry>
                <lineBasicMaterial attach="material" color={lineColor} transparent opacity={0.15} linewidth={1} blending={THREE.AdditiveBlending} />
            </lineSegments>
            <BioMarkers points={particles} progress={progress} />
        </group>
    );
};

const PLANETS = [
    { path: '/solutions', label: 'Solutions', color: '#00ffff', pos: [-5, 3, -1] },
    { path: '/voice', label: 'Voice AI', color: '#ff00ff', pos: [4, 4, -2] },
    { path: '/fleet', label: 'Portfolio', color: '#00ff88', pos: [-3.5, -3, 2] },
    { path: '/pricing', label: 'Pricing', color: '#ffd700', pos: [5, -2, 1] },
    { path: '/philosophy', label: 'Philosophy', color: '#ff4444', pos: [0, 5, -4] },
    { path: '/sovereign', label: 'Sovereign', color: '#00ffcc', pos: [0, -5, -3] }
];

const InteractivePlanets = () => {
    const navigate = useNavigate();
    const groupRef = useRef<THREE.Group>(null);
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    // Make the planets subtly rotate as a constellation
    useFrame((state) => {
        const time = state.clock.getElapsedTime();
        if (groupRef.current) {
            groupRef.current.rotation.y = time * 0.05;
            groupRef.current.position.y = Math.sin(time * 0.5) * 0.3;
        }
    });

    useEffect(() => {
        if (hoveredIndex !== null) {
            document.body.style.cursor = 'pointer';
        } else {
            document.body.style.cursor = 'auto';
        }
    }, [hoveredIndex]);

    return (
        <group ref={groupRef}>
            {PLANETS.map((planet, i) => {
                const isHovered = hoveredIndex === i;
                const scale = isHovered ? 1.4 : 1.0;
                return (
                    <group
                        key={planet.path}
                        position={new THREE.Vector3(...planet.pos)}
                        onPointerOver={(e) => { e.stopPropagation(); setHoveredIndex(i); }}
                        onPointerOut={() => setHoveredIndex(null)}
                        onClick={(e) => { e.stopPropagation(); navigate(planet.path); }}
                    >
                        <Sphere args={[0.35, 32, 32]} scale={scale}>
                            <meshStandardMaterial
                                color={planet.color}
                                emissive={planet.color}
                                emissiveIntensity={isHovered ? 2.5 : 0.8}
                                roughness={0.2}
                                metalness={0.8}
                            />
                        </Sphere>
                        {/* Glow Effect */}
                        <Sphere args={[0.5, 16, 16]} scale={scale}>
                            <meshBasicMaterial color={planet.color} transparent opacity={isHovered ? 0.3 : 0.1} blending={THREE.AdditiveBlending} depthWrite={false} />
                        </Sphere>

                        <Html position={[0, -0.8, 0]} center className="pointer-events-none">
                            <div className={`transition-all duration-300 font-mono text-center tracking-widest uppercase font-bold text-xs whitespace-nowrap px-3 py-1.5 rounded border ${isHovered ? 'bg-black/80 text-white border-white border-opacity-50 scale-110 shadow-[0_0_15px_rgba(255,255,255,0.3)]' : 'bg-black/50 text-white/70 border-white/10'}`}>
                                {planet.label}
                            </div>
                        </Html>
                    </group>
                );
            })}
        </group>
    );
};

interface NeuralMeshwork3DProps {
    nodeColor?: string;
    lineColor?: string;
}

const NeuralMeshwork3D: React.FC<NeuralMeshwork3DProps> = ({
    nodeColor = '#00ffff',
    lineColor = '#00aaff'
}) => {
    // Construction Animation State
    const [progress, setProgress] = useState(0);

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 0,
            pointerEvents: 'auto', // Enables interaction for parallax!
            background: 'radial-gradient(ellipse at center, #050510 0%, #000000 100%)' // deeply immersive space background
        }}>
            <Canvas camera={{ position: [0, 0, 22], fov: 50 }} dpr={[1, 2]}>
                <fog attach="fog" args={['#000000', 8, 45]} />
                <ambientLight intensity={1.5} />
                <pointLight position={[10, 10, 10]} intensity={1.5} color="#00f2ff" />
                <pointLight position={[-10, -10, -10]} intensity={1.0} color="#ff00ff" />

                <ConstructionController setProgress={setProgress} />

                {/* The Amas de Galaxies background layer */}
                <GalaxyParticles />

                {/* Interactive V2 UI Planets */}
                <InteractivePlanets />

                {/* Floating DNA Lifeform */}
                <Float speed={2.5} rotationIntensity={0.6} floatIntensity={1.0}>
                    <DNAStrand nodeColor={nodeColor} lineColor={lineColor} progress={progress} />
                    <SnakeBuilders progress={progress} />
                </Float>
            </Canvas>
        </div>
    );
};

const ConstructionController = ({ setProgress }: { setProgress: (p: number) => void }) => {
    useFrame((state) => {
        const time = state.clock.getElapsedTime();
        // Constant seamless looping construction 12s rhythm
        const duration = 12;
        const p = (time % (duration + 2)) / duration;
        const clampedP = Math.min(p, 1);
        setProgress(clampedP);
    });
    return null;
};

export default NeuralMeshwork3D;
