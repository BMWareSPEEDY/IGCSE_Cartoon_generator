'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import DustParticles from './DustParticles';

/**
 * Site-wide ambient backdrop: deep archival-green gradient wash with brass /
 * verdigris glows and a slow-drifting golden dust field. Fixed behind all
 * content, pointer-transparent, and deliberately lightweight (one small
 * unlit point cloud, DPR 1 on touch devices).
 */
export default function AmbientBackground() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mobileQuery = window.matchMedia('(max-width: 767px)');
    const coarsePointer = window.matchMedia('(pointer: coarse)');
    const sync = () => setIsMobile(mobileQuery.matches || coarsePointer.matches);
    sync();
    mobileQuery.addEventListener('change', sync);
    coarsePointer.addEventListener('change', sync);
    return () => {
      mobileQuery.removeEventListener('change', sync);
      coarsePointer.removeEventListener('change', sync);
    };
  }, []);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* Single uniform archival green — no gradient steps, so the page reads
          as one continuous backdrop from hero to footer */}
      <div className="absolute inset-0 bg-[#081712]" />

      {/* Drifting golden dust field */}
      <Canvas
        camera={{ position: [0, 0, 10], fov: 60 }}
        gl={{ antialias: false, alpha: true, powerPreference: 'low-power' }}
        dpr={isMobile ? 1 : [1, 1.5]}
      >
        <Suspense fallback={null}>
          <DustParticles count={isMobile ? 40 : 110} spread={[24, 13, 10]} />
        </Suspense>
      </Canvas>

      {/* Paper grain to seat the gradients */}
      <div className="absolute inset-0 bg-paper-grain mix-blend-overlay pointer-events-none opacity-30" />
    </div>
  );
}
