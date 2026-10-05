import { NextRequest, NextResponse } from 'next/server';
import {
  getApiKey,
  parseConceptParams,
  reasonAllegory,
  errorMessage,
  errorStatus
} from '@/lib/gemini';

export const maxDuration = 120;

// Milestone 1/2: draft the allegory concept (title, quote, caption, metaphors,
// thesis, image prompt). Fast — lets the UI show genuine progress.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const params = parseConceptParams(body);
    if ('error' in params) {
      return NextResponse.json({ error: params.error }, { status: 400 });
    }

    const apiKey = getApiKey();
    if (!apiKey) {
      return NextResponse.json(
        { error: 'The AI engraving engine is not configured on this server (missing GEMINI_API_KEY).' },
        { status: 503 }
      );
    }

    const t0 = Date.now();
    console.log(`[concept] topic="${params.topic}" vehicle=${params.vehicle} cynicism=${params.cynicismLevel}`);
    const { concept, model } = await reasonAllegory(apiKey, params);
    console.log(`[concept] ok via ${model} in ${Date.now() - t0}ms`);

    return NextResponse.json({ success: true, concept, conceptParams: params, model });
  } catch (error) {
    console.error('API /concept error:', errorMessage(error, 'Concept failed'));
    return NextResponse.json(
      { error: errorMessage(error, 'Failed to draft the concept. Please try again.') },
      { status: errorStatus(error) }
    );
  }
}
