import { Float, PointMaterial, Sphere, Html, Stars, Billboard } from "@react-three/drei";
import { Canvas, useFrame } from '@react-three/fiber';
import React, { useMemo, useRef, useState, useEffect } from "react";
import * as THREE from 'three';
import { useNavigate } from "react-router-dom";

// "Realistic Deep Space Galaxy" - Replacing abstract nodes
const CosmicNebula = () => {
    const groupRef = useRef<THREE.Group>(null);
    const [particleCount, setParticleCount] = useState(6000);

    React.useEffect(() => {
        const handleResize = () => {
            setParticleCount(window.innerWidth < 768 ? 4000 : 15000);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const particles = useMemo(() => {
        const pos = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);

        const color1 = new THREE.Color("#0a0a2a"); // deep cosmic black-blue
        const color2 = new THREE.Color("#4a00e0"); // galactic purple
        const color3 = new THREE.Color("#00d2ff"); // bright cyan starbirth
        const color4 = new THREE.Color("#ff007f"); // magenta nebula edges

        for (let i = 0; i < particleCount; i++) {
            // Realistic milky-way spiral generation
            const radius = Math.random() * Math.random() * 60;
            const spinAngle = radius * 0.2 + (Math.random() * Math.PI * 2);
            const armOffset = Math.random() * Math.PI * 2;
            const swirl = (Math.random() > 0.5 ? 1 : -1) * armOffset;

            const x = Math.cos(spinAngle + swirl) * radius;
            const z = Math.sin(spinAngle + swirl) * radius;
            // Elliptical flattening
            const y = (Math.random() - 0.5) * (150 / Math.max(radius, 1));

            pos[i * 3] = x;
            pos[i * 3 + 1] = y;
            pos[i * 3 + 2] = z;

            // Color mix based on radius
            const mix = Math.random();
            let targetColor = color1;
            if (radius < 10) targetColor = mix > 0.5 ? color3 : color2;
            else if (radius > 40) targetColor = mix > 0.5 ? color4 : color1;
            else targetColor = mix > 0.3 ? color2 : color3;

            // Occasional super bright star
            if (Math.random() > 0.98) targetColor = new THREE.Color("#ffffff");

            targetColor.toArray(colors, i * 3);
            sizes[i] = Math.random() * 0.15;
        }
        return { pos, colors, sizes };
    }, [particleCount]);

    useFrame((state) => {
        const time = state.clock.getElapsedTime();
        if (groupRef.current) {
            groupRef.current.rotation.y = time * 0.015; // Slow majestic rotation

            // Ultra-smooth parallax for mobile & desktop
            const targetX = state.pointer.y * 0.2;
            const targetY = state.pointer.x * 0.2;

            groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetX, 0.03);
            groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, -targetY, 0.03);
        }
    });

    return (
        <group ref={groupRef} position={[0, -5, -20]}>
            <points>
                <bufferGeometry>
                    <bufferAttribute attach="attributes-position" count={particleCount} array={particles.pos} itemSize={3} args={[particles.pos, 3]} />
                    <bufferAttribute attach="attributes-color" count={particleCount} array={particles.colors} itemSize={3} args={[particles.colors, 3]} />
                    <bufferAttribute attach="attributes-size" count={particleCount} array={particles.sizes} itemSize={1} args={[particles.sizes, 1]} />
                </bufferGeometry>
                <PointMaterial transparent vertexColors size={0.15} sizeAttenuation={true} depthWrite={false} opacity={0.6} blending={THREE.AdditiveBlending} />
            </points>
        </group>
    );
};

// Galactic Core (Supermassive hole / light bending effect approximation)
const GalacticCore = () => {
    const coreRef = useRef<THREE.Mesh>(null);
    useFrame(({ clock }) => {
        if (coreRef.current) {
            coreRef.current.rotation.y = clock.getElapsedTime() * 0.5;
            coreRef.current.rotation.x = clock.getElapsedTime() * 0.2;
        }
    });

    return (
        <group position={[0, -5, -20]}>
            <Sphere args={[3, 64, 64]} ref={coreRef as any}>
                <meshStandardMaterial
                    color="#ffffff"
                    emissive="#00e5ff"
                    emissiveIntensity={4}
                    transparent
                    opacity={0.9}
                    blending={THREE.AdditiveBlending}
                />
            </Sphere>
            {/* Accretion disk glow */}
            <Billboard>
                <Sphere args={[8, 32, 32]} scale={[1, 0.1, 1]}>
                    <meshBasicMaterial color="#4a00e0" transparent opacity={0.3} blending={THREE.AdditiveBlending} depthWrite={false} />
                </Sphere>
            </Billboard>
        </group>
    );
};


