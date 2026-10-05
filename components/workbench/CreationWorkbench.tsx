'use client';

import React, { useState } from 'react';
import { MetaphorVehicle, PresetTopic, GenerationStage } from '@/lib/types';
import InkSpreadingLoader from './InkSpreadingLoader';
import {
  Sparkles,
  Scale,
  Mountain,
  Cog,
  Theater,
  Flame,
  Dices,
  Ship,
  Wand2,
  Lightbulb
} from 'lucide-react';

interface CreationWorkbenchProps {
  onEngrave: (params: {
    topic: string;
    subtext: string;
    vehicle: MetaphorVehicle;
    cynicismLevel: number;
  }) => void;
  isGenerating: boolean;
  generationStage: GenerationStage;
  conceptTitle: string | null;
  generationStartedAt: number | null;
}

const METAPHOR_VEHICLES: {
  id: MetaphorVehicle;
  label: string;
  icon: React.ElementType;
  description: string;
}[] = [
  {
    id: 'auto',
    label: 'Auto-Select Metaphor',
    icon: Wand2,
    description: 'Chooses the most poignant spatial metaphor for your topic'
  },
  {
    id: 'teetering_scale',
    label: 'Teetering Scale',
    icon: Scale,
    description: 'Imbalanced weights, heavy burdens, and precarious compromises'
  },
  {
    id: 'precipice_cliff',
    label: 'Precipice & Chasm',
    icon: Mountain,
    description: 'Blind momentum galloping towards a steep drop'
  },
  {
    id: 'fragile_clockwork',
    label: 'Unstoppable Machine',
    icon: Cog,
    description: 'Rigid gears, automated processes, and inescapable momentum'
  },
  {
    id: 'monolithic_beast',
    label: 'The Grinding Engine',
    icon: Flame,
    description: 'Colossal flywheels and institutions consuming human energy'
  },
  {
    id: 'puppet_master',
    label: 'Tangled Marionette',
    icon: Theater,
    description: 'Strings pulled by algorithms, superiors, or hidden interests'
  },
  {
    id: 'rigged_game',
    label: 'The Stacked Table',
    icon: Dices,
    description: 'Loaded dice, marked cards, and rules rewritten mid-game'
  },
  {
    id: 'sinking_galleon',
    label: 'Leaking Ship',
    icon: Ship,
    description: 'Arguing over deck chairs while the hold fills with water'
  }
];

const PRESETS: PresetTopic[] = [
  {
    title: 'Corporate Burnout & Hustle Culture',
    topic: 'Modern Corporate Hustle Culture and Endless Zoom Calls',
    subtext: 'Trading youth and sanity for vanity titles and pointless slides.',
    vehicle: 'monolithic_beast',
    cynicismLevel: 88,
    era: 'Modern Life'
  },
  {
    title: 'Smartphone Addiction & Doomscrolling',
    topic: 'Algorithmic Feeds & The Vanishing Attention Span',
    subtext: 'A glowing pocket rectangle quietly hypnotizing humanity into passive spectators.',
    vehicle: 'puppet_master',
    cynicismLevel: 85,
    era: 'Everyday Reality'
  },
  {
    title: 'Student Procrastination vs Deadlines',
    topic: 'Midnight Cramming & Self-Sabotaging Procrastination',
    subtext: 'Polishing desk ornaments while the exam tsunami rolls onto shore.',
    vehicle: 'teetering_scale',
    cynicismLevel: 75,
    era: 'Student Life'
  },
  {
    title: 'Treaty of Versailles (1919)',
    topic: 'The Treaty of Versailles & War Guilt Clause 231',
    subtext: 'Crippling Germany with impossible reparations while preaching lasting peace.',
    vehicle: 'teetering_scale',
    cynicismLevel: 85,
    era: 'Classic History'
  },
  {
    title: 'Wall Street Crash (1929)',
    topic: 'Speculative Margin Buying & Financial Hubris',
    subtext: 'Blind confidence galloping off a cliff into economic reality.',
    vehicle: 'precipice_cliff',
    cynicismLevel: 90,
    era: 'Classic History'
  }
];

