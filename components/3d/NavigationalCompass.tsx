'use client';

import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface NavigationalCompassProps {
  mouse: { x: number; y: number };
}

/** Paints a genuine mariner's dial: degree ticks + numerals, cardinal and
 *  intercardinal points, and engraved concentric rings on aged parchment. */
function createDialTexture(): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const c = size / 2;
  const ink = '#382f22';

  // Aged parchment base
  ctx.fillStyle = '#f4eee2';
  ctx.beginPath();
  ctx.arc(c, c, c, 0, Math.PI * 2);
  ctx.fill();

  // Subtle age blotches
  const age = ctx.createRadialGradient(c, c, size * 0.1, c, c, c);
  age.addColorStop(0, 'rgba(0,0,0,0)');
  age.addColorStop(1, 'rgba(120, 95, 50, 0.18)');
  ctx.fillStyle = age;
  ctx.beginPath();
  ctx.arc(c, c, c, 0, Math.PI * 2);
  ctx.fill();

  const polar = (r: number, deg: number): [number, number] => {
    const a = ((deg - 90) * Math.PI) / 180;
    return [c + r * Math.cos(a), c + r * Math.sin(a)];
  };

  // Outer brass rule
  ctx.strokeStyle = '#7c5d18';
  ctx.lineWidth = 9;
  ctx.beginPath();
  ctx.arc(c, c, c - 8, 0, Math.PI * 2);
  ctx.stroke();

  // 60 minute / degree ticks (longer every 5)
  for (let i = 0; i < 60; i++) {
    const major = i % 5 === 0;
    const [x0, y0] = polar(c - 20, i * 6);
    const [x1, y1] = polar(major ? c - 52 : c - 36, i * 6);
    ctx.strokeStyle = ink;
    ctx.lineWidth = major ? 6 : 2.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.stroke();
  }

  // Degree numerals every 30° (cardinal slots left for letters)
  ctx.fillStyle = ink;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '700 30px Georgia, serif';
  for (const deg of [30, 60, 120, 150, 210, 240, 300, 330]) {
    const [x, y] = polar(c - 84, deg);
    ctx.fillText(String(deg), x, y);
  }

  // Intercardinal points (small)
  ctx.font = '700 30px Georgia, serif';
  ctx.fillStyle = 'rgba(56, 47, 34, 0.75)';
  for (const [label, deg] of [['NE', 45], ['SE', 135], ['SW', 225], ['NW', 315]] as const) {
    const [x, y] = polar(c - 128, deg);
    ctx.fillText(label, x, y);
  }

  // Cardinal letters (large; north in oxblood like the needle counterweight)
  ctx.font = '900 72px Georgia, serif';
  const cardinals = [['N', 0, '#a12d25'], ['E', 90, ink], ['S', 180, ink], ['W', 270, ink]] as const;
  for (const [label, deg, color] of cardinals) {
    const [x, y] = polar(c - 132, deg);
    ctx.fillStyle = color;
    ctx.fillText(label, x, y);
  }

  // Engraved inner rings framing the rose
  ctx.strokeStyle = 'rgba(56, 47, 34, 0.55)';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(c, c, c - 168, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(124, 93, 24, 0.6)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(c, c, c - 178, 0, Math.PI * 2);
  ctx.stroke();

  // Center boss ring (mostly hidden beneath the needle pivot)
  ctx.fillStyle = '#c29b38';
  ctx.beginPath();
  ctx.arc(c, c, 26, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = ink;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(c, c, 26, 0, Math.PI * 2);
  ctx.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

export default function NavigationalCompass({ mouse }: NavigationalCompassProps) {
  const compassGroup = useRef<THREE.Group>(null);
  const needleGroup = useRef<THREE.Group>(null);

  const brassMaterial = new THREE.MeshStandardMaterial({
    color: '#c29b38',
    metalness: 0.85,
    roughness: 0.35,
  });

  const northNeedleMaterial = new THREE.MeshStandardMaterial({
    color: '#3aa890', // Verdigris teal for North
    metalness: 0.6,
    roughness: 0.4,
  });

  const southNeedleMaterial = new THREE.MeshStandardMaterial({
    color: '#a12d25', // Aged oxblood lacquer for South
    metalness: 0.5,
    roughness: 0.4,
  });

  // Genuine mariner's dial face (painted once, reused every frame)
  const dialTexture = useMemo(() => createDialTexture(), []);

  useFrame((state, delta) => {
    if (!compassGroup.current || !needleGroup.current) return;

    // Subtle gentle floating bob
    const t = state.clock.getElapsedTime();
    compassGroup.current.position.y = -0.3 + Math.sin(t * 1.5) * 0.08;
    compassGroup.current.rotation.z = Math.sin(t * 0.8) * 0.05;

    // Angle towards mouse
    const targetAngle = Math.atan2(mouse.y, mouse.x) - Math.PI / 2;
    needleGroup.current.rotation.z = THREE.MathUtils.damp(
      needleGroup.current.rotation.z,
      targetAngle,
      4,
      delta
    );

    // Compass body tilt
    compassGroup.current.rotation.x = THREE.MathUtils.damp(
      compassGroup.current.rotation.x,
      0.35 + mouse.y * 0.2,
      2,
      delta
    );
    compassGroup.current.rotation.y = THREE.MathUtils.damp(
      compassGroup.current.rotation.y,
      mouse.x * 0.3,
      2,
      delta
    );
  });

  return (
    <group ref={compassGroup} position={[2.2, -0.3, 0]} scale={0.75}>
      {/* Outer Brass Housing / Bezel */}
      <mesh>
        <cylinderGeometry args={[0.9, 0.95, 0.18, 48]} />
        <primitive object={brassMaterial} attach="material" />
      </mesh>

      {/* Fluted Rim Edge */}
      <mesh position={[0, 0.09, 0]}>
        <torusGeometry args={[0.92, 0.035, 12, 48]} />
        <primitive object={brassMaterial} attach="material" />
      </mesh>

      {/* Compass Dial Face (painted mariner's rose on parchment ivory) */}
      <mesh position={[0, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.82, 48]} />
        <meshStandardMaterial
          map={dialTexture}
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>

      {/* Glass Crystal Cover */}
      <mesh position={[0, 0.13, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.85, 36]} />
        <meshPhysicalMaterial
          color="#ffffff"
          roughness={0.05}
          transmission={0.92}
          thickness={0.1}
          transparent
          opacity={0.3}
        />
      </mesh>

      {/* Magnetic Needle Assembly */}
      <group ref={needleGroup} position={[0, 0.08, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        {/* Central Pivot Jewel */}
        <mesh position={[0, 0, 0.02]}>
          <cylinderGeometry args={[0.08, 0.08, 0.04, 16]} />
          <primitive object={brassMaterial} attach="material" />
        </mesh>

        {/* North Pointer (Verdigris Arrow) */}
        <mesh position={[0, 0.35, 0.01]} rotation={[0, 0, 0]}>
          <coneGeometry args={[0.07, 0.65, 3]} />
          <primitive object={northNeedleMaterial} attach="material" />
        </mesh>

        {/* South Pointer (Oxblood Red Arrow) */}
        <mesh position={[0, -0.35, 0.01]} rotation={[0, 0, Math.PI]}>
          <coneGeometry args={[0.07, 0.65, 3]} />
          <primitive object={southNeedleMaterial} attach="material" />
        </mesh>
      </group>

      {/* Suspension Ring (Top Loop) */}
      <mesh position={[0, 1.05, 0]} rotation={[0, 0, 0]}>
        <torusGeometry args={[0.18, 0.03, 16, 32]} />
        <primitive object={brassMaterial} attach="material" />
      </mesh>
    </group>
  );
}
