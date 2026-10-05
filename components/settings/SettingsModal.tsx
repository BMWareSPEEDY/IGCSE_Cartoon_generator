'use client';

import React, { useState, useEffect } from 'react';
import { music, TRACK } from '@/lib/music';
import { ShieldCheck, X, Zap, Image as ImageIcon, AlertTriangle, Music, Play, Pause } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface EngineStatus {
  ok: boolean;
  codeVersion: string;
  keyConfigured: boolean;
}

// NOTE: The Gemini API key lives exclusively in the server-side `.env` file
// (GEMINI_API_KEY) and is never sent to, stored in, or readable by the client.
export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [status, setStatus] = useState<EngineStatus | null>(null);
  const [statusFailed, setStatusFailed] = useState(false);
  const [musicPlaying, setMusicPlaying] = useState(false);

  // Ping the running server every time the modal opens — this tells us whether
  // the server is reachable, which code version it runs, and whether it loaded
  // the API key at startup. Costs no quota.
  useEffect(() => {
    if (!isOpen) return;
    setStatus(null);
    setStatusFailed(false);
    setMusicPlaying(music.playing());
    const unsubscribe = music.subscribe((playing) => setMusicPlaying(playing));
    fetch('/api/status')
      .then((r) => {
        if (!r.ok) throw new Error('status failed');
        return r.json();
      })
      .then((data) => setStatus(data))
      .catch(() => setStatusFailed(true));
    return () => {
      unsubscribe();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-archive-950/85 backdrop-blur-md flex items-start sm:items-center justify-center p-4 py-8 sm:py-4 overflow-y-auto overscroll-contain"
      onClick={onClose}
    >
      <div
        className="relative max-w-lg w-full my-auto rounded-2xl bg-archive-900 border-2 border-brass-500/50 p-5 sm:p-8 text-parchment-100 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Corner Rivet Accents */}
        <div className="absolute top-2 left-2 w-2.5 h-2.5 rounded-full bg-brass-400 border border-archive-950" />
        <div className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-brass-400 border border-archive-950" />
        <div className="absolute bottom-2 left-2 w-2.5 h-2.5 rounded-full bg-brass-400 border border-archive-950" />
        <div className="absolute bottom-2 right-2 w-2.5 h-2.5 rounded-full bg-brass-400 border border-archive-950" />

        <div className="flex items-start justify-between gap-3 border-b border-brass-500/20 pb-4 mb-6">
          <div className="flex items-center gap-2 min-w-0">
            <Zap className="w-5 h-5 shrink-0 text-brass-400" />
            <h3 className="font-display text-lg sm:text-xl text-parchment-50 font-bold tracking-wide leading-tight">
              Studio Engine
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close settings"
            className="shrink-0 text-parchment-400 hover:text-parchment-100 p-2 -mr-2 -mt-2 rounded-lg hover:bg-archive-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Live engine status from the RUNNING server */}
          {statusFailed ? (
            <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-500/40 text-xs text-red-100 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div className="min-w-0">
                <span className="font-mono text-red-300 font-bold block mb-0.5">
                  ENGINE UNREACHABLE
                </span>
                <span className="text-pretty">
                  The app cannot reach its own server. You are likely viewing a stale build —
                  stop the server, run <span className="font-mono">npm run build</span>, and start it again.
                </span>
              </div>
            </div>
          ) : status && !status.keyConfigured ? (
            <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-500/40 text-xs text-red-100 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div className="min-w-0">
                <span className="font-mono text-red-300 font-bold block mb-0.5">
                  API KEY NOT LOADED
                </span>
                <span className="text-pretty">
                  The running server has no Gemini key. Put GEMINI_API_KEY in .env, then fully
                  stop and restart the server (it only reads .env at startup).
                </span>
              </div>
            </div>
          ) : null}

          <div className="p-3.5 sm:p-4 rounded-xl bg-archive-950/60 border border-verdigris-500/30 text-xs text-parchment-200 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-verdigris-400 shrink-0 mt-0.5" />
            <div className="min-w-0">
              <span className="font-mono text-verdigris-300 font-bold block mb-0.5">
                GEMINI AI ENGINE ACTIVE
              </span>
              <span className="text-pretty">
                Every engraving runs a two-step pipeline: a reasoning model drafts the allegory
                (title, quote, caption, metaphors, thesis, image prompt), then an image model
                renders the cartoon. Your API key stays on the server and is never exposed
                to the browser.
              </span>
              <span className="font-mono text-[10px] text-parchment-400/70 block mt-1.5">
                {status
                  ? `Server: reachable • key loaded • build ${status.codeVersion}`
                  : statusFailed
                    ? 'Server: unreachable'
                    : 'Server: checking…'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-archive-950/60 border border-brass-500/25">
              <span className="flex items-center gap-1.5 font-mono text-brass-300 font-bold mb-1">
                <Zap className="w-3.5 h-3.5 shrink-0" />
                STEP 1 · CONCEPT
              </span>
              <span className="font-editorial text-parchment-300 text-sm">
                Gemini Flash reasons over your form and returns the full archive package as
                structured data.
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-archive-950/60 border border-brass-500/25">
              <span className="flex items-center gap-1.5 font-mono text-brass-300 font-bold mb-1">
                <ImageIcon className="w-3.5 h-3.5 shrink-0" />
                STEP 2 · RENDER
              </span>
              <span className="font-editorial text-parchment-300 text-sm">
                Nano Banana renders the concept as a 4:3 monochrome engraving, saved straight
                to your local vault.
              </span>
            </div>
          </div>

          {/* Ambient music credit (public-domain recording, free to use) */}
          <div className="p-3.5 sm:p-4 rounded-xl bg-archive-950/60 border border-brass-500/25 text-xs text-parchment-200 flex items-start gap-3">
            <Music className="w-5 h-5 text-brass-400 shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1">
              <span className="font-mono text-brass-300 font-bold block mb-0.5">
                AMBIENT MUSIC
              </span>
              <span className="font-editorial text-parchment-200 text-sm block">
                {TRACK.title}
              </span>
              <span className="font-editorial text-parchment-300 text-sm italic block">
                {TRACK.artist}
              </span>
              <span className="text-[11px] font-editorial text-parchment-300 block mt-1 text-pretty">
                {TRACK.license} — Open Goldberg Variations Project.{' '}
                <a
                  href={TRACK.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-brass-300 hover:text-brass-200 underline underline-offset-2"
                >
                  Source (Internet Archive)
                </a>
              </span>
            </div>
            <button
              type="button"
              onClick={() => music.toggle()}
              aria-label={musicPlaying ? 'Pause background music' : 'Play background music'}
              className="shrink-0 h-11 w-11 rounded-full bg-archive-800 border border-brass-500/40 hover:border-brass-400 text-brass-300 transition-colors flex items-center justify-center"
            >
              {musicPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
            </button>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-lg bg-brass-gradient text-archive-950 font-display font-bold text-xs uppercase tracking-wider shadow-md hover:brightness-105"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