export default function CreationWorkbench({
  onEngrave,
  isGenerating,
  generationStage,
  conceptTitle,
  generationStartedAt
}: CreationWorkbenchProps) {
  const [topic, setTopic] = useState('');
  const [subtext, setSubtext] = useState('');
  const [vehicle, setVehicle] = useState<MetaphorVehicle>('auto');
  const [cynicismLevel, setCynicismLevel] = useState<number>(80);

  const handleApplyPreset = (preset: PresetTopic) => {
    setTopic(preset.topic);
    setSubtext(preset.subtext);
    setVehicle(preset.vehicle);
    setCynicismLevel(preset.cynicismLevel);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim() || isGenerating) return;
    onEngrave({ topic, subtext, vehicle, cynicismLevel });
  };

  if (isGenerating) {
    return (
      <div className="relative w-full max-w-4xl mx-auto z-10">
        <InkSpreadingLoader
          topic={topic || 'Editorial Allegory'}
          stage={generationStage}
          conceptTitle={conceptTitle}
          startedAt={generationStartedAt ?? Date.now()}
        />
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-4xl mx-auto z-10">
      {/* Workbench Card */}
      <div className="relative rounded-3xl p-1 bg-gradient-to-b from-brass-500/40 via-brass-600/20 to-brass-800/40 shadow-2xl">
        <div className="relative rounded-[22px] bg-archive-900/95 backdrop-blur-xl border border-brass-500/30 p-4 sm:p-6 md:p-10 text-parchment-100">

          {/* Workbench Header */}
          <div className="border-b border-brass-500/20 pb-5 mb-6 sm:mb-8">
            <h2 className="font-display text-xl sm:text-3xl text-parchment-50 font-bold tracking-wide">
              Create an Allegorical Cartoon
            </h2>
            <p className="font-editorial text-xs sm:text-base text-parchment-300 mt-1 italic text-pretty">
              Turn any topic—modern life, office politics, personal dilemmas, or historical events—into an authentic Punch-style editorial satire.
            </p>
          </div>

          {/* Inspiration Presets */}
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center gap-2 text-[11px] sm:text-xs font-mono text-parchment-300 mb-3">
              <Lightbulb className="w-3.5 h-3.5 shrink-0 text-brass-400" />
              <span>QUICK INSPIRATIONS (CLICK TO LOAD)</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p.title}
                  type="button"
                  onClick={() => handleApplyPreset(p)}
                  className="px-3 py-2.5 sm:py-1.5 rounded-lg text-xs font-sans bg-archive-800/80 border border-brass-500/30 hover:border-brass-400 hover:bg-brass-500/10 text-parchment-200 transition-all flex items-center gap-1.5 text-left"
                >
                  <span className="text-brass-400 font-mono text-[10px] shrink-0">
                    {p.era}:
                  </span>
                  <span>{p.title}</span>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Field 1: Subject / Tension */}
            <div className="space-y-2">
              <label className="block text-xs font-mono tracking-wider text-brass-400 uppercase">
                1. What conflict, dilemma, or absurdity would you like to satirize?
              </label>
              <input
                type="text"
                required
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Corporate Burnout, Smartphone Addiction, Rent Prices, or The Cold War..."
                className="w-full px-4 py-3.5 rounded-xl bg-archive-950 border border-brass-500/30 focus:border-brass-400 focus:ring-1 focus:ring-brass-400 text-parchment-50 placeholder-parchment-400/40 text-base font-sans outline-none transition-all shadow-inner"
              />
            </div>

            {/* Field 2: Deeper Subtext */}
            <div className="space-y-2">
              <label className="block text-xs font-mono tracking-wider text-brass-400 uppercase">
                2. The deeper irony or hidden truth
              </label>
              <textarea
                rows={2}
                value={subtext}
                onChange={(e) => setSubtext(e.target.value)}
                placeholder="What is the real absurdity? (e.g. 'Everyone knows it is unsustainable, yet everyone keeps smiling and pretending')"
                className="w-full px-4 py-3 rounded-xl bg-archive-950 border border-brass-500/30 focus:border-brass-400 focus:ring-1 focus:ring-brass-400 text-parchment-50 placeholder-parchment-400/40 text-base sm:text-sm font-sans outline-none transition-all shadow-inner resize-none"
              />
            </div>

            {/* Field 3: Metaphor Vehicle */}
            <div className="space-y-2.5">
              <label className="block text-xs font-mono tracking-wider text-brass-400 uppercase">
                3. Allegorical Vehicle (How should the tension be visualized?)
              </label>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-2.5">
                {METAPHOR_VEHICLES.map((mv) => {
                  const Icon = mv.icon;
                  const isSelected = vehicle === mv.id;
                  return (
                    <button
                      key={mv.id}
                      type="button"
                      onClick={() => {
                        setVehicle(mv.id);
                      }}
                      className={`p-2.5 sm:p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'bg-brass-500/20 border-brass-400 shadow-brass-glow text-parchment-50'
                          : 'bg-archive-950/50 border-brass-500/20 hover:border-brass-500/50 hover:bg-archive-950 text-parchment-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-brass-300' : 'text-brass-500/80'}`} />
                        {isSelected && (
                          <span className="w-1.5 h-1.5 rounded-full bg-verdigris-400 inline-block shadow-sm" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="font-serif font-semibold text-[11px] sm:text-xs text-parchment-100 leading-tight">
                          {mv.label}
                        </div>
                        <div className="hidden sm:block text-[10px] text-parchment-400/70 line-clamp-2 lg:line-clamp-1 mt-0.5">
                          {mv.description}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Field 4: Satirical Sharpness */}
            <div className="space-y-3 pt-2">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-[11px] sm:text-xs font-mono tracking-wider text-brass-400 uppercase">
                <span>4. Satirical Tone</span>
                <span className="text-brass-300 font-mono font-bold sm:text-right">
                  {cynicismLevel}% &bull;{' '}
                  {cynicismLevel > 80
                    ? 'Biting Satire'
                    : cynicismLevel > 40
                      ? 'Critical Commentary'
                      : 'Somber & Poignant'}
                </span>
              </div>

              <div className="flex items-center gap-3 sm:gap-4">
                <span className="text-[11px] sm:text-xs font-serif text-parchment-400 shrink-0">
                  Somber
                </span>
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="5"
                  value={cynicismLevel}
                  onChange={(e) => {
                    setCynicismLevel(Number(e.target.value));
                  }}
                  aria-label="Satirical tone"
                  className="tone-slider w-full min-w-0 h-8"
                />
                <span className="text-[11px] sm:text-xs font-serif text-brass-300 shrink-0 text-right">
                  Biting Irony
                </span>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isGenerating || !topic.trim()}
                className={`w-full min-h-[52px] py-4 px-4 sm:px-8 rounded-xl font-display text-base sm:text-xl font-bold tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-2 sm:gap-3 text-center relative overflow-hidden group shadow-deep-bevel ${
                  isGenerating || !topic.trim()
                    ? 'bg-archive-800 text-parchment-400/50 cursor-not-allowed border border-brass-600/20'
                    : 'bg-brass-gradient text-archive-950 hover:shadow-brass-glow-lg border border-brass-200 active:scale-[0.99]'
                }`}
              >
                <Sparkles className="w-5 h-5 shrink-0 text-archive-950" />
                <span>{isGenerating ? 'CARVING CARTOON...' : 'ENGRAVE CARTOON'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