const PLANETS = [
    { path: '/solutions', label: 'Solutions', color: '#00ffff', pos: [-6, 4, -4], size: 0.8, emissive: '#0044ff' },
    { path: '/voice', label: 'Voice AI', color: '#ff00ff', pos: [5, 5, -6], size: 0.6, emissive: '#8a00ff' },
    { path: '/fleet', label: 'Portfolio', color: '#00ff88', pos: [-4, -4, 0], size: 1.1, emissive: '#005522' },
    { path: '/pricing', label: 'Pricing', color: '#ffd700', pos: [6, -3, -2], size: 0.7, emissive: '#aa6600' },
    { path: '/philosophy', label: 'Philosophy', color: '#ff4444', pos: [1, 7, -8], size: 0.9, emissive: '#880000' },
    { path: '/sovereign', label: 'Sovereign', color: '#00ffcc', pos: [2, -7, -5], size: 1.0, emissive: '#006666' }
];

const RealisticPlanets = () => {
    const navigate = useNavigate();
    const groupRef = useRef<THREE.Group>(null);
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    useFrame((state) => {
        const time = state.clock.getElapsedTime();
        if (groupRef.current) {
            groupRef.current.rotation.y = time * 0.02; // Very slow majestic orbit
            groupRef.current.position.y = Math.sin(time * 0.2) * 0.5;
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
                const activeScale = isHovered ? 1.2 : 1.0;

                return (
                    <group
                        key={planet.path}
                        position={new THREE.Vector3(...planet.pos)}
                        onPointerOver={(e) => { e.stopPropagation(); setHoveredIndex(i); }}
                        onPointerOut={() => setHoveredIndex(null)}
                        onClick={(e) => { e.stopPropagation(); navigate(planet.path); }}
                    >
                        <Float speed={2} rotationIntensity={1.5} floatIntensity={2}>
                            <Sphere args={[planet.size, 64, 64]} scale={activeScale}>
                                <meshStandardMaterial
                                    color={planet.color}
                                    emissive={planet.emissive}
                                    emissiveIntensity={isHovered ? 1.5 : 0.4}
                                    roughness={0.4}
                                    metalness={0.9}
                                    envMapIntensity={2.0}
                                />
                            </Sphere>
                            {/* Atmosphere Glow */}
                            <Sphere args={[planet.size * 1.2, 32, 32]} scale={activeScale}>
                                <meshBasicMaterial
                                    color={planet.color}
                                    transparent
                                    opacity={isHovered ? 0.25 : 0.1}
                                    blending={THREE.AdditiveBlending}
                                    depthWrite={false}
                                />
                            </Sphere>

                            <Html position={[0, -planet.size - 0.8, 0]} center className="pointer-events-none z-50">
                                <div className={`transition-all duration-500 font-mono text-center tracking-[0.3em] uppercase font-black text-[10px] sm:text-xs whitespace-nowrap px-4 py-2 rounded-full border backdrop-blur-md ${isHovered ? 'bg-black/60 text-white border-white/80 scale-110 shadow-[0_0_30px_rgba(255,255,255,0.4)]' : 'bg-black/30 text-white/50 border-white/10'}`}>
                                    {planet.label}
                                </div>
                            </Html>
                        </Float>
                    </group>
                );
            })}
        </group>
    );
};

const NeuralMeshwork3D: React.FC = () => {
    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 0,
            pointerEvents: 'auto',
            background: 'radial-gradient(circle at 50% 50%, #060614 0%, #000000 100%)' // Pitch black deep space
        }}>
            <Canvas camera={{ position: [0, 0, 18], fov: 45 }} dpr={[1, 2]}>
                <fog attach="fog" args={['#000000', 10, 60]} />
                <ambientLight intensity={0.2} />

                {/* Cinematic Space Lighting */}
                <directionalLight position={[10, 20, 10]} intensity={3.5} color="#ffffff" />
                <spotLight position={[-20, 0, -10]} intensity={4} color="#4a00e0" distance={100} />
                <pointLight position={[0, -10, -5]} intensity={5} color="#00d2ff" distance={50} />

                <Stars radius={100} depth={50} count={7000} factor={4} saturation={1} fade speed={1} />

                <CosmicNebula />
                <GalacticCore />
                <RealisticPlanets />
            </Canvas>
        </div>
    );
};

export default NeuralMeshwork3D;
