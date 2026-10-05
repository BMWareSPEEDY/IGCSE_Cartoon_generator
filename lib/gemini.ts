import { AllegoryCreation, MetaphorVehicle } from '@/lib/types';
import { REASONING_MODELS, IMAGE_MODEL } from '@/lib/engine';

// Official default interface as of 2026: the Interactions API.
// Docs: https://ai.google.dev/gemini-api/docs/interactions
const INTERACTIONS_URL = 'https://generativelanguage.googleapis.com/v1beta/interactions';
const API_REVISION = '2026-05-20';

export interface ConceptParams {
  topic: string;
  subtext: string;
  vehicle: MetaphorVehicle;
  cynicismLevel: number;
}

const VEHICLE_LABELS: Record<MetaphorVehicle, string> = {
  auto: 'Auto-select the most poignant spatial metaphor for the topic',
  teetering_scale: 'Teetering Scale — imbalanced weights, heavy burdens, precarious compromise',
  precipice_cliff: 'Precipice & Chasm — blind momentum galloping toward a steep drop',
  fragile_clockwork: 'Unstoppable Machine — rigid gears, automated processes, inescapable momentum',
  monolithic_beast: 'The Grinding Engine — colossal flywheels and institutions consuming human energy',
  puppet_master: 'Tangled Marionette — strings pulled by algorithms, superiors, or hidden interests',
  rigged_game: 'The Stacked Table — loaded dice, marked cards, rules rewritten mid-game',
  sinking_galleon: 'Leaking Ship — arguing over deck chairs while the hold fills with water'
};

// ---------------------------------------------------------------------------
// Interactions API plumbing
// ---------------------------------------------------------------------------

/** Transient upstream capacity failure — safe to retry / fail over to another model. */
export class CapacityError extends Error {}

/** Quota, billing, or permission failure — retrying won't help until the account side is fixed. */
export class QuotaError extends Error {}

/** Map a pipeline error to the HTTP status the route should return. */
export function errorStatus(error: unknown): number {
  if (error instanceof QuotaError) return 429;
  const message = error instanceof Error ? error.message : '';
  if (/timed out/i.test(message)) return 504;
  return 502;
}

export function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

/** Server-side key only. It is never accepted from, or sent to, the client. */
export function getApiKey(): string | undefined {
  return process.env.GEMINI_API_KEY;
}

async function callInteractions(
  apiKey: string,
  body: Record<string, unknown>,
  timeoutMs: number
): Promise<any> {
  let res: Response;
  try {
    res = await fetch(INTERACTIONS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Key travels in a header, never in the URL (avoids leaking into logs).
        'x-goog-api-key': apiKey,
        'Api-Revision': API_REVISION
      },
      // Stateless: nothing is persisted on Google's side.
      body: JSON.stringify({ store: false, ...body }),
      signal: AbortSignal.timeout(timeoutMs)
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === 'TimeoutError') {
      throw new CapacityError('The AI engine timed out. Please try again.');
    }
    throw new Error('Could not reach the AI engine. Check your connection and try again.');
  }

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    // Google returns { error: { message, code } } — surface the message, never the key.
    const message =
      typeof data?.error?.message === 'string' && data.error.message.length > 0
        ? data.error.message
        : `The AI engine returned HTTP ${res.status}.`;
    if (res.status === 429 || res.status === 503 || /high demand|overload|capacity|try again later/i.test(message)) {
      throw new CapacityError(message);
    }
    if (/free tier|rate-limit|billing|upgrade your tier|quota|permission/i.test(message)) {
      throw new QuotaError(
        `${message} If this key is meant to be on a paid tier, billing is almost certainly not linked to the Google Cloud project that owns this exact API key — check it in Google AI Studio.`
      );
    }
    throw new Error(message);
  }
  if (data?.status && data.status !== 'completed') {
    throw new Error(`Generation did not complete (status: ${data.status}). Please try again.`);
  }
  return data;
}

/** Last model_output step's content blocks (thoughts/tool calls excluded). */
function modelOutputContents(data: any): any[] {
  const steps = Array.isArray(data?.steps) ? data.steps : [];
  for (let i = steps.length - 1; i >= 0; i--) {
    const step = steps[i];
    if (step?.type === 'model_output' && Array.isArray(step.content)) {
      return step.content;
    }
  }
  return [];
}

