'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, Plus, Minus, RotateCcw, Loader2 } from 'lucide-react';

interface ImageZoomModalProps {
  src: string;
  alt: string;
  caption?: string;
  subcaption?: string;
  onClose: () => void;
}

const MIN_SCALE = 1;
const MAX_SCALE = 8;

interface View {
  scale: number;
  x: number;
  y: number;
}

/**
 * Fullscreen focus mode for artwork: scroll-wheel zoom anchored at the cursor,
 * drag to pan, pinch to zoom on touch, double-click to toggle, +/- buttons and
 * reset for good measure. The zoom % readout always reflects the true scale —
 * nothing is estimated.
 */
export default function ImageZoomModal({ src, alt, caption, subcaption, onClose }: ImageZoomModalProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [natural, setNatural] = useState({ w: 0, h: 0 });
  const [view, setView] = useState<View>({ scale: 1, x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const viewRef = useRef<View>({ scale: 1, x: 0, y: 0 });
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const dragRef = useRef<{ lastX: number; lastY: number } | null>(null);
  const pinchRef = useRef<{
    startDist: number;
    startScale: number;
    startX: number;
    startY: number;
    startMidX: number;
    startMidY: number;
  } | null>(null);

  // Reset whenever a different image is shown.
  useEffect(() => {
    viewRef.current = { scale: 1, x: 0, y: 0 };
    setView({ scale: 1, x: 0, y: 0 });
    setNatural({ w: 0, h: 0 });
  }, [src]);

  // ESC closes; lock background scroll while open (restored only if no other
  // dialog — e.g. the archive lightbox — is still on screen).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      const dialogs = document.querySelectorAll('[role="dialog"]');
      if (dialogs.length <= 1) {
        document.body.style.overflow = prev;
      }
    };
  }, [onClose]);

  const commit = useCallback((next: View) => {
    viewRef.current = next;
    setView(next);
  }, []);

  // Fitted (contain) base size of the image inside the stage, in CSS px.
  const baseSize = useCallback(() => {
    const el = stageRef.current;
    if (!el || natural.w === 0 || natural.h === 0) return null;
    const cw = el.clientWidth;
    const ch = el.clientHeight;
    if (cw === 0 || ch === 0) return null;
    const ar = natural.w / natural.h;
    const baseW = Math.min(cw, ch * ar);
    const baseH = baseW / ar;
    return { cw, ch, baseW, baseH, baseX: (cw - baseW) / 2, baseY: (ch - baseH) / 2 };
  }, [natural]);

  const clampPos = useCallback(
    (x: number, y: number, scale: number) => {
      const b = baseSize();
      if (!b) return { x: 0, y: 0 };
      const maxX = Math.max(0, (b.baseW * scale - b.cw) / 2);
      const maxY = Math.max(0, (b.baseH * scale - b.ch) / 2);
      return {
        x: Math.min(maxX, Math.max(-maxX, x)),
        y: Math.min(maxY, Math.max(-maxY, y))
      };
    },
    [baseSize]
  );

  // Zoom keeping the image point under (ax, ay) fixed. Anchors are in
  // stage-client coordinates; math runs around the stage center.
  const zoomTo = useCallback(
    (targetScale: number, ax: number, ay: number) => {
      const el = stageRef.current;
      if (!el || natural.w === 0) return;
      const rect = el.getBoundingClientRect();
      const v = viewRef.current;
      const clamped = Math.min(MAX_SCALE, Math.max(MIN_SCALE, targetScale));
      if (clamped === v.scale) return;
      const k = clamped / v.scale;
      const cx = ax - rect.width / 2;
      const cy = ay - rect.height / 2;
      const p = clampPos(cx - (cx - v.x) * k, cy - (cy - v.y) * k, clamped);
      commit({ scale: clamped, x: clamped === MIN_SCALE ? 0 : p.x, y: clamped === MIN_SCALE ? 0 : p.y });
    },
    [clampPos, commit, natural]
  );

  const zoomBy = useCallback(
    (factor: number, ax?: number, ay?: number) => {
      const el = stageRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      zoomTo(viewRef.current.scale * factor, ax ?? rect.width / 2, ay ?? rect.height / 2);
    },
    [zoomTo]
  );

  // Native wheel listener (non-passive) so trackpads and mouse wheels never
  // scroll the page behind the artwork.
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      zoomBy(Math.exp(-e.deltaY * 0.0015), e.clientX - rect.left, e.clientY - rect.top);
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [zoomBy]);

  const endPointer = useCallback((id: number) => {
    pointers.current.delete(id);
    if (pointers.current.size < 2) pinchRef.current = null;
    if (pointers.current.size === 0) {
      dragRef.current = null;
      setDragging(false);
    }
  }, []);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 2) {
      const [a, b] = Array.from(pointers.current.values());
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      const el = stageRef.current;
      const rect = el?.getBoundingClientRect();
      pinchRef.current = {
        startDist: Math.max(dist, 1),
        startScale: viewRef.current.scale,
        startX: viewRef.current.x,
        startY: viewRef.current.y,
        startMidX: rect ? (a.x + b.x) / 2 - rect.left - rect.width / 2 : 0,
        startMidY: rect ? (a.y + b.y) / 2 - rect.top - rect.height / 2 : 0
      };
      dragRef.current = null;
      setDragging(false);
    } else if (pointers.current.size === 1) {
      dragRef.current = { lastX: e.clientX, lastY: e.clientY };
      setDragging(viewRef.current.scale > MIN_SCALE);
    }
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pinchRef.current && pointers.current.size >= 2) {
      // Pinch: scale by finger spread, anchored at the moving midpoint.
      const [a, b] = Array.from(pointers.current.values());
      const el = stageRef.current;
      const rect = el?.getBoundingClientRect();
      if (!rect) return;
      const dist = Math.max(Math.hypot(a.x - b.x, a.y - b.y), 1);
      const p = pinchRef.current;
      const target = Math.min(MAX_SCALE, Math.max(MIN_SCALE, p.startScale * (dist / p.startDist)));
      const k = target / p.startScale;
      const midX = (a.x + b.x) / 2 - rect.left - rect.width / 2;
      const midY = (a.y + b.y) / 2 - rect.top - rect.height / 2;
      const c = clampPos(midX - (p.startMidX - p.startX) * k, midY - (p.startMidY - p.startY) * k, target);
      commit({ scale: target, x: target === MIN_SCALE ? 0 : c.x, y: target === MIN_SCALE ? 0 : c.y });
      return;
    }

    if (dragRef.current && pointers.current.size === 1) {
      const dx = e.clientX - dragRef.current.lastX;
      const dy = e.clientY - dragRef.current.lastY;
      dragRef.current = { lastX: e.clientX, lastY: e.clientY };
      const v = viewRef.current;
      if (v.scale <= MIN_SCALE) return;
      const c = clampPos(v.x + dx, v.y + dy, v.scale);
      commit({ scale: v.scale, x: c.x, y: c.y });
    }
  };

  const onDoubleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = stageRef.current?.getBoundingClientRect();
    if (!rect) return;
    const target = viewRef.current.scale > 1.2 ? MIN_SCALE : 3;
    zoomTo(target, e.clientX - rect.left, e.clientY - rect.top);
  };

  const b = baseSize();
  const zoomPercent = Math.round(view.scale * 100);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={caption ? `Zoomed view: ${caption}` : 'Zoomed image view'}
      className="fixed inset-0 z-[70] bg-black/95 backdrop-blur-md flex flex-col"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Top bar */}
      <div className="shrink-0 flex items-center justify-between gap-3 px-4 sm:px-6 py-3">
        <div className="min-w-0 text-center flex-1">
          {caption && (
            <h2 className="font-display text-sm sm:text-lg text-parchment-100 tracking-wide sm:tracking-widest uppercase leading-tight truncate">
              {caption}
            </h2>
          )}
          {subcaption && (
            <p className="font-editorial text-[11px] sm:text-xs text-parchment-300 italic truncate">
              {subcaption}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close zoomed view"
          className="shrink-0 h-11 w-11 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors flex items-center justify-center"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Stage */}
      <div
        ref={stageRef}
        data-zoom-stage="true"
        className={`relative flex-1 min-h-0 overflow-hidden select-none ${dragging ? 'cursor-grabbing' : view.scale > MIN_SCALE ? 'cursor-grab' : 'cursor-zoom-in'}`}
        style={{ touchAction: 'none' }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={(e) => endPointer(e.pointerId)}
        onPointerCancel={(e) => endPointer(e.pointerId)}
        onDoubleClick={onDoubleClick}
      >
        {natural.w === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-brass-400 animate-spin" />
          </div>
        )}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          draggable={false}
          onLoad={(e) => {
            const img = e.currentTarget;
            if (img.naturalWidth > 0) setNatural({ w: img.naturalWidth, h: img.naturalHeight });
          }}
          className={natural.w === 0 ? 'hidden' : 'absolute will-change-transform'}
          style={
            b
              ? {
                  left: b.baseX,
                  top: b.baseY,
                  width: b.baseW,
                  height: b.baseH,
                  transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})`,
                  transformOrigin: '0 0'
                }
              : undefined
          }
        />
      </div>

      {/* Bottom control bar */}
      <div className="shrink-0 flex items-center justify-center gap-2 px-4 py-3">
        <button
          type="button"
          onClick={() => zoomBy(1 / 1.5)}
          aria-label="Zoom out"
          className="h-11 w-11 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors flex items-center justify-center"
        >
          <Minus className="w-5 h-5" />
        </button>
        <div
          data-zoom-percent="true"
          aria-live="polite"
          className="min-w-[72px] text-center font-mono text-xs text-parchment-200 tabular-nums"
        >
          {zoomPercent}%
        </div>
        <button
          type="button"
          onClick={() => zoomBy(1.5)}
          aria-label="Zoom in"
          className="h-11 w-11 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors flex items-center justify-center"
        >
          <Plus className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={() => commit({ scale: MIN_SCALE, x: 0, y: 0 })}
          aria-label="Reset zoom"
          className="h-11 w-11 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors flex items-center justify-center"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
      </div>

      <p className="shrink-0 pb-4 text-center font-mono text-[10px] tracking-wider text-parchment-400/70 uppercase">
        Scroll to zoom • Drag to pan • Double-click to toggle
      </p>
    </div>
  );
}
