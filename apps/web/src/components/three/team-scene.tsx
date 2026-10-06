"use client";

import { agentCapabilities } from "@/lib/agents";
import { AI_AGENTS } from "@bizaffle/types";
import { ContactShadows, Environment, Float } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { motion } from "framer-motion";
import { useMemo, useRef, useState } from "react";
import type { Group, Mesh } from "three";

type FigureKind = "glass" | "steel" | "amethyst";

const FIGURES: { kind: FigureKind; slug: "accountant" | "lawyer" | "consultant"; x: number }[] = [
  { kind: "glass", slug: "accountant", x: -1.85 },
  { kind: "steel", slug: "lawyer", x: 0 },
  { kind: "amethyst", slug: "consultant", x: 1.85 },
];

function useMaterial(kind: FigureKind, hovered: boolean) {
  return useMemo(() => {
    if (kind === "glass") {
      return {
        color: "#8b74ff",
        metalness: 0.12,
        roughness: 0.08,
        transmission: 0.86,
        thickness: 1.35,
        ior: 1.48,
        transparent: true,
        envMapIntensity: hovered ? 1.8 : 1.2,
        emissive: "#3d2d8a",
        emissiveIntensity: hovered ? 0.28 : 0.08,
      };
    }
    if (kind === "steel") {
      return {
        color: "#9bb0c9",
        metalness: 0.92,
        roughness: hovered ? 0.16 : 0.28,
        envMapIntensity: hovered ? 1.6 : 1.05,
        emissive: "#243552",
        emissiveIntensity: hovered ? 0.22 : 0.04,
      };
    }
    return {
      color: "#c084fc",
      metalness: 0.38,
      roughness: 0.14,
      transmission: 0.28,
      thickness: 0.8,
      ior: 1.6,
      transparent: true,
      envMapIntensity: hovered ? 1.7 : 1.1,
      emissive: "#5b2d7a",
      emissiveIntensity: hovered ? 0.26 : 0.07,
    };
  }, [kind, hovered]);
}

function SculpturalFigure({
  kind,
  position,
  hovered,
}: {
  kind: FigureKind;
  position: [number, number, number];
  hovered: boolean;
}) {
  const group = useRef<Group>(null);
  const head = useRef<Mesh>(null);
  const material = useMaterial(kind, hovered);

  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.elapsedTime;
    group.current.rotation.y = Math.sin(t * 0.35 + position[0]) * 0.08 + (hovered ? 0.12 : 0);
    group.current.position.y = position[1] + Math.sin(t * 0.9 + position[0]) * 0.04 + (hovered ? 0.08 : 0);
    if (head.current) {
      head.current.rotation.x = Math.sin(t * 0.6) * 0.04;
    }
  });

  return (
    <group ref={group} position={position}>
      <mesh ref={head} position={[0, 1.08, 0]} castShadow>
        <sphereGeometry args={[0.38, 64, 64]} />
        <meshPhysicalMaterial {...material} />
      </mesh>
      <mesh position={[0, 1.02, 0.22]} rotation={[0.35, 0, 0]} castShadow>
        <capsuleGeometry args={[0.09, 0.14, 8, 20]} />
        <meshPhysicalMaterial {...material} />
      </mesh>
      <mesh position={[0, 0.64, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.14, 0.26, 28]} />
        <meshPhysicalMaterial {...material} />
      </mesh>
      <mesh position={[0, 0.22, 0]} rotation={[0.18, 0, 0]} castShadow>
        <capsuleGeometry args={[0.2, 0.92, 10, 28]} />
        <meshPhysicalMaterial {...material} />
      </mesh>
      <mesh position={[0, -0.18, 0.02]} rotation={[0.42, 0, 0]}>
        <boxGeometry args={[0.86, 0.08, 0.42]} />
        <meshPhysicalMaterial {...material} />
      </mesh>
    </group>
  );
}

function Scene({
  hovered,
  setHovered,
}: {
  hovered: number | null;
  setHovered: (i: number | null) => void;
}) {
  return (
    <>
      <fog attach="fog" args={["#0b0c10", 8, 16]} />
      <ambientLight intensity={0.35} />
      <spotLight position={[4, 8, 4]} intensity={18} angle={0.4} penumbra={0.7} color="#d8d2ff" />
      <spotLight position={[-5, 4, 3]} intensity={10} angle={0.5} penumbra={0.8} color="#7c5cff" />
      <directionalLight position={[0, 2, 6]} intensity={1.2} color="#f4f1ea" />
      <Environment preset="city" />
      {FIGURES.map((figure, i) => (
        <Float key={figure.slug} speed={1.1} floatIntensity={hovered === i ? 0.55 : 0.18} rotationIntensity={0.08}>
          <group
            onPointerOver={(e) => {
              e.stopPropagation();
              setHovered(i);
            }}
            onPointerOut={() => setHovered(null)}
          >
            <SculpturalFigure
              kind={figure.kind}
              hovered={hovered === i}
              position={[figure.x, -0.15, 0]}
            />
          </group>
        </Float>
      ))}
      <ContactShadows position={[0, -1.05, 0]} opacity={0.35} blur={2.4} scale={8} />
    </>
  );
}

export function TeamScene({ className }: { className?: string }) {
  const [hovered, setHovered] = useState<number | null>(null);
  const agent = hovered !== null ? AI_AGENTS[hovered] : null;

  return (
    <div className={`relative h-[420px] w-full lg:h-[560px] ${className ?? ""}`}>
      <Canvas
        camera={{ position: [0, 0.55, 6.4], fov: 30 }}
        gl={{ alpha: true, antialias: true }}
        dpr={[1, 1.8]}
      >
        <Scene hovered={hovered} setHovered={setHovered} />
      </Canvas>
      <div className="pointer-events-none absolute inset-x-0 bottom-2 flex justify-center px-4">
        {agent ? (
          <motion.div
            key={agent.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass pointer-events-auto max-w-sm rounded-[16px] border border-line px-4 py-3"
          >
            <p className="text-xs uppercase tracking-[0.16em] text-ink-faint">{agent.title}</p>
            <p className="display mt-1 text-2xl">{agent.name}</p>
            <p className="mt-1 text-sm text-ink-muted">{agent.specialty}</p>
            <p className="mt-2 text-xs text-ink-faint">
              {agentCapabilities[agent.slug as "accountant"][0]}
            </p>
          </motion.div>
        ) : (
          <p className="text-xs uppercase tracking-[0.18em] text-ink-faint">
            Наведите — познакомьтесь с командой
          </p>
        )}
      </div>
    </div>
  );
}