function extractText(data: any): string {
  return modelOutputContents(data)
    .filter((c) => c?.type === 'text' && typeof c.text === 'string')
    .map((c) => c.text)
    .join('');
}

function extractImageDataUrl(data: any): string | null {
  const img = modelOutputContents(data).find(
    (c) => c?.type === 'image' && typeof c?.data === 'string' && c.data.length > 0
  );
  if (!img) return null;
  const mime = typeof img.mime_type === 'string' ? img.mime_type : 'image/png';
  return `data:${mime};base64,${img.data}`;
}

// ---------------------------------------------------------------------------
// Step 1 — allegory reasoning (one call returns the whole archive package)
// ---------------------------------------------------------------------------

const ALLEGORY_SCHEMA = {
  type: 'object',
  properties: {
    title: {
      type: 'string',
      description: 'Short evocative display title for the cartoon, 3-7 words, title case.'
    },
    quote: {
      type: 'string',
      description: 'One sharp ironic editorial quote line, max 140 characters, that distills the satire.'
    },
    caption: {
      type: 'string',
      description: 'Punchy 2-4 word ironic headline in ALL CAPS ending with a period, e.g. "THE RECKONING."'
    },
    central_metaphor: {
      type: 'string',
      description: 'The full physical scene in 2-4 vivid sentences. Concrete objects, spatial tension, no literal depiction of the topic.'
    },
    metaphor_breakdown: {
      type: 'array',
      minItems: 3,
      maxItems: 4,
      items: { type: 'string' },
      description: '3-4 entries, each "Symbol: what it means" in one sentence.'
    },
    etched_labels: {
      type: 'array',
      minItems: 2,
      maxItems: 3,
      items: {
        type: 'object',
        properties: {
          label: { type: 'string', description: 'Etched label text, 1-3 words, ALL CAPS.' },
          targetObject: { type: 'string', description: 'The physical object the label is carved onto.' },
          symbolism: { type: 'string', description: 'What the labeled object symbolizes, one sentence.' }
        },
        required: ['label', 'targetObject', 'symbolism']
      }
    },
    historical_thesis: {
      type: 'string',
      description: 'The core critical argument in 1-2 sentences — the takeaway the cartoon proves.'
    },
    image_prompt: {
      type: 'string',
      description:
        'Self-contained image-generation prompt, 90-140 words: monochrome pen-and-ink editorial engraving, 1910s-1930s Punch magazine woodcut style, the exact scene from central_metaphor, the etched label words carved onto their objects, the caption as a carved title plate. Black ink on aged newsprint only, dense cross-hatching, no color, no photorealism, no modern objects unless the topic demands them.'
    }
  },
  required: [
    'title',
    'quote',
    'caption',
    'central_metaphor',
    'metaphor_breakdown',
    'etched_labels',
    'historical_thesis',
    'image_prompt'
  ]
};

const SYSTEM_INSTRUCTION = `You are a master editorial cartoonist and allegorical satirist in the classic 1910s-1930s tradition of Punch Magazine, Bernard Partridge, and Thomas Nast.

Your mission: take ANY subject — modern dilemma, everyday human conflict, corporate absurdity, personal tension, or historical event — and engineer a deeply layered, highly symbolic editorial cartoon.

Rules:
1. Never be literal. Transform abstract workplace, psychological, societal, or geopolitical dilemmas into visceral PHYSICAL interactions between objects, figures, and forces.
2. Assign 2-3 concise etched physical labels (1-3 words, ALL CAPS) carved onto specific objects in the scene.
3. Devise an ironic 2-4 word caption in ALL CAPS ending with a period.
4. Scale the bite to the requested satirical sharpness: low values are somber and poignant, high values are ruthless.
5. The image_prompt must be fully self-contained — the image model never sees anything else.`;

function parseConcept(data: any) {
  const text = extractText(data);
  if (!text) throw new Error('The AI engine returned an empty concept. Please try again.');

  let parsed: any;
  try {
    parsed = JSON.parse(text);
  } catch {
    // Last-resort salvage if the model wrapped the JSON in prose.
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('The AI engine returned a malformed concept. Please try again.');
    parsed = JSON.parse(match[0]);
  }

  for (const field of ALLEGORY_SCHEMA.required) {
    if (parsed[field] === undefined || parsed[field] === null) {
      throw new Error('The AI engine returned an incomplete concept. Please try again.');
    }
  }
  return parsed;
}

