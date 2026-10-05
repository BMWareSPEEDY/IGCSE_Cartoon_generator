'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { AllegoryCreation } from '@/lib/types';
import ImageZoomModal from '@/components/viewer/ImageZoomModal';
import {
  Tag,
  BookOpen,
  Trash2,
  Search,
  Filter,
  Download,
  Sparkles,
  Maximize2,
  X
} from 'lucide-react';

interface ArchiveVaultProps {
  allegories: AllegoryCreation[];
  onDeleteAllegory?: (id: string) => void;
  highlightedId?: string | null;
}

export default function ArchiveVault({
  allegories,
  onDeleteAllegory,
  highlightedId
}: ArchiveVaultProps) {
  const [filter, setFilter] = useState<'all' | 'curated' | 'user'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPreview, setSelectedPreview] = useState<AllegoryCreation | null>(null);
  const [zoomOpen, setZoomOpen] = useState(false);

  const handleCloseModal = () => {
    setZoomOpen(false);
    setSelectedPreview(null);
  };

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (selectedPreview) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedPreview]);

  const handleDownloadImage = (item: AllegoryCreation) => {
    const link = document.createElement('a');
    link.href = item.imageUrl;
    link.download = `IRONIC_INK_${item.caption.replace(/[^a-zA-Z0-9]/g, '_')}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredAllegories = allegories.filter((item) => {
    if (filter === 'curated' && !item.isCurated) return false;
    if (filter === 'user' && item.isCurated) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.caption.toLowerCase().includes(q) ||
        item.topic.toLowerCase().includes(q) ||
        item.centralMetaphor.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <section id="archive-vault" className="relative w-full max-w-6xl mx-auto my-12 sm:my-16 px-4 sm:px-6 z-10 scroll-mt-6">
      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
        <h2 className="font-display text-2xl sm:text-4xl text-parchment-50 font-bold tracking-wide">
          The Cartoon Archive
        </h2>
        <p className="font-editorial text-parchment-300 text-sm sm:text-lg mt-2 italic text-pretty">
          Classic woodcuts and user editorial creations, preserved in pure intaglio monochrome.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center sm:justify-between gap-3 p-3 sm:p-4 rounded-2xl bg-archive-900/90 border border-brass-500/30 backdrop-blur-md mb-8">
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="w-4 h-4 text-brass-400 mr-1 shrink-0" />
          <button
            type="button"
            onClick={() => {
              setFilter('all');
            }}
            className={`px-3 py-2 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-mono tracking-wider uppercase transition-all ${
              filter === 'all'
                ? 'bg-brass-gradient text-archive-950 font-bold shadow-sm'
                : 'text-parchment-300 hover:text-parchment-100 hover:bg-archive-800'
            }`}
          >
            All Works ({allegories.length})
          </button>
          <button
            type="button"
            onClick={() => {
              setFilter('curated');
            }}
            className={`px-3 py-2 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-mono tracking-wider uppercase transition-all ${
              filter === 'curated'
                ? 'bg-brass-gradient text-archive-950 font-bold shadow-sm'
                : 'text-parchment-300 hover:text-parchment-100 hover:bg-archive-800'
            }`}
          >
            Curated Classics ({allegories.filter((a) => a.isCurated).length})
          </button>
          <button
            type="button"
            onClick={() => {
              setFilter('user');
            }}
            className={`px-3 py-2 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-mono tracking-wider uppercase transition-all ${
              filter === 'user'
                ? 'bg-brass-gradient text-archive-950 font-bold shadow-sm'
                : 'text-parchment-300 hover:text-parchment-100 hover:bg-archive-800'
            }`}
          >
            Your Cartoons ({allegories.filter((a) => !a.isCurated).length})
          </button>
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-auto sm:min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-brass-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search cartoons..."
            aria-label="Search cartoons"
            className="w-full pl-8 pr-3 py-2.5 sm:py-1.5 rounded-lg bg-archive-950 border border-brass-500/30 text-parchment-100 placeholder-parchment-400/40 text-base sm:text-xs font-mono focus:border-brass-400 outline-none"
          />
        </div>
      </div>

      {/* Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-8">
        {filteredAllegories.map((allegory) => {
          const isHighlighted = allegory.id === highlightedId;
          return (
            <div
              key={allegory.id}
              className={`group relative rounded-2xl p-3 bg-gradient-to-b from-[#e8ded0] to-[#dfd3c0] border transition-all duration-300 ${
                isHighlighted
                  ? 'border-brass-400 ring-2 ring-brass-400 shadow-brass-glow scale-[1.01]'
                  : 'border-brass-600/50 shadow-md hover:shadow-xl'
              }`}
            >
              {isHighlighted && (
                <div className="absolute -top-3 right-4 z-20 flex items-center gap-1 px-3 py-1 rounded-full bg-brass-400 text-archive-950 font-mono text-[10px] font-bold shadow-md uppercase">
                  <Sparkles className="w-3 h-3 text-archive-950 animate-spin" style={{ animationDuration: '4s' }} />
                  <span>NEWLY ENGRAVED</span>
                </div>
              )}

              <div className="relative rounded-xl p-4 bg-[#f5efe1] border border-[#382f22]/30 flex flex-col justify-between h-full text-ink-pure">

                {/* Artwork Thumbnail */}
                <div
                  className="relative aspect-[4/3] rounded-lg overflow-hidden border border-[#221c14] bg-[#e3d8c5] cursor-pointer"
                  onClick={() => {
                    setSelectedPreview(allegory);
                  }}
                >
                  <Image
                    src={allegory.imageUrl}
                    alt={allegory.caption}
                    fill
                    className="object-cover filter contrast-[1.05] group-hover:scale-[1.03] transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-archive-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                    <span className="px-3 py-1.5 rounded-lg bg-archive-950/90 text-parchment-100 font-mono text-xs border border-brass-400 flex items-center gap-1.5 shadow-lg">
                      <BookOpen className="w-3.5 h-3.5 text-brass-300" />
                      <span>VIEW CARTOON</span>
                    </span>
                  </div>
                </div>

                {/* Card Caption & Thesis */}
                <div className="mt-4 mb-2 flex-grow">
                  <h3 className="font-display text-xl sm:text-2xl font-bold tracking-wider text-[#1a140d] uppercase">
                    {allegory.caption}
                  </h3>
                  <p className="font-editorial text-sm font-semibold text-archive-800 italic mt-0.5 line-clamp-1">
                    {allegory.topic}
                  </p>
                  <p className="font-editorial text-xs text-[#3d3223] mt-2 line-clamp-2 leading-relaxed">
                    {allegory.centralMetaphor}
                  </p>
                </div>

                {/* Etched Labels */}
                {allegory.etchedLabels && allegory.etchedLabels.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 my-2">
                    {allegory.etchedLabels.map((l, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-[#e8ded0] border border-[#382f22]/30 text-archive-900"
                      >
                        <Tag className="w-2.5 h-2.5 text-brass-700" />
                        <span>{l.label}</span>
                      </span>
                    ))}
                  </div>
                )}

                {/* Card Footer Actions */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#382f22]/20 pt-3 mt-2 text-[11px] sm:text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPreview(allegory);
                    }}
                    className="flex items-center gap-1.5 py-2 -my-2 px-1 -ml-1 text-archive-950 font-serif font-bold hover:text-brass-700 transition-colors"
                  >
                    <BookOpen className="w-3.5 h-3.5 shrink-0" />
                    <span>View Cartoon</span>
                  </button>

                  {!allegory.isCurated && onDeleteAllegory && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteAllegory(allegory.id);
                      }}
                      className="text-red-700 hover:text-red-900 transition-colors p-2 -mr-2"
                      title="Remove from vault"
                      aria-label={`Remove ${allegory.caption} from vault`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredAllegories.length === 0 && (
        <div className="text-center py-16 p-8 rounded-2xl bg-archive-900/60 border border-brass-500/20 text-parchment-300">
          <h4 className="font-display text-xl text-parchment-100">No Cartoons Found</h4>
          <p className="font-editorial text-sm mt-1">
            Try adjusting your search criteria or engrave a new cartoon above.
          </p>
        </div>
      )}

      {/* Lightbox Modal (Clean, Non-Clipping, Fully Scrollable) */}
      {selectedPreview && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md p-3 sm:p-6 overflow-y-auto overscroll-contain flex items-center justify-center"
          onClick={handleCloseModal}
        >
          <div
            className="relative max-w-3xl w-full my-auto max-h-[92vh] sm:max-h-[90vh] flex flex-col bg-[#f4eee2] rounded-2xl border-2 border-brass-600 text-ink-pure shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="shrink-0 flex items-start justify-between gap-3 border-b border-[#382f22]/20 px-4 sm:px-6 py-3 sm:py-4 bg-[#eee4d2]">
              <h3 className="font-display text-base sm:text-lg font-bold uppercase text-[#1a140d] leading-tight min-w-0">
                {selectedPreview.caption}
              </h3>
              <button
                type="button"
                onClick={handleCloseModal}
                aria-label="Close preview"
                className="shrink-0 p-2 -mr-2 -mt-1 rounded-lg hover:bg-black/10 text-archive-950 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="p-4 sm:p-6 overflow-y-auto overscroll-contain space-y-5">
              <div
                className="relative aspect-[4/3] rounded-lg overflow-hidden border-2 border-[#221c14] cursor-zoom-in group/zoom"
                onClick={() => {
                  setZoomOpen(true);
                }}
                title="Click to zoom"
              >
                <Image
                  src={selectedPreview.imageUrl}
                  alt={selectedPreview.caption}
                  fill
                  className="object-cover"
                />
                <span className="absolute bottom-3 right-3 flex items-center gap-1.5 px-3 py-2 rounded-lg bg-archive-950/85 text-parchment-100 border border-brass-400/50 font-mono text-[10px] sm:text-xs shadow-xl sm:opacity-0 sm:group-hover/zoom:opacity-100 transition-opacity">
                  <Maximize2 className="w-3.5 h-3.5 shrink-0 text-brass-300" />
                  <span>ZOOM</span>
                </span>
              </div>

              <div>
                <span className="font-editorial text-base text-archive-800 italic block text-pretty">
                  &ldquo;{selectedPreview.quote || selectedPreview.topic}&rdquo;
                </span>
              </div>

              <div className="space-y-4 text-xs sm:text-sm font-sans bg-[#eae0cf] p-3.5 sm:p-4 rounded-xl border border-[#382f22]/25">
                <div>
                  <span className="font-mono text-xs font-bold text-brass-800 uppercase block mb-1">
                    Central Metaphor:
                  </span>
                  <p className="font-editorial text-base text-[#241c12]">
                    {selectedPreview.centralMetaphor}
                  </p>
                </div>

                <div>
                  <span className="font-mono text-xs font-bold text-brass-800 uppercase block mb-1">
                    Symbolic Breakdown:
                  </span>
                  <ul className="space-y-1.5 font-editorial text-xs sm:text-sm text-[#2b2216]">
                    {selectedPreview.metaphorBreakdown.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="font-mono text-brass-800 font-bold shrink-0">{idx + 1}.</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <span className="font-mono text-xs font-bold text-brass-800 uppercase block mb-1">
                    Core Argument:
                  </span>
                  <p className="font-editorial text-sm font-semibold text-[#1f1911]">
                    {selectedPreview.historicalThesis}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="shrink-0 flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-3.5 border-t border-[#382f22]/20 bg-[#eee4d2]">
              <button
                type="button"
                onClick={handleCloseModal}
                className="w-full sm:w-auto px-4 py-2.5 rounded-lg text-xs font-mono text-archive-800 hover:bg-black/5 transition-colors"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => handleDownloadImage(selectedPreview)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-brass-gradient text-archive-950 font-display font-bold text-xs uppercase tracking-wider shadow-sm hover:brightness-105 flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5 shrink-0" />
                <span>Download Image</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Focused zoom mode (stacked above the lightbox) */}
      {zoomOpen && selectedPreview && (
        <ImageZoomModal
          src={selectedPreview.imageUrl}
          alt={selectedPreview.caption}
          caption={selectedPreview.caption}
          subcaption={selectedPreview.quote || selectedPreview.topic}
          onClose={() => setZoomOpen(false)}
        />
      )}
    </section>
  );
}
