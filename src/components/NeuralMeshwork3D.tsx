import { Float, Sphere, Html, Stars, Trail, MeshWobbleMaterial, MeshDistortMaterial } from "@react-three/drei";
import { Canvas, useFrame } from '@react-three/fiber';
import { EffectComposer, Bloom, ChromaticAberration, Noise, Vignette } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import React, { useMemo, useRef, useState, useEffect, memo } from "react";
import * as THREE from 'three';
import { useNavigate } from "react-router-dom";

// --------------------------------------------------------
// THE MASTER PLANET (Hyper-Realistic Sci-Fi Earth)
// --------------------------------------------------------
const SovereignPlanet = memo(() => {
    const planetRef = useRef<THREE.Mesh>(null);
    const cloudsRef = useRef<THREE.Mesh>(null);
    const atmosphereRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        const time = state.clock.getElapsedTime();
        if (planetRef.current) planetRef.current.rotation.y = time * 0.05;
        if (cloudsRef.current) {
            cloudsRef.current.rotation.y = time * 0.06;
            cloudsRef.current.rotation.x = Math.sin(time * 0.1) * 0.1;
        }
        // Dynamic mouse parallax
        const targetX = state.pointer.x * 0.1;
        const targetY = state.pointer.y * 0.1;
        if (atmosphereRef.current) {
            atmosphereRef.current.position.x = THREE.MathUtils.lerp(atmosphereRef.current.position.x, targetX, 0.05);
            atmosphereRef.current.position.y = THREE.MathUtils.lerp(atmosphereRef.current.position.y, targetY, 0.05);
        }
    });

    return (
        <group position={[0, -15, -20]}> {/* Positioned massively at bottom */}
            <Sphere args={[12, 64, 64]} ref={planetRef as any}>
                <meshStandardMaterial color="#0a1526" emissive="#003366" emissiveIntensity={0.2} roughness={0.7} metalness={0.4} />
            </Sphere>
            <Sphere args={[12.2, 64, 64]} ref={cloudsRef as any}>
                <meshStandardMaterial color="#ffffff" transparent opacity={0.15} depthWrite={false} blending={THREE.AdditiveBlending} />
            </Sphere>
            <Sphere args={[13.5, 64, 64]} ref={atmosphereRef as any}>
                <meshBasicMaterial color="#0066ff" transparent opacity={0.1} side={THREE.BackSide} blending={THREE.AdditiveBlending} depthWrite={false} />
            </Sphere>
        </group>
    );
});

// --------------------------------------------------------
// THE GALAXY (Dense, Hyper-detailed Stardust & Nebulae)
// --------------------------------------------------------
const DeepSpaceNebula = memo(() => {
    const groupRef = useRef<THREE.Group>(null);
    const particleCount = typeof window !== 'undefined' && window.innerWidth < 768 ? 3000 : 15000;

    const particles = useMemo(() => {
        const pos = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);

        const color1 = new THREE.Color("#000511");
        const color2 = new THREE.Color("#2a00ff");
        const color3 = new THREE.Color("#00f2ff");
        const color4 = new THREE.Color("#ff00cc");

        for (let i = 0; i < particleCount; i++) {
            const u = Math.random();
            const v = Math.random();
            const radius = 20 + Math.pow(u, 2) * 80;
            const theta = v * Math.PI * 2;
            const sweep = (u - 0.5) * Math.PI * 2;
            const x = Math.cos(theta + sweep) * radius;
            const y = (Math.random() - 0.5) * (40 / Math.max(radius * 0.1, 1)) + (x * 0.3);
            const z = Math.sin(theta + sweep) * radius - 30;

            pos[i * 3] = x;
            pos[i * 3 + 1] = y;
            pos[i * 3 + 2] = z;

            const mix = Math.random();
            let targetColor = color1;
            if (radius < 30) targetColor = mix > 0.5 ? color3 : color2;
            else if (radius > 70) targetColor = mix > 0.5 ? color4 : color1;
            else targetColor = mix > 0.3 ? color2 : color3;

            if (Math.random() > 0.995) targetColor = new THREE.Color("#ffffff");

            targetColor.toArray(colors, i * 3);
            sizes[i] = Math.random() * (Math.random() > 0.98 ? 0.3 : 0.08);
        }
        return { pos, colors, sizes };
    }, [particleCount]);

    useFrame((state) => {
        const time = state.clock.getElapsedTime();
        if (groupRef.current) {
            groupRef.current.rotation.y = time * 0.005;
            groupRef.current.rotation.z = Math.sin(time * 0.02) * 0.05;
            const targetX = state.pointer.y * 0.05;
            const targetY = state.pointer.x * 0.05;
            groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetX, 0.02);
            groupRef.current.rotation.y += THREE.MathUtils.lerp(0, targetY, 0.02);
        }
    });

    return (
        <group ref={groupRef}>
            <points>
                <bufferGeometry>
                    <bufferAttribute attach="attributes-position" count={particleCount} array={particles.pos} itemSize={3} args={[particles.pos, 3]} />
                    <bufferAttribute attach="attributes-color" count={particleCount} array={particles.colors} itemSize={3} args={[particles.colors, 3]} />
                    <bufferAttribute attach="attributes-size" count={particleCount} array={particles.sizes} itemSize={1} args={[particles.sizes, 1]} />
                </bufferGeometry>
                <pointsMaterial transparent vertexColors size={0.15} sizeAttenuation={true} depthWrite={false} opacity={0.8} blending={THREE.AdditiveBlending} />
            </points>
        </group>
    );
});

