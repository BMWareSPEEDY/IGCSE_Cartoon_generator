'use client';

import React, { useEffect, useRef, useState } from 'react';
import { GenerationStage } from '@/lib/types';
import { Feather, Compass, Layers, Check, Loader2, Clock } from 'lucide-react';

interface InkSpreadingLoaderProps {
  topic: string;
  stage: GenerationStage;
  conceptTitle: string | null;
  startedAt: number;
}

// Honest progress: the UI advances only on genuine backend milestones.
// Step 1 (concept) → 50%. Step 2 (render) completes → the loader unmounts.
// Elapsed seconds are measured live, never estimated.
export default function InkSpreadingLoader({ topic, stage, conceptTitle, startedAt }: InkSpreadingLoaderProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [elapsed, setElapsed] = useState(0);

  // Live elapsed timer (real seconds since the request left the browser).
  useEffect(() => {
    setElapsed(Math.max(0, Math.floor((Date.now() - startedAt) / 1000)));
    const timer = setInterval(() => {
      setElapsed(Math.max(0, Math.floor((Date.now() - startedAt) / 1000)));
    }, 500);
    return () => clearInterval(timer);
  }, [startedAt]);

  // Generative Canvas Ink-Bleed and Capillary Diffusion (ambient decoration)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    interface InkTendril {
      x: number;
      y: number;
      angle: number;
      speed: number;
      radius: number;
      life: number;
      decay: number;
      color: string;
    }

    const tendrils: InkTendril[] = [];

    const spawnInkDrop = (cx: number, cy: number, count = 16) => {
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        tendrils.push({
          x: cx + (Math.random() - 0.5) * 10,
          y: cy + (Math.random() - 0.5) * 10,
          angle: angle,
          speed: Math.random() * 2.2 + 0.6,
          radius: Math.random() * 4.5 + 2,
          life: 1.0,
          decay: Math.random() * 0.008 + 0.004,
          color: Math.random() > 0.3 ? '#0e1217' : '#1a241f',
        });
      }
    };

    // Spawn central ink pools
    spawnInkDrop(width / 2, height / 2, 28);

    const spawnInterval = setInterval(() => {
      const rx = width / 2 + (Math.random() - 0.5) * (width * 0.45);
      const ry = height / 2 + (Math.random() - 0.5) * (height * 0.4);
      spawnInkDrop(rx, ry, 12);
    }, 1800);

    // Render loop
    const render = () => {
      // Very faint parchment fade to create capillary trail trails
      ctx.fillStyle = 'rgba(244, 238, 226, 0.02)';
      ctx.fillRect(0, 0, width, height);

      for (let i = tendrils.length - 1; i >= 0; i--) {
        const t = tendrils[i];

        // Random jitter mimicking porous paper fibers
        t.angle += (Math.random() - 0.5) * 0.35;
        t.x += Math.cos(t.angle) * t.speed;
        t.y += Math.sin(t.angle) * t.speed;
        t.radius *= 0.992;
        t.life -= t.decay;

        ctx.beginPath();
        ctx.arc(t.x, t.y, Math.max(0.4, t.radius), 0, Math.PI * 2);
        ctx.fillStyle = t.color;
        ctx.globalAlpha = Math.max(0, t.life * 0.85);
        ctx.fill();

        // Occasional branch split
        if (Math.random() < 0.025 && tendrils.length < 220 && t.life > 0.4) {
          tendrils.push({
            x: t.x,
            y: t.y,
            angle: t.angle + (Math.random() - 0.5) * 1.5,
            speed: t.speed * 0.85,
            radius: t.radius * 0.8,
            life: t.life * 0.9,
            decay: t.decay * 1.2,
            color: t.color,
          });
        }

        if (t.life <= 0 || t.radius < 0.2) {
          tendrils.splice(i, 1);
        }
      }

      ctx.globalAlpha = 1.0;
      animId = requestAnimationFrame(render);
    };

    render();

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      clearInterval(spawnInterval);
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const conceptDone = stage === 'render';
  const headline = stage === 'concept'
    ? 'DRAFTING THE ALLEGORY'
    : conceptTitle
      ? `RENDERING “${conceptTitle.toUpperCase()}”`
      : 'RENDERING THE ENGRAVING';

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border-2 border-brass-500/50 bg-[#f4eee2] shadow-2xl p-5 sm:p-8 lg:p-12 min-h-[400px] sm:min-h-[460px] flex flex-col justify-between gap-6 text-ink-pure">
      {/* Antique double border motif */}
      <div className="absolute inset-2 border border-dashed border-brass-600/40 pointer-events-none rounded-xl" />

      {/* Canvas for Sumi Ink Diffusion */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none opacity-80"
      />

      {/* Status strip (static flow so it can never overlap on small screens) */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-x-3 gap-y-2 text-[10px] sm:text-xs font-mono tracking-widest text-brass-700 uppercase">
        <span className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-brass-600 shrink-0" />
          Archival Engraver in Session
        </span>
        <span className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 shrink-0" />
          {elapsed}s elapsed
        </span>
      </div>

      {/* Centerpiece Plate Header */}
      <div className="relative z-10 text-center max-w-xl mx-auto">
        <div className="inline-flex max-w-full items-center gap-2 px-3 py-1.5 rounded-full bg-archive-900/10 border border-brass-600/30 text-[11px] sm:text-xs font-serif text-archive-800 mb-3">
          <Feather className="w-3.5 h-3.5 shrink-0 text-brass-600" />
          <span className="min-w-0 break-words text-left">
            Etching Copperplate for &ldquo;{topic}&rdquo;
          </span>
        </div>
        <h3 className="font-display text-lg sm:text-3xl text-archive-950 font-bold tracking-wide leading-tight break-words">
          {headline}
        </h3>
        <p className="font-editorial text-archive-800 text-xs sm:text-sm italic mt-1 text-pretty">
          {stage === 'concept'
            ? 'The reasoning engine is drafting your title, quote, metaphors, and image prompt…'
            : 'The concept is drafted. The image engine is now rendering your engraving…'}
        </p>
      </div>

      {/* Genuine milestone tracker (advances only on real server responses) */}
      <div className="relative z-10 bg-archive-950/90 text-parchment-100 p-3.5 sm:p-5 rounded-lg border border-brass-500/40 shadow-inner max-w-xl mx-auto w-full font-mono">
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-[10px] sm:text-xs text-brass-400/80 border-b border-brass-500/20 pb-2 mb-3">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-verdigris-400 animate-ping inline-block" />
            LIVE ENGRAVING STATUS
          </span>
          <span>STEP {conceptDone ? '2' : '1'} OF 2</span>
        </div>

        <ul className="space-y-2.5 text-xs sm:text-sm">
          <li className="flex items-start gap-2.5">
            {conceptDone ? (
              <Check className="w-4 h-4 shrink-0 mt-0.5 text-verdigris-300" />
            ) : (
              <Loader2 className="w-4 h-4 shrink-0 mt-0.5 text-brass-300 animate-spin" />
            )}
            <span className="min-w-0">
              <span className="text-brass-100 font-bold">Step 1/2 — Draft the allegory. </span>
              <span className="text-parchment-300">
                {conceptDone
                  ? `Done${conceptTitle ? ` — “${conceptTitle}”` : ''}.`
                  : 'Waiting on the reasoning engine…'}
              </span>
            </span>
          </li>
          <li className="flex items-start gap-2.5">
            {conceptDone ? (
              <Loader2 className="w-4 h-4 shrink-0 mt-0.5 text-brass-300 animate-spin" />
            ) : (
              <span className="w-4 h-4 shrink-0 mt-0.5 flex items-center justify-center">
                <span className="w-1.5 h-1.5 rounded-full bg-parchment-400/40 inline-block" />
              </span>
            )}
            <span className="min-w-0">
              <span className="text-brass-100 font-bold">Step 2/2 — Render the engraving. </span>
              <span className="text-parchment-300">
                {conceptDone ? 'Waiting on the image engine…' : 'Queued.'}
              </span>
            </span>
          </li>
        </ul>

        {/* Milestone bar: fills only when a step genuinely completes */}
        <div
          className="w-full bg-archive-900 h-1.5 rounded-full mt-4 overflow-hidden border border-brass-500/30"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={conceptDone ? 50 : 0}
          aria-label={conceptDone ? 'Step 1 of 2 complete' : 'Step 1 of 2 in progress'}
        >
          <div
            className={`h-full bg-gradient-to-r from-verdigris-400 to-brass-400 transition-all duration-700 ease-out ${conceptDone ? 'animate-pulse' : ''}`}
            style={{ width: conceptDone ? '50%' : '0%' }}
          />
        </div>
      </div>

      {/* Footer Notes */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:flex-wrap items-center sm:justify-between gap-2 text-[11px] sm:text-xs font-serif text-archive-700 border-t border-brass-600/30 pt-3 text-center sm:text-left">
        <span className="flex items-center gap-2 min-w-0">
          <Layers className="w-4 h-4 shrink-0 text-brass-600" />
          <span>Live status — nothing here is estimated</span>
        </span>
        <span className="italic font-editorial text-archive-800 shrink-0">
          Engravings typically take 20–60 seconds.
        </span>
      </div>
    </div>
  );
}
