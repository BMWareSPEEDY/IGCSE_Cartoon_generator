'use client';

import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ArmillarySphereProps {
  mouse: { x: number; y: number };
}

const ORBIT_RADIUS = 1.85;
const SATELLITES = [0, (2 * Math.PI) / 3, (4 * Math.PI) / 3];

export default function ArmillarySphere({ mouse }: ArmillarySphereProps) {
  const groupRef = useRef<THREE.Group>(null);
  const outerRingRef = useRef<THREE.Mesh>(null);
  const middleRingRef = useRef<THREE.Mesh>(null);
  const innerRingRef = useRef<THREE.Mesh>(null);
  const zodiacBandRef = useRef<THREE.Group>(null);
  const orbitRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  // Damped parallax base (separate from the endless precession spin below)
  const baseRot = useRef({ x: 0, y: 0.12 });
  const spin = useRef(0);

  // High-fidelity PBR antique brass materials (memoized: the parent re-renders
  // on every pointer move, and these must not be rebuilt each time)
  const materials = useMemo(
    () => ({
      polishedBrass: new THREE.MeshStandardMaterial({
        color: '#d4af37',
        metalness: 0.88,
        roughness: 0.28,
      }),
      antiqueGold: new THREE.MeshStandardMaterial({
        color: '#b89028',
        metalness: 0.92,
        roughness: 0.38,
      }),
      patinatedVerdigris: new THREE.MeshStandardMaterial({
        color: '#286f5e',
        metalness: 0.45,
        roughness: 0.55,
      }),
      celestialBronze: new THREE.MeshStandardMaterial({
        color: '#422812',
        metalness: 0.75,
        roughness: 0.42,
        emissive: '#2a1604',
        emissiveIntensity: 0.55,
      }),
    }),
    []
  );

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    // Smooth inertial response to mouse parallax
    const targetRotX = mouse.y * 0.35;
    const targetRotY = mouse.x * 0.55;

    baseRot.current.x = THREE.MathUtils.damp(
      baseRot.current.x,
      targetRotX,
      2.5,
      delta
    );
    baseRot.current.y = THREE.MathUtils.damp(
      baseRot.current.y,
      targetRotY + 0.12,
      2.5,
      delta
    );

    // Endless stately precession layered over the parallax (touch devices get
    // motion too, since they never emit pointer parallax)
    spin.current += delta * 0.06;
    groupRef.current.rotation.x = baseRot.current.x;
    groupRef.current.rotation.y = baseRot.current.y + spin.current;

    // Continuous celestial motion of concentric rings
    if (outerRingRef.current) outerRingRef.current.rotation.z += delta * 0.1;
    if (middleRingRef.current) middleRingRef.current.rotation.x += delta * 0.15;
    if (innerRingRef.current) innerRingRef.current.rotation.y -= delta * 0.18;
    if (zodiacBandRef.current) zodiacBandRef.current.rotation.z -= delta * 0.08;
    if (orbitRef.current) orbitRef.current.rotation.z += delta * 0.16;
    if (coreRef.current) coreRef.current.rotation.y += delta * 0.06;
  });

  const { polishedBrass, antiqueGold, patinatedVerdigris, celestialBronze } = materials;

  return (
    <group ref={groupRef} position={[0, 0, 0]} scale={1.2}>
      {/* Central Celestial Core Globe (High polygon count) */}
      <mesh ref={coreRef}>
        <sphereGeometry args={[0.56, 64, 64]} />
        <primitive object={celestialBronze} attach="material" />
      </mesh>

      {/* Primary Equator Outer Brass Ring (32 radial segments, 160 tubular segments for ultra-smooth curve) */}
      <mesh ref={outerRingRef}>
        <torusGeometry args={[1.52, 0.045, 32, 160]} />
        <primitive object={polishedBrass} attach="material" />
      </mesh>

      {/* Outer Ring Beveled Edge Accent */}
      <mesh>
        <torusGeometry args={[1.56, 0.015, 16, 160]} />
        <primitive object={antiqueGold} attach="material" />
      </mesh>

      {/* Solstitial Colure Ring (Tilted at 23.5 degrees) */}
      <mesh ref={middleRingRef} rotation={[0.41, 0, 0]}>
        <torusGeometry args={[1.4, 0.04, 32, 160]} />
        <primitive object={antiqueGold} attach="material" />
      </mesh>

      {/* Polar Meridian Ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.28, 0.038, 28, 140]} />
        <primitive object={polishedBrass} attach="material" />
      </mesh>

      {/* Wide Ecliptic / Zodiac Band with verdigris patina */}
      <group ref={zodiacBandRef} rotation={[0.41, 0.6, 0]}>
        <mesh>
          <torusGeometry args={[1.22, 0.06, 24, 120]} />
          <primitive object={patinatedVerdigris} attach="material" />
        </mesh>

        {/* 12 Zodiac / Celestial Notches */}
        {Array.from({ length: 12 }).map((_, i) => (
          <mesh
            key={i}
            rotation={[0, 0, (i * Math.PI) / 6]}
            position={[0, 0, 0]}
          >
            <boxGeometry args={[0.018, 0.16, 0.03]} />
            <primitive object={polishedBrass} attach="material" />
          </mesh>
        ))}
      </group>

      {/* Inner Horizon Ring */}
      <mesh ref={innerRingRef} rotation={[0, 0, Math.PI / 4]}>
        <torusGeometry args={[1.05, 0.032, 24, 120]} />
        <primitive object={polishedBrass} attach="material" />
      </mesh>

      {/* Outer Satellite Orbit (tilted thin ring with three lunar beads) */}
      <group rotation={[0.5, 0.2, 0]}>
        <mesh>
          <torusGeometry args={[ORBIT_RADIUS, 0.02, 16, 180]} />
          <primitive object={antiqueGold} attach="material" />
        </mesh>
        <group ref={orbitRef}>
          {SATELLITES.map((angle) => (
            <mesh
              key={angle}
              position={[Math.cos(angle) * ORBIT_RADIUS, Math.sin(angle) * ORBIT_RADIUS, 0]}
            >
              <sphereGeometry args={[0.06, 24, 24]} />
              <primitive object={polishedBrass} attach="material" />
            </mesh>
          ))}
        </group>
      </group>

      {/* Central Axis Spindle */}
      <mesh>
        <cylinderGeometry args={[0.03, 0.03, 3.4, 32]} />
        <primitive object={polishedBrass} attach="material" />
      </mesh>

      {/* Finials at Axis Poles */}
      <mesh position={[0, 1.72, 0]}>
        <sphereGeometry args={[0.085, 32, 32]} />
        <primitive object={polishedBrass} attach="material" />
      </mesh>
      <mesh position={[0, -1.72, 0]}>
        <sphereGeometry args={[0.085, 32, 32]} />
        <primitive object={polishedBrass} attach="material" />
      </mesh>

      {/* 8 Cardinal / Degree Spoke Accents */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
        <mesh
          key={deg}
          rotation={[0, 0, (deg * Math.PI) / 180]}
        >
          <cylinderGeometry args={[0.01, 0.01, 0.18, 16]} />
          <primitive object={antiqueGold} attach="material" />
        </mesh>
      ))}
    </group>
  );
}