export async function reasonAllegory(
  apiKey: string,
  params: ConceptParams
): Promise<{ concept: any; model: string }> {
  const requestBody = {
    system_instruction: SYSTEM_INSTRUCTION,
    input: `Subject / Tension: ${params.topic}
Underlying Subtext / Hidden Truth: ${params.subtext || 'The hidden systemic consequence nobody admits.'}
Required Allegorical Vehicle: ${VEHICLE_LABELS[params.vehicle] ?? VEHICLE_LABELS.auto}
Satirical Sharpness: ${params.cynicismLevel}/100 (0 = somber and poignant, 100 = ruthless and biting)`,
    response_format: {
      type: 'text',
      mime_type: 'application/json',
      schema: ALLEGORY_SCHEMA
    }
  };

  let lastCapacityError: unknown = null;
  for (const model of REASONING_MODELS) {
    try {
      const data = await callInteractions(apiKey, { model, ...requestBody }, 60_000);
      return { concept: parseConcept(data), model };
    } catch (err) {
      // Fail over to the next model only on transient capacity errors.
      if (err instanceof CapacityError) {
        lastCapacityError = err;
        continue;
      }
      throw err;
    }
  }
  throw lastCapacityError instanceof Error
    ? lastCapacityError
    : new Error('The AI engine is at capacity. Please try again shortly.');
}

// ---------------------------------------------------------------------------
// Step 2 — render the cartoon (Nano Banana, 4:3 to match the archive frames)
// ---------------------------------------------------------------------------

const STYLE_ANCHOR =
  'Monochrome pen-and-ink editorial engraving, 1910s-1930s Punch magazine woodcut style. Black ink on aged newsprint only, dense cross-hatching, hand-etched linework. No color, no photorealism, no watermark, no signature. Landscape 4:3 composition.';

export async function renderCartoon(apiKey: string, imagePrompt: string): Promise<string> {
  const data = await callInteractions(
    apiKey,
    {
      model: IMAGE_MODEL,
      input: [{ type: 'text', text: `${imagePrompt}\n\n${STYLE_ANCHOR}` }],
      response_format: {
        type: 'image',
        mime_type: 'image/jpeg',
        aspect_ratio: '4:3',
        image_size: '1K'
      }
    },
    180_000
  );

  const dataUrl = extractImageDataUrl(data);
  if (!dataUrl) throw new Error('The AI engine returned no image. Please try again.');
  return dataUrl;
}

// ---------------------------------------------------------------------------
// Assembly
// ---------------------------------------------------------------------------

export function buildCreation(
  concept: any,
  params: ConceptParams,
  imageUrl: string
): AllegoryCreation {
  return {
    id: 'creation-' + Date.now(),
    title: String(concept.title || params.topic),
    topic: params.topic,
    subtext: params.subtext,
    vehicle: params.vehicle,
    cynicismLevel: params.cynicismLevel,
    quote: String(concept.quote || ''),
    caption: String(concept.caption || '').toUpperCase(),
    centralMetaphor: String(concept.central_metaphor || ''),
    metaphorBreakdown: Array.isArray(concept.metaphor_breakdown)
      ? concept.metaphor_breakdown.map(String)
      : [],
    etchedLabels: Array.isArray(concept.etched_labels)
      ? concept.etched_labels.map((l: any) => ({
          label: String(l?.label ?? ''),
          targetObject: String(l?.targetObject ?? ''),
          symbolism: String(l?.symbolism ?? '')
        }))
      : [],
    historicalThesis: String(concept.historical_thesis || ''),
    imageUrl,
    promptUsed: String(concept.image_prompt || ''),
    createdAt: Date.now(),
    isCurated: false
  };
}

/** Shared validation for the concept/render request bodies. */
export function parseConceptParams(body: any): ConceptParams | { error: string } {
  const topic = typeof body?.topic === 'string' ? body.topic.trim() : '';
  if (!topic) return { error: 'Topic is required.' };
  return {
    topic,
    subtext: typeof body?.subtext === 'string' ? body.subtext.trim() : '',
    vehicle: body?.vehicle ?? 'auto',
    cynicismLevel:
      typeof body?.cynicismLevel === 'number'
        ? Math.min(100, Math.max(0, body.cynicismLevel))
        : 80
  };
}
