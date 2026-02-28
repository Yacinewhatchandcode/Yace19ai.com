import { Float, Sphere, Html, Stars, Trail, MeshWobbleMaterial } from "@react-three/drei";
import { Canvas, useFrame } from '@react-three/fiber';
import { EffectComposer, Bloom, ChromaticAberration, Noise, Vignette } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import React, { useMemo, useRef, useState, useEffect } from "react";
import * as THREE from 'three';
import { useNavigate } from "react-router-dom";

// --------------------------------------------------------
// THE MASTER PLANET (Hyper-Realistic Sci-Fi Earth)
// --------------------------------------------------------
const SovereignPlanet = () => {
    const planetRef = useRef<THREE.Mesh>(null);
    const cloudsRef = useRef<THREE.Mesh>(null);
    const atmosphereRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        const time = state.clock.getElapsedTime();
        if (planetRef.current) {
            planetRef.current.rotation.y = time * 0.05;
        }
        if (cloudsRef.current) {
            cloudsRef.current.rotation.y = time * 0.06;
            cloudsRef.current.rotation.x = Math.sin(time * 0.1) * 0.1;
        }

        // Dynamic mouse parallax for epic scale feeling
        const targetX = state.pointer.x * 0.1;
        const targetY = state.pointer.y * 0.1;
        if (atmosphereRef.current) {
            atmosphereRef.current.position.x = THREE.MathUtils.lerp(atmosphereRef.current.position.x, targetX, 0.05);
            atmosphereRef.current.position.y = THREE.MathUtils.lerp(atmosphereRef.current.position.y, targetY, 0.05);
        }
    });

    return (
        <group position={[0, -12, -20]}> {/* Positioned massively at bottom */}
            {/* Core Planet */}
            <Sphere args={[10, 128, 128]} ref={planetRef as any}>
                <meshStandardMaterial
                    color="#0a1526" // Deep oceanic blue-black
                    emissive="#003366" // Subdued technological glow
                    emissiveIntensity={0.2}
                    roughness={0.7}
                    metalness={0.4}
                    wireframe={false}
                />
            </Sphere>

            {/* Glowing Tech/City Layer (Simulated via Wireframe Sphere) */}
            <Sphere args={[10.05, 64, 64]}>
                <meshBasicMaterial
                    color="#00ffff"
                    wireframe={true}
                    transparent={true}
                    opacity={0.05}
                    blending={THREE.AdditiveBlending}
                />
            </Sphere>

            {/* Dynamic Clouds Layer */}
            <Sphere args={[10.2, 64, 64]} ref={cloudsRef as any}>
                <meshStandardMaterial
                    color="#ffffff"
                    transparent={true}
                    opacity={0.15}
                    depthWrite={false}
                    blending={THREE.AdditiveBlending}
                />
            </Sphere>

            {/* Mega Atmospheric Glow */}
            <Sphere args={[11.5, 64, 64]} ref={atmosphereRef as any}>
                <meshBasicMaterial
                    color="#0066ff"
                    transparent={true}
                    opacity={0.1}
                    side={THREE.BackSide}
                    blending={THREE.AdditiveBlending}
                    depthWrite={false}
                />
            </Sphere>
        </group>
    );
};