// --------------------------------------------------------
// SHOOTING STARS / COMETS (High Velocity Interaction)
// --------------------------------------------------------
const AsteroidBelt = memo(() => {
    return (
        <group>
            {Array.from({ length: 15 }).map((_, i) => <Comet key={i} delay={i * 2} />)}
        </group>
    );
});

const Comet = memo(({ delay }: { delay: number }) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const [speed] = useState(() => 10 + Math.random() * 20);
    const [offset] = useState(() => new THREE.Vector3((Math.random() - 0.5) * 60, (Math.random() - 0.5) * 40, -10 - Math.random() * 40));

    useFrame((state) => {
        const time = state.clock.getElapsedTime() + delay;
        if (meshRef.current) {
            const life = (time * speed) % 100;
            meshRef.current.position.set(offset.x - life * 2, offset.y - life * 0.5, offset.z + life);
        }
    });

    return (
        <Trail width={0.4} length={20} color={new THREE.Color("#00ffff")} attenuation={(t) => t * t}>
            <Sphere ref={meshRef as any} args={[0.05, 8, 8]}>
                <meshBasicMaterial color="#ffffff" />
            </Sphere>
        </Trail>
    );
});

// --------------------------------------------------------
// THE SYSTEM (Interactive Orbits & The Self-Coding Sun)
// --------------------------------------------------------
const PLANETARY_SYSTEM = [
    { path: '/self-coding', label: 'Self-Coding System (The Sun)', color: '#ff5500', pos: [0, 0, -12], size: 4.5, speed: 0.02, isSun: true },
    { path: '/world-models', label: 'World Models', color: '#ffcc00', pos: [-10, 5, -8], size: 1.2, speed: 0.1 },
    { path: '/portfolio', label: 'AI Portfolio', color: '#00ff88', pos: [8, -4, -4], size: 1.0, speed: 0.25 },
    { path: '/deepsearch', label: 'DeepSearch', color: '#ff00ff', pos: [-6, -5, 2], size: 0.7, speed: 0.15 },
    { path: '/architecture', label: 'Architecture', color: '#00ffff', pos: [6, 5, -2], size: 0.8, speed: 0.18 },
    { path: '/contact', label: 'Contact', color: '#ff4444', pos: [3, 2, 8], size: 0.6, speed: 0.2 },
    { path: '/brain', label: 'Neural Matrix', color: '#00ffcc', pos: [-3, 8, 0], size: 0.65, speed: 0.22 }
];

