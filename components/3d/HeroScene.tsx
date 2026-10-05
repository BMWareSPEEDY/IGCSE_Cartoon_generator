'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import ArmillarySphere from './ArmillarySphere';
import NavigationalCompass from './NavigationalCompass';
import DustParticles from './DustParticles';

// Half-extents (world units) the composition needs on each layout, including margin.
// Width covers sphere + orbit ring (+ compass on desktop); height covers the
// spindle pole-to-pole, which is what clips on wide/short viewports.
const NEEDED_HALF_WIDTH_DESKTOP = 3.25; // sphere + orbit ring at x=-0.8 plus compass at x=2.2
const NEEDED_HALF_WIDTH_MOBILE = 2.4; // centered sphere + orbit ring only
const NEEDED_HALF_HEIGHT_DESKTOP = 2.9;
const NEEDED_HALF_HEIGHT_MOBILE = 2.9;
const TAN_HALF_FOV = Math.tan(((45 / 2) * Math.PI) / 180); // fov 45
const MIN_DISTANCE = 5;
const MAX_DISTANCE = 14;

/**
 * Smoothly dollies the default camera so the composition width always fits
 * inside the frustum, whatever the screen aspect ratio. Damped so rotations
 * and resizes glide instead of jumping, and kept clear of the mouse parallax
 * (which only rotates the models, never the camera).
 */
function CameraRig({ distance }: { distance: number }) {
  useFrame((state, delta) => {
    const camera = state.camera;
    const k = 1 - Math.exp(-4 * delta);
    camera.position.x += (0 - camera.position.x) * k;
    camera.position.y += (0 - camera.position.y) * k;
    camera.position.z += (distance - camera.position.z) * k;
    camera.lookAt(0, 0, 0);
    // Observable for diagnostics: lets us assert the dolly converged.
    (window as any).__heroCamZ = camera.position.z;
  });
  return null;
}

export default function HeroScene() {
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const [aspect, setAspect] = useState(16 / 9);

  useEffect(() => {
    // Match the JS breakpoint to Tailwind's `md` so the scene and the DOM agree.
    const mobileQuery = window.matchMedia('(max-width: 767px)');
    const coarsePointer = window.matchMedia('(pointer: coarse)');

    const syncViewport = () => {
      setIsMobile(mobileQuery.matches || coarsePointer.matches);
      if (window.innerHeight > 0) {
        setAspect(window.innerWidth / window.innerHeight);
      }
    };

    syncViewport();
    mobileQuery.addEventListener('change', syncViewport);
    coarsePointer.addEventListener('change', syncViewport);
    window.addEventListener('resize', syncViewport);
    window.addEventListener('orientationchange', syncViewport);

    const handlePointerMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      // Normalize pointer coordinates from -1 to 1
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;
      setMouse({ x, y });
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });

    return () => {
      mobileQuery.removeEventListener('change', syncViewport);
      coarsePointer.removeEventListener('change', syncViewport);
      window.removeEventListener('resize', syncViewport);
      window.removeEventListener('orientationchange', syncViewport);
      window.removeEventListener('pointermove', handlePointerMove);
    };
  }, []);

  // Distance required so the needed half-extents fit: halfW = d * tan(fov/2) * aspect,
  // halfH = d * tan(fov/2). The taller of the two wins; clamped so typical
  // desktop framing barely moves while wide/short screens dolly out.
  const cameraDistance = useMemo(() => {
    const neededW = isMobile ? NEEDED_HALF_WIDTH_MOBILE : NEEDED_HALF_WIDTH_DESKTOP;
    const neededH = isMobile ? NEEDED_HALF_HEIGHT_MOBILE : NEEDED_HALF_HEIGHT_DESKTOP;
    const fitW = neededW / (TAN_HALF_FOV * Math.max(aspect, 0.2));
    const fitH = neededH / TAN_HALF_FOV;
    return Math.min(MAX_DISTANCE, Math.max(MIN_DISTANCE, fitW, fitH));
  }, [aspect, isMobile]);

  // Memoized so the Canvas never re-applies a fresh camera object on
  // re-render (which would yank the rig's dolly back to the start).
  const cameraProps = useMemo(
    () => ({ position: [0, 0, 6.5] as [number, number, number], fov: 45 }),
    []
  );

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden z-0">
      <Canvas
        camera={cameraProps}
        gl={{ antialias: !isMobile, alpha: true, powerPreference: 'high-performance' }}
        dpr={isMobile ? [1, 1.5] : [1, 2]}
      >
        {/* Keeps the full composition inside the frame on any aspect ratio */}
        <CameraRig distance={cameraDistance} />
        <Suspense fallback={null}>
          {/* Ambient archival illumination */}
          <ambientLight intensity={0.45} color="#1c3e34" />

          {/* Warm directional amber key light (vintage study lamp) */}
          <directionalLight
            position={[5, 6, 4]}
            intensity={2.2}
            color="#ffd993"
          />

          {/* Verdigris oxidized rim light */}
          <pointLight
            position={[-5, -3, -2]}
            intensity={1.8}
            color="#3aa890"
          />

          {/* Golden fill from below */}
          <pointLight
            position={[0, -4, 3]}
            intensity={1.0}
            color="#d4af37"
          />

          {/* Central Antique Brass Armillary Sphere */}
          <group position={[isMobile ? 0 : -0.8, isMobile ? 0.3 : 0.1, 0]}>
            <ArmillarySphere mouse={mouse} />
          </group>

          {/* Navigational Compass (Only rendered on desktop to avoid clutter) */}
          {!isMobile && <NavigationalCompass mouse={mouse} />}

          {/* Suspended Golden Dust Motes */}
          <DustParticles count={isMobile ? 50 : 130} />
        </Suspense>
      </Canvas>

      {/* Paper grain to seat the scene (the page backdrop itself stays a
          single uniform color so hero and body blend seamlessly) */}
      <div className="absolute inset-0 bg-paper-grain mix-blend-overlay pointer-events-none opacity-40" />
    </div>
  );
}