// --------------------------------------------------------
// THE GALAXY (Dense, Hyper-detailed Stardust & Nebulae)
// --------------------------------------------------------
const DeepSpaceNebula = () => {
    const groupRef = useRef<THREE.Group>(null);
    const particleCount = typeof window !== 'undefined' && window.innerWidth < 768 ? 5000 : 25000;

    const particles = useMemo(() => {
        const pos = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);

        const color1 = new THREE.Color("#000511"); // extreme dark void
        const color2 = new THREE.Color("#2a00ff"); // deep neon blue
        const color3 = new THREE.Color("#00f2ff"); // electric cyan
        const color4 = new THREE.Color("#ff00cc"); // magenta dust

        for (let i = 0; i < particleCount; i++) {
            // Milky-way sweeping band distribution
            const u = Math.random();
            const v = Math.random();

            const radius = 20 + Math.pow(u, 2) * 80;
            const theta = v * Math.PI * 2;

            // Sweep band to look like a realistic galactic arm crossing the screen
            const sweep = (u - 0.5) * Math.PI * 2;

            const x = Math.cos(theta + sweep) * radius;
            const y = (Math.random() - 0.5) * (40 / Math.max(radius * 0.1, 1)) + (x * 0.3); // Tilted
            const z = Math.sin(theta + sweep) * radius - 30; // Push back

            pos[i * 3] = x;
            pos[i * 3 + 1] = y;
            pos[i * 3 + 2] = z;

            const mix = Math.random();
            let targetColor = color1;

            if (radius < 30) targetColor = mix > 0.5 ? color3 : color2;
            else if (radius > 70) targetColor = mix > 0.5 ? color4 : color1;
            else targetColor = mix > 0.3 ? color2 : color3;

            // Introduce super bright hyper-stars randomly
            if (Math.random() > 0.995) targetColor = new THREE.Color("#ffffff");

            targetColor.toArray(colors, i * 3);
            sizes[i] = Math.random() * (Math.random() > 0.98 ? 0.3 : 0.08); // Rare large stars
        }
        return { pos, colors, sizes };
    }, [particleCount]);

    useFrame((state) => {
        const time = state.clock.getElapsedTime();
        if (groupRef.current) {
            groupRef.current.rotation.y = time * 0.005; // Glacial scale movement
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
                <pointsMaterial
                    transparent
                    vertexColors
                    size={0.15}
                    sizeAttenuation={true}
                    depthWrite={false}
                    opacity={0.8}
                    blending={THREE.AdditiveBlending}
                />
            </points>
        </group>
    );
};

// --------------------------------------------------------
// SHOOTING STARS / COMETS (High Velocity Interaction)
// --------------------------------------------------------
const AsteroidBelt = () => {
    return (
        <group>
            {Array.from({ length: 15 }).map((_, i) => (
                <Comet key={i} delay={i * 2} />
            ))}
        </group>
    );
}

const Comet = ({ delay }: { delay: number }) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const [speed] = useState(() => 10 + Math.random() * 20);
    const [offset] = useState(() => new THREE.Vector3(
        (Math.random() - 0.5) * 60,
        (Math.random() - 0.5) * 40,
        -10 - Math.random() * 40
    ));

    useFrame((state) => {
        const time = state.clock.getElapsedTime() + delay;
        if (meshRef.current) {
            // Loop aggressively
            const life = (time * speed) % 100;
            meshRef.current.position.set(
                offset.x - life * 2,
                offset.y - life * 0.5,
                offset.z + life
            );
        }
    });

    return (
        <Trail
            width={0.4}
            length={20}
            color={new THREE.Color("#00ffff")}
            attenuation={(t) => t * t}
        >
            <Sphere ref={meshRef as any} args={[0.05, 8, 8]}>
                <meshBasicMaterial color="#ffffff" />
            </Sphere>
        </Trail>
    );
}

// --------------------------------------------------------
// THE SYSTEM (Interactive Orbits)
// --------------------------------------------------------
const PLANETARY_SYSTEM = [
    { path: '/solutions', label: 'Solutions', color: '#00ffff', pos: [-7, 2, -2], size: 0.6, speed: 0.2 },
    { path: '/voice', label: 'Voice AI', color: '#ff00ff', pos: [6, 4, -4], size: 0.45, speed: 0.15 },
    { path: '/fleet', label: 'Portfolio', color: '#00ff88', pos: [-4, -3, 3], size: 0.8, speed: 0.25 },
    { path: '/pricing', label: 'Pricing', color: '#ffd700', pos: [5, -4, 1], size: 0.5, speed: 0.1 },
    { path: '/philosophy', label: 'Philosophy', color: '#ff4444', pos: [2, 6, -6], size: 0.7, speed: 0.18 },
    { path: '/sovereign', label: 'Sovereign', color: '#00ffcc', pos: [-1, -6, -2], size: 0.55, speed: 0.22 }
];

