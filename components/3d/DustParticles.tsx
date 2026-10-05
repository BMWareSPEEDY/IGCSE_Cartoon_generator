'use client';

import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface DustParticlesProps {
  count?: number;
  /** World-unit volume the motes drift inside. Defaults preserve the hero look. */
  spread?: [number, number, number];
}

export default function DustParticles({ count = 120, spread }: DustParticlesProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const [spreadX = 12, spreadY = 8, spreadZ = 8] = spread ?? [];

  const [positions, scales] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const scl = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      pos[i * 3 + 0] = (Math.random() - 0.5) * spreadX;
      pos[i * 3 + 1] = (Math.random() - 0.5) * spreadY;
      pos[i * 3 + 2] = (Math.random() - 0.5) * spreadZ;
      scl[i] = Math.random() * 0.04 + 0.02;
    }
    return [pos, scl];
  }, [count, spreadX, spreadY, spreadZ]);

  const halfY = spreadY / 2;

  useFrame((_, delta) => {
    if (!pointsRef.current) return;
    const posAttr = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute;
    const array = posAttr.array as Float32Array;

    for (let i = 0; i < count; i++) {
      // Gentle upward float with slight sinusoidal sway
      array[i * 3 + 1] += delta * 0.15;
      array[i * 3 + 0] += Math.sin(delta * 2 + i) * 0.003;

      // Wrap around vertically
      if (array[i * 3 + 1] > halfY) {
        array[i * 3 + 1] = -halfY;
        array[i * 3 + 0] = (Math.random() - 0.5) * spreadX;
      }
    }
    posAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.06}
        color="#e5c768"
        transparent
        opacity={0.65}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}
