'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { AllegoryCreation } from '@/lib/types';
import ImageZoomModal from './ImageZoomModal';
import confetti from 'canvas-confetti';
import {
  Download,
  Copy,
  Check,
  BookmarkCheck,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Maximize2
} from 'lucide-react';

interface MetaphorDeconstructorProps {
  creation: AllegoryCreation;
  onSaveToArchive?: (creation: AllegoryCreation) => void;
  isSaved?: boolean;
}

export default function MetaphorDeconstructor({
  creation,
  onSaveToArchive,
  isSaved = false
}: MetaphorDeconstructorProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isZoomModalOpen, setIsZoomModalOpen] = useState(false);

  const handleCopyBreakdown = async () => {
    const text = `EDITORIAL CARTOON: "${creation.caption}"
Topic: ${creation.topic}
${creation.subtext ? `Subtext: ${creation.subtext}` : ''}

CENTRAL METAPHOR:
${creation.centralMetaphor}

HISTORICAL / PHILOSOPHICAL THESIS:
${creation.historicalThesis}

SYMBOLIC BREAKDOWN:
${creation.metaphorBreakdown.map((b, i) => `${i + 1}. ${b}`).join('\n')}

ETCHED LABELS IN SCENE:
${creation.etchedLabels.map((l) => `• [${l.label}]: ${l.symbolism} (${l.targetObject})`).join('\n')}`;

    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSave = () => {
    confetti({
      particleCount: 45,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#d4af37', '#c29b38', '#3aa890', '#f4eee2']
    });
    if (onSaveToArchive) {
      onSaveToArchive(creation);
    }
  };

  // Archival Print Compositor: Stamping high-contrast artwork, matting, caption, and footer to canvas for download
  const handleDownloadArchivalPrint = async () => {
    setIsExporting(true);

    try {
      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      img.src = creation.imageUrl;

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const printWidth = 1600;
      const printHeight = 1400;
      canvas.width = printWidth;
      canvas.height = printHeight;

      // 1. Archival Parchment Background
      ctx.fillStyle = '#f4eee2';
      ctx.fillRect(0, 0, printWidth, printHeight);

      // Subtle vintage paper grain simulation
      ctx.fillStyle = 'rgba(120, 100, 60, 0.03)';
      for (let i = 0; i < 3500; i++) {
        ctx.fillRect(Math.random() * printWidth, Math.random() * printHeight, 2, 2);
      }

      // 2. Double-ruled archival border
      ctx.strokeStyle = '#221c14';
      ctx.lineWidth = 4;
      ctx.strokeRect(40, 40, printWidth - 80, printHeight - 80);

      ctx.lineWidth = 1.5;
      ctx.strokeRect(52, 52, printWidth - 104, printHeight - 104);

      // 3. Header Stamp
      ctx.fillStyle = '#221c14';
      ctx.font = 'bold 24px "Cinzel", "Playfair Display", Georgia, serif';
      ctx.textAlign = 'center';
      ctx.fillText('IRONIC INK • EDITORIAL SATIRE STUDIO', printWidth / 2, 95);

      // 4. Centered Artwork with matte shadow
      const artX = 140;
      const artY = 145;
      const artW = printWidth - 280;
      const artH = printHeight - 365;

      ctx.strokeStyle = '#221c14';
      ctx.lineWidth = 2;
      ctx.strokeRect(artX - 2, artY - 2, artW + 4, artH + 4);
      ctx.drawImage(img, artX, artY, artW, artH);

      // 5. Ironic All-Caps Caption
      ctx.fillStyle = '#111111';
      ctx.font = 'bold 44px "Cinzel", "Playfair Display", Georgia, serif';
      ctx.textAlign = 'center';
      ctx.fillText(creation.caption, printWidth / 2, printHeight - 135);

      // 6. Topic Subtitle
      ctx.font = 'italic 20px "EB Garamond", Georgia, serif';
      ctx.fillStyle = '#443725';
      ctx.fillText(creation.topic, printWidth / 2, printHeight - 95);

      // 7. Footer
      ctx.font = '12px "Courier Prime", Courier, monospace';
      ctx.fillStyle = '#7a6649';
      ctx.fillText('CLASSIC 1910s–1930s EDITORIAL WOODCUT TRADITION', printWidth / 2, printHeight - 65);

      // Download
      const link = document.createElement('a');
      link.download = `IRONIC_INK_${creation.caption.replace(/[^a-zA-Z0-9]/g, '_')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Error generating archival print:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="relative w-full max-w-5xl mx-auto my-8 z-10">
      {/* Museum Matte Archival Frame */}
      <div className="relative rounded-3xl p-3 sm:p-6 bg-[#e8ded0] border-2 border-brass-600/60 shadow-archival-matte">
        {/* Double-ruled inner matting line */}
        <div className="relative rounded-2xl p-4 sm:p-8 bg-[#f5efe1] border border-[#332b20]/60 text-ink-pure">

          {/* Clean, Raw, Pristine Image Display without intrusive text overlays */}
          <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden border-2 border-[#221c14] bg-[#eae2d3] shadow-md group">
            <Image
              src={creation.imageUrl}
              alt={creation.caption}
              fill
              className="object-cover filter contrast-[1.06] brightness-[0.99]"
              priority
            />

            {/* Click to Zoom Overlay Button */}
            <button
              type="button"
              onClick={() => {
                setIsZoomModalOpen(true);
              }}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2.5 rounded-lg bg-archive-950/85 text-parchment-100 hover:bg-archive-900 border border-brass-400/50 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 focus-visible:opacity-100 transition-opacity flex items-center gap-1.5 text-[10px] sm:text-xs font-mono shadow-xl"
              title="View Raw Full Resolution"
            >
              <Maximize2 className="w-4 h-4 shrink-0 text-brass-300" />
              <span>FULL RES</span>
              <span className="hidden sm:inline">OLUTION</span>
            </button>
          </div>

          {/* Primary Editorial Headline & Subject */}
          <div className="text-center my-6">
            <h1 className="font-display text-2xl sm:text-4xl lg:text-5xl font-bold tracking-wide sm:tracking-widest text-[#151310] uppercase mb-2 leading-tight">
              {creation.caption}
            </h1>
            <p className="font-editorial text-base sm:text-xl text-[#3b3123] italic max-w-2xl mx-auto text-pretty">
              &ldquo;{creation.quote || creation.topic}&rdquo;
            </p>
          </div>

          {/* Etched Labels Key / Legend (Cleanly below image) */}
          {creation.etchedLabels && creation.etchedLabels.length > 0 && (
            <div className="mb-6 p-4 rounded-xl bg-[#eee4d2] border border-[#332b20]/25">
              <div className="text-xs font-mono font-bold uppercase tracking-wider text-brass-900 mb-2.5">
                Etched Symbolic Labels in Scene:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {creation.etchedLabels.map((item, idx) => (
                  <div key={idx} className="bg-[#f5efe1] p-2.5 rounded-lg border border-[#332b20]/20">
                    <span className="font-mono text-xs font-bold text-brass-800 uppercase block">
                      [{item.label}]
                    </span>
                    <span className="font-editorial text-xs text-[#2b2216] block mt-0.5">
                      {item.symbolism}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center justify-between gap-3 border-t border-b border-[#332b20]/25 py-4 mb-6">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <button
                type="button"
                onClick={handleDownloadArchivalPrint}
                disabled={isExporting}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-3 sm:py-2.5 rounded-lg bg-archive-900 text-parchment-100 hover:bg-archive-950 border border-brass-500/50 font-mono text-[11px] sm:text-xs font-semibold tracking-wider transition-all shadow-sm"
              >
                <Download className="w-3.5 h-3.5 shrink-0 text-brass-400" />
                <span>{isExporting ? 'PREPARING PRINT...' : 'DOWNLOAD PRINT (PNG)'}</span>
              </button>

              <button
                type="button"
                onClick={handleCopyBreakdown}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-3 sm:py-2.5 rounded-lg bg-[#eee4d2] text-archive-950 hover:bg-[#e4d7bf] border border-[#332b20]/30 font-mono text-[11px] sm:text-xs font-semibold tracking-wider transition-all"
              >
                {copied ? <Check className="w-3.5 h-3.5 shrink-0 text-verdigris-600" /> : <Copy className="w-3.5 h-3.5 shrink-0 text-brass-700" />}
                <span>{copied ? 'COPIED TO CLIPBOARD' : 'COPY BREAKDOWN'}</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              {onSaveToArchive && (
                <button
                  type="button"
                  onClick={handleSave}
                  className={`w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-3 sm:py-2.5 rounded-lg font-mono text-[11px] sm:text-xs font-semibold tracking-wider transition-all ${
                    isSaved
                      ? 'bg-verdigris-600 text-parchment-50 border border-verdigris-400 shadow-sm'
                      : 'bg-brass-gradient text-archive-950 hover:brightness-105 border border-brass-600'
                  }`}
                >
                  <BookmarkCheck className="w-3.5 h-3.5 shrink-0" />
                  <span>{isSaved ? 'SAVED TO LOCAL VAULT' : 'SAVE TO VAULT'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Expandable "Deconstruct the Meaning" Drawer */}
          <div className="rounded-xl border border-[#332b20]/30 bg-[#f9f5ed] overflow-hidden">
            <button
              type="button"
              onClick={() => {
                setIsDrawerOpen(!isDrawerOpen);
              }}
              className="w-full px-4 sm:px-5 py-4 flex items-center justify-between gap-3 text-left font-display text-sm sm:text-base font-bold text-archive-950 hover:bg-[#efe6d3] transition-colors"
            >
              <span className="flex items-center gap-2 min-w-0">
                <BookOpen className="w-4 h-4 shrink-0 text-brass-700" />
                <span>DECONSTRUCT THE ALLEGORICAL MEANING</span>
              </span>
              {isDrawerOpen ? <ChevronUp className="w-4 h-4 shrink-0 text-brass-700" /> : <ChevronDown className="w-4 h-4 shrink-0 text-brass-700" />}
            </button>

            {isDrawerOpen && (
              <div className="p-4 sm:p-7 border-t border-[#332b20]/20 space-y-6 text-sm font-sans">
                {/* Central Metaphor */}
                <div>
                  <h4 className="font-mono text-xs text-brass-800 uppercase tracking-widest font-bold mb-1">
                    The Central Metaphor &amp; Spatial Tension
                  </h4>
                  <p className="font-editorial text-base text-[#251f15] leading-relaxed">
                    {creation.centralMetaphor}
                  </p>
                </div>

                {/* Symbolic Breakdown */}
                <div>
                  <h4 className="font-mono text-xs text-brass-800 uppercase tracking-widest font-bold mb-2">
                    Symbolic Anatomy
                  </h4>
                  <ul className="space-y-2">
                    {creation.metaphorBreakdown.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 font-editorial text-base text-[#2e261a]">
                        <span className="font-mono text-brass-700 font-bold shrink-0 mt-0.5">
                          {idx + 1}.
                        </span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Core Thesis */}
                <div className="p-4 rounded-lg bg-[#eee3ce] border border-[#332b20]/20">
                  <h4 className="font-mono text-xs text-brass-900 uppercase tracking-widest font-bold mb-1">
                    The Core Critical Takeaway
                  </h4>
                  <p className="font-editorial text-base font-semibold text-[#1f1911]">
                    {creation.historicalThesis}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Full-Screen Zoomable Focus Mode */}
      {isZoomModalOpen && (
        <ImageZoomModal
          src={creation.imageUrl}
          alt={creation.caption}
          caption={creation.caption}
          subcaption={creation.quote || creation.topic}
          onClose={() => setIsZoomModalOpen(false)}
        />
      )}
    </div>
  );
}
