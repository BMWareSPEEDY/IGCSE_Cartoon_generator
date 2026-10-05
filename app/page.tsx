'use client';

import React, { useState, useEffect } from 'react';
import HeroScene from '@/components/3d/HeroScene';
import CreationWorkbench from '@/components/workbench/CreationWorkbench';
import ArchiveVault from '@/components/gallery/ArchiveVault';
import SettingsModal from '@/components/settings/SettingsModal';
import { AllegoryCreation, MetaphorVehicle, GenerationStage } from '@/lib/types';
import { initDatabase, saveAllegory, deleteAllegory, CURATED_ALLEGORIES } from '@/lib/db';
import { music } from '@/lib/music';
import {
  Settings,
  Volume2,
  VolumeX,
  ArrowDown,
  AlertTriangle,
  X
} from 'lucide-react';

export default function IronicInkStudio() {
  const [allegories, setAllegories] = useState<AllegoryCreation[]>(CURATED_ALLEGORIES);
  const [justCreatedId, setJustCreatedId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStage, setGenerationStage] = useState<GenerationStage>('concept');
  const [conceptTitle, setConceptTitle] = useState<string | null>(null);
  const [generationStartedAt, setGenerationStartedAt] = useState<number | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [musicPlaying, setMusicPlaying] = useState(false);

  // Initialize Dexie IndexedDB & ambient music listener
  useEffect(() => {
    setMusicPlaying(music.playing());
    const unsubscribe = music.subscribe((playing) => setMusicPlaying(playing));

    if (typeof window !== 'undefined') {
      // Start the ambient classical track on first user interaction anywhere
      // (browsers only allow audio after a user gesture)
      const handleFirstInteraction = () => {
        music.userInteracted();
        window.removeEventListener('click', handleFirstInteraction);
      };
      window.addEventListener('click', handleFirstInteraction);
    }

    async function loadData() {
      const stored = await initDatabase();
      if (stored && stored.length > 0) {
        setAllegories(stored);
      }
    }
    loadData();

    return () => {
      unsubscribe();
    };
  }, []);

  const handleToggleMusic = () => {
    music.toggle();
  };

  const handleEngrave = async ({
    topic,
    subtext,
    vehicle,
    cynicismLevel
  }: {
    topic: string;
    subtext: string;
    vehicle: MetaphorVehicle;
    cynicismLevel: number;
  }) => {
    setIsGenerating(true);
    setGenerationError(null);
    // Genuine milestones: the loader advances only when each call returns.
    setGenerationStage('concept');
    setConceptTitle(null);
    setGenerationStartedAt(Date.now());

    const readError = async (response: Response, fallback: string) => {
      const data = await response.json().catch(() => ({}));
      return typeof data?.error === 'string' && data.error.length > 0 ? data.error : fallback;
    };

    try {
      // Milestone 1/2 — draft the concept (fast).
      const conceptResponse = await fetch('/api/concept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, subtext, vehicle, cynicismLevel })
      });

      if (!conceptResponse.ok) {
        throw new Error(await readError(conceptResponse, 'Concept drafting failed. Please try again.'));
      }

      const conceptData = await conceptResponse.json();
      if (!conceptData.concept) {
        throw new Error('The AI engine returned an empty concept. Please try again.');
      }
      if (typeof conceptData.concept.title === 'string' && conceptData.concept.title.trim()) {
        setConceptTitle(conceptData.concept.title.trim());
      }

      // Milestone 2/2 — render the engraving (slow).
      setGenerationStage('render');
      const renderResponse = await fetch('/api/render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          subtext,
          vehicle,
          cynicismLevel,
          concept: conceptData.concept
        })
      });

      if (!renderResponse.ok) {
        throw new Error(await readError(renderResponse, 'Rendering failed. Please try again.'));
      }

      const renderData = await renderResponse.json();
      if (renderData.creation) {
        const newCreation: AllegoryCreation = renderData.creation;
        await saveAllegory(newCreation);
        setAllegories((prev) => [newCreation, ...prev]);
        setJustCreatedId(newCreation.id);

        // Smooth scroll to vault to view the new creation in the grid
        setTimeout(() => {
          const vaultEl = document.getElementById('archive-vault');
          if (vaultEl) {
            vaultEl.scrollIntoView({ behavior: 'smooth' });
          }
        }, 300);
      } else {
        throw new Error('The AI engine returned nothing usable. Please try again.');
      }
    } catch (err) {
      console.error('Error engraving allegory:', err);
      const message =
        err instanceof Error ? err.message : 'Generation failed. Please try again.';
      setGenerationError(message);
      // Bring the error into view above the workbench
      setTimeout(() => {
        const errEl = document.getElementById('generation-error');
        if (errEl) {
          errEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeleteAllegory = async (id: string) => {
    await deleteAllegory(id);
    const updated = await initDatabase();
    setAllegories(updated);
  };

  return (
    <main className="relative min-h-screen text-parchment-100 overflow-x-clip">
      {/* HERO SECTION WITH FULL-BLEED 3D CANVAS */}
      <section className="relative min-h-screen-safe flex flex-col items-center justify-center px-4 sm:px-6 pt-10 pb-10 sm:pt-16 sm:pb-12 text-center">
        {/* React Three Fiber 3D Background */}
        <HeroScene />

        {/* Hero Content */}
        <div className="relative z-10 w-full max-w-4xl mx-auto space-y-5 sm:space-y-6">
          <h1 className="font-ink font-normal text-parchment-50 drop-shadow-2xl text-[clamp(2.2rem,12vw,3.2rem)] sm:text-7xl lg:text-8xl tracking-[0.08em] leading-[1.15] break-words px-1">
            IRONIC INK
          </h1>

          <p className="font-serif italic text-xl sm:text-3xl lg:text-4xl text-brass-300 max-w-3xl mx-auto leading-tight drop-shadow-md text-balance">
            &ldquo;Turn Any Life Tension or Dilemma into an Editorial Allegory.&rdquo;
          </p>

          <p className="font-editorial text-sm sm:text-lg text-parchment-300/90 max-w-2xl mx-auto leading-relaxed text-pretty">
            Inspired by classic 1910s–1930s political cartoons like <em>Punch Magazine</em>. Transform office politics, personal burnout, modern screen addiction, or historical conflicts into biting visual metaphors.
          </p>

          <div className="pt-2 sm:pt-4 flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center justify-center gap-3 sm:gap-4">
            <a
              href="#workbench"
              className="w-full sm:w-auto px-6 sm:px-8 py-3.5 rounded-xl bg-brass-gradient text-archive-950 font-display font-bold text-sm sm:text-base tracking-widest uppercase shadow-brass-glow-lg hover:scale-105 transition-transform duration-200 flex items-center justify-center gap-2 border border-brass-200"
            >
              <span>START DRAWING</span>
              <ArrowDown className="w-4 h-4 animate-bounce" />
            </a>

            <a
              href="#archive-vault"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-archive-900/80 backdrop-blur-md text-parchment-200 border border-brass-500/40 hover:border-brass-400 font-mono text-xs uppercase tracking-wider transition-colors flex items-center justify-center"
            >
              View Vault ({allegories.length})
            </a>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="relative z-10 mt-10 sm:mt-14 text-center" aria-hidden="true">
          <div className="w-5 h-8 mx-auto rounded-full border border-brass-500/40 flex items-start justify-center p-1">
            <div className="w-1 h-2 rounded-full bg-brass-400 animate-bounce" />
          </div>
        </div>

      </section>

      {/* Archival divider bridging hero and guide */}
      <div aria-hidden="true" className="relative z-10 flex items-center justify-center gap-3 px-8 sm:px-12 max-w-4xl mx-auto -mb-2 sm:-mb-1">
        <span className="h-px flex-1 bg-gradient-to-r from-transparent to-brass-500/50" />
        <span className="w-1.5 h-1.5 rotate-45 bg-brass-500/70 shadow-brass-glow" />
        <span className="h-px flex-1 bg-gradient-to-l from-transparent to-brass-500/50" />
      </div>

      {/* EDITORIAL TECHNIQUE GUIDE */}
      <section className="relative max-w-4xl mx-auto mt-10 sm:mt-12 px-4 sm:px-6 z-10">
        <div className="rounded-2xl p-5 sm:p-8 bg-archive-900/70 border border-brass-500/30 backdrop-blur-md text-parchment-200">
          <h3 className="font-display text-xl sm:text-2xl text-parchment-50 font-bold mb-3">
            The Art of Editorial Satire
          </h3>
          <p className="font-editorial text-sm sm:text-base text-parchment-300 leading-relaxed mb-4 text-pretty">
            Classic editorial cartoons don&rsquo;t show literal scenes—they build physical metaphors. Whether you&rsquo;re satirizing corporate life, relationships, or world politics, great cartoons rely on three pillars:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-xs font-sans">
            <div className="p-3.5 rounded-xl bg-archive-950/80 border border-brass-500/20">
              <span className="font-mono text-brass-400 font-bold block mb-1">1. THE PHYSICAL METAPHOR</span>
              <span className="text-parchment-300 font-editorial text-sm">
                Turning abstract stress or systemic issues into tangible objects: cracked scales, leaking boats, or unfeeling clockwork.
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-archive-950/80 border border-brass-500/20">
              <span className="font-mono text-verdigris-300 font-bold block mb-1">2. ETCHED LABELS</span>
              <span className="text-parchment-300 font-editorial text-sm">
                Short physical labels carved onto key objects to pinpoint the hidden irony behind everyday facades.
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-archive-950/80 border border-brass-500/20">
              <span className="font-mono text-brass-300 font-bold block mb-1">3. THE IRONIC CAPTION</span>
              <span className="text-parchment-300 font-editorial text-sm">
                A sharp, 2–4 word title in ALL CAPS with a period that delivers the final satirical sting.
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* CREATION WORKBENCH */}
      <section id="workbench" className="relative py-10 sm:py-12 px-4 sm:px-6 scroll-mt-6">
        {generationError && (
          <div
            id="generation-error"
            role="alert"
            className="relative w-full max-w-4xl mx-auto z-10 mb-4 flex items-start gap-3 rounded-xl border border-red-500/50 bg-red-950/80 p-4 text-sm text-red-100 backdrop-blur-md"
          >
            <AlertTriangle className="w-5 h-5 shrink-0 text-red-400 mt-0.5" />
            <div className="min-w-0 flex-1">
              <p className="font-mono text-xs font-bold uppercase tracking-wider text-red-300">
                Engraving failed
              </p>
              <p className="font-editorial mt-0.5 break-words">{generationError}</p>
            </div>
            <button
              type="button"
              onClick={() => setGenerationError(null)}
              aria-label="Dismiss error"
              className="shrink-0 rounded-lg p-1.5 text-red-300 hover:bg-red-900/60 hover:text-red-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        <CreationWorkbench
          onEngrave={handleEngrave}
          isGenerating={isGenerating}
          generationStage={generationStage}
          conceptTitle={conceptTitle}
          generationStartedAt={generationStartedAt}
        />
      </section>

      {/* GALLERY & LOCAL ARCHIVE VAULT */}
      <ArchiveVault
        allegories={allegories}
        onDeleteAllegory={handleDeleteAllegory}
        highlightedId={justCreatedId}
      />

      {/* FOOTER */}
      <footer className="relative border-t border-brass-500/20 bg-archive-950/95 pt-10 pb-28 sm:pb-10 px-4 sm:px-6 text-center text-xs font-mono text-parchment-400 z-10">
        <div className="max-w-3xl mx-auto space-y-3">
          <div className="flex items-center justify-center gap-2">
            <span className="font-display text-sm tracking-widest text-parchment-200">
              IRONIC INK
            </span>
          </div>
          <p className="font-editorial text-sm text-parchment-400 italic">
            Classic pen &amp; ink editorial cartoons for any human dilemma.
          </p>
        </div>
      </footer>

      {/* FLOATING ACTION DOCK (BOTTOM-RIGHT) */}
      <div className="fixed z-40 flex items-center gap-2.5 bottom-safe right-4 sm:right-6">
        {/* Background Music Toggle Button */}
        <button
          type="button"
          onClick={handleToggleMusic}
          className="h-11 w-11 rounded-full bg-archive-900/95 border border-brass-500/40 text-brass-400 hover:text-brass-300 hover:border-brass-400 transition-all shadow-xl backdrop-blur-md flex items-center justify-center group"
          title={musicPlaying ? 'Pause background music (Bach — Goldberg Aria)' : 'Play background music (Bach — Goldberg Aria)'}
          aria-label={musicPlaying ? 'Pause background music' : 'Play background music'}
        >
          {musicPlaying ? (
            <Volume2 className="w-4 h-4 text-verdigris-300 group-hover:scale-110 transition-transform" />
          ) : (
            <VolumeX className="w-4 h-4 text-red-400" />
          )}
        </button>

        {/* API Settings Modal Trigger */}
        <button
          type="button"
          onClick={() => {
            setIsSettingsOpen(true);
          }}
          className="h-11 w-11 rounded-full bg-archive-900/95 border border-brass-500/40 text-brass-400 hover:text-brass-300 hover:border-brass-400 transition-all shadow-xl backdrop-blur-md flex items-center justify-center group"
          title="Studio Settings & API Keys"
          aria-label="Open studio settings"
        >
          <Settings className="w-4 h-4 text-brass-400 group-hover:rotate-45 transition-transform" />
        </button>
      </div>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </main>
  );
}