const OrbitalSystem = () => {
    const navigate = useNavigate();
    const groupRef = useRef<THREE.Group>(null);
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    useFrame((state) => {
        const time = state.clock.getElapsedTime();
        if (groupRef.current) {
            // Whole system breathes
            groupRef.current.rotation.y = Math.sin(time * 0.1) * 0.1;
            groupRef.current.position.y = Math.cos(time * 0.2) * 0.3;
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
                        {/* Wobbling / Living Planet Surface */}
                        <Float speed={planet.speed * 10} rotationIntensity={isHovered ? 2 : 1} floatIntensity={1}>
                            <Sphere args={[planet.size, 64, 64]} scale={activeScale}>
                                <MeshWobbleMaterial
                                    factor={isHovered ? 0.2 : 0.05}
                                    speed={2}
                                    color={planet.color}
                                    emissive={planet.color}
                                    emissiveIntensity={isHovered ? 4.0 : 0.8}
                                    roughness={0.2}
                                    metalness={1.0}
                                />
                            </Sphere>

                            {/* Epic Corona/Atmosphere causing massive Bloom */}
                            <Sphere args={[planet.size * 1.3, 32, 32]} scale={activeScale}>
                                <meshBasicMaterial
                                    color={planet.color}
                                    transparent
                                    opacity={isHovered ? 0.4 : 0.15}
                                    blending={THREE.AdditiveBlending}
                                    depthWrite={false}
                                />
                            </Sphere>

                            <Html position={[0, -planet.size - 1.2, 0]} center className="pointer-events-none z-50">
                                <div className={`transition-all duration-500 font-mono text-center tracking-[0.4em] uppercase font-black text-[10px] sm:text-xs whitespace-nowrap px-6 py-2 rounded-full border backdrop-blur-xl ${isHovered ? 'bg-[#000000] text-white border-white scale-125 shadow-[0_0_50px_rgba(255,255,255,0.8)]' : 'bg-black/40 text-white/60 border-white/20'}`}>
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

// --------------------------------------------------------
// MASTER COMPOSER SETUP
// --------------------------------------------------------
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
            background: '#020205' // Absolute void
        }}>
            <Canvas camera={{ position: [0, 0, 15], fov: 60 }} dpr={[1, 2]}>
                <fog attach="fog" args={['#020205', 10, 80]} />

                {/* Intense Lighting Setup */}
                <ambientLight intensity={0.1} />
                <directionalLight position={[20, 30, 10]} intensity={3} color="#ffffff" />
                <pointLight position={[-10, 0, 10]} intensity={50} distance={50} color="#00ffff" />
                <pointLight position={[10, -10, -10]} intensity={80} distance={50} color="#ff00ff" />

                {/* Hyper-realistic Background Starfield */}
                <Stars radius={150} depth={100} count={10000} factor={6} saturation={1} fade speed={1.5} />

                <DeepSpaceNebula />
                <SovereignPlanet />
                <OrbitalSystem />
                <AsteroidBelt />

                {/* 
                  THE "WOW" FACTOR: Post Processing Cinematic Pipeline
                  Combines massive Bloom, subtle visual noise (film grain), 
                  and Chromatic Aberration at the edges (sci-fi lens effect).
                */}
                <EffectComposer enableNormalPass={false} multisampling={4}>
                    <Bloom
                        luminanceThreshold={0.2}
                        luminanceSmoothing={0.9}
                        intensity={2.5} // Extreme, mind-blowing glow
                        mipmapBlur
                    />
                    <ChromaticAberration
                        blendFunction={BlendFunction.NORMAL}
                        offset={new THREE.Vector2(0.002, 0.002)}
                    />
                    <Noise opacity={0.035} blendFunction={BlendFunction.OVERLAY} />
                    <Vignette eskil={false} offset={0.1} darkness={1.1} />
                </EffectComposer>

            </Canvas>
        </div>
    );
};

export default NeuralMeshwork3D;