const OrbitalSystem = memo(() => {
    const navigate = useNavigate();
    const groupRef = useRef<THREE.Group>(null);
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    useFrame((state) => {
        const time = state.clock.getElapsedTime();
        if (groupRef.current) {
            groupRef.current.rotation.y = Math.sin(time * 0.1) * 0.05;
            groupRef.current.position.y = Math.cos(time * 0.2) * 0.2;
        }
    });

    useEffect(() => {
        document.body.style.cursor = hoveredIndex !== null ? 'pointer' : 'auto';
    }, [hoveredIndex]);

    return (
        <group ref={groupRef}>
            {PLANETARY_SYSTEM.map((planet, i) => {
                const isHovered = hoveredIndex === i;
                const activeScale = isHovered ? 1.5 : 1.0;

                return (
                    <group
                        key={planet.path}
                        position={new THREE.Vector3(...planet.pos)}
                        onPointerOver={(e) => { e.stopPropagation(); setHoveredIndex(i); }}
                        onPointerOut={() => setHoveredIndex(null)}
                        onClick={(e) => { e.stopPropagation(); navigate(planet.path); }}
                    >
                        {planet.isSun ? (
                            // The Self-Coding Sun - Massive Plasma
                            <Float speed={planet.speed * 20} rotationIntensity={isHovered ? 0.5 : 0.2} floatIntensity={0.5}>
                                <Sphere args={[planet.size, 64, 64]} scale={activeScale}>
                                    <MeshDistortMaterial color="#ff4400" emissive="#ff2200" emissiveIntensity={isHovered ? 4.0 : 2.0} distort={0.3} speed={3} />
                                </Sphere>
                                {/* Massive Sun Corona */}
                                <Sphere args={[planet.size * 1.5, 32, 32]} scale={activeScale}>
                                    <meshBasicMaterial color="#ffaa00" transparent opacity={isHovered ? 0.3 : 0.1} blending={THREE.AdditiveBlending} depthWrite={false} />
                                </Sphere>
                                <pointLight intensity={100} distance={50} color="#ff6600" />
                                <Html position={[0, -planet.size - 2.0, 0]} center className="pointer-events-none z-50">
                                    <div className={`transition-all duration-500 font-mono text-center tracking-[0.4em] uppercase font-black text-sm whitespace-nowrap px-8 py-3 rounded-full border backdrop-blur-xl ${isHovered ? 'bg-[#ff2200] text-white border-white scale-125 shadow-[0_0_80px_rgba(255,85,0,0.8)]' : 'bg-black/60 text-[#ffaa00] border-[#ff5500]/50'}`}>
                                        {planet.label}
                                    </div>
                                </Html>
                            </Float>
                        ) : (
                            // Standard World Models / Portfolio Planets
                            <Float speed={planet.speed * 10} rotationIntensity={isHovered ? 2 : 1} floatIntensity={1}>
                                <Sphere args={[planet.size, 64, 64]} scale={activeScale}>
                                    <MeshWobbleMaterial factor={isHovered ? 0.2 : 0.05} speed={2} color={planet.color} emissive={planet.color} emissiveIntensity={isHovered ? 4.0 : 0.8} roughness={0.2} metalness={1.0} />
                                </Sphere>
                                <Sphere args={[planet.size * 1.3, 32, 32]} scale={activeScale}>
                                    <meshBasicMaterial color={planet.color} transparent opacity={isHovered ? 0.4 : 0.15} blending={THREE.AdditiveBlending} depthWrite={false} />
                                </Sphere>
                                <Html position={[0, -planet.size - 1.2, 0]} center className="pointer-events-none z-50">
                                    <div className={`transition-all duration-500 font-mono text-center tracking-[0.4em] uppercase font-black text-[10px] sm:text-xs whitespace-nowrap px-6 py-2 rounded-full border backdrop-blur-xl ${isHovered ? 'bg-[#000000] text-white border-white scale-125 shadow-[0_0_50px_rgba(255,255,255,0.8)]' : 'bg-black/40 text-white/60 border-white/20'}`}>
                                        {planet.label}
                                    </div>
                                </Html>
                            </Float>
                        )}
                    </group>
                );
            })}
        </group>
    );
});

// --------------------------------------------------------
// MASTER COMPOSER SETUP
// --------------------------------------------------------
const NeuralMeshwork3D: React.FC = memo(() => {
    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 0,
            pointerEvents: 'auto',
            background: '#020205' // Absolute void
        }}>
            <Canvas camera={{ position: [0, 0, 15], fov: 60 }} dpr={[1, 1.5]} performance={{ min: 0.5 }}>
                <fog attach="fog" args={['#020205', 10, 80]} />
                <ambientLight intensity={0.1} />
                <directionalLight position={[20, 30, 10]} intensity={3} color="#ffffff" />
                <pointLight position={[-10, 0, 10]} intensity={50} distance={50} color="#00ffff" />
                <pointLight position={[10, -10, -10]} intensity={80} distance={50} color="#ff00ff" />

                <Stars radius={150} depth={100} count={5000} factor={6} saturation={1} fade speed={1.5} />

                <DeepSpaceNebula />
                <SovereignPlanet />
                <OrbitalSystem />
                <AsteroidBelt />

                <EffectComposer enableNormalPass={false} multisampling={0}>
                    <Bloom luminanceThreshold={0.2} luminanceSmoothing={0.9} intensity={3.5} mipmapBlur />
                    <ChromaticAberration blendFunction={BlendFunction.NORMAL} offset={new THREE.Vector2(0.002, 0.002)} />
                    <Noise opacity={0.035} blendFunction={BlendFunction.OVERLAY} />
                    <Vignette eskil={false} offset={0.1} darkness={1.1} />
                </EffectComposer>
            </Canvas>
        </div>
    );
});

export default NeuralMeshwork3D;
