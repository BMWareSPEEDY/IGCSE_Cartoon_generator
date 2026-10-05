export type MetaphorVehicle =
  | 'teetering_scale'
  | 'precipice_cliff'
  | 'fragile_clockwork'
  | 'puppet_master'
  | 'monolithic_beast'
  | 'rigged_game'
  | 'sinking_galleon'
  | 'auto';

// Genuine backend milestones reported by the two-step pipeline — the loader
// advances only when the server actually finishes each stage.
export type GenerationStage = 'concept' | 'render';

export interface EtchedLabel {
  label: string;
  targetObject: string;
  symbolism: string;
  xPercent?: number; // Approximate relative spatial hotspot for visual annotation
  yPercent?: number;
}

export interface AllegoryCreation {
  id: string;
  title: string;
  topic: string;
  subtext: string;
  vehicle: MetaphorVehicle;
  cynicismLevel: number; // 0 to 100
  caption: string; // 2-4 word uppercase caption with period, e.g. "THE RECKONING."
  quote?: string; // Sharp one-line ironic editorial quote distilling the satire
  centralMetaphor: string;
  metaphorBreakdown: string[];
  etchedLabels: EtchedLabel[];
  historicalThesis: string;
  igcseCurriculumNote?: string;
  imageUrl: string;
  promptUsed: string;
  createdAt: number;
  isCurated?: boolean;
}

export interface PresetTopic {
  title: string;
  topic: string;
  subtext: string;
  vehicle: MetaphorVehicle;
  cynicismLevel: number;
  era: string;
}
