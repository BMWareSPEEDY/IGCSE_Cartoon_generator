import { NextRequest, NextResponse } from 'next/server';
import { IMAGE_MODEL } from '@/lib/engine';
import {
  getApiKey,
  parseConceptParams,
  renderCartoon,
  buildCreation,
  errorMessage,
  errorStatus
} from '@/lib/gemini';

export const maxDuration = 300;

// Milestone 2/2: render the cartoon from an already-drafted concept and return
// the complete archive-ready creation. Slow — the UI shows elapsed time here.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const params = parseConceptParams(body);
    if ('error' in params) {
      return NextResponse.json({ error: params.error }, { status: 400 });
    }

    const concept = body?.concept;
    if (!concept || typeof concept.image_prompt !== 'string' || !concept.image_prompt.trim()) {
      return NextResponse.json(
        { error: 'A drafted concept with an image prompt is required before rendering.' },
        { status: 400 }
      );
    }

    const apiKey = getApiKey();
    if (!apiKey) {
      return NextResponse.json(
        { error: 'The AI engraving engine is not configured on this server (missing GEMINI_API_KEY).' },
        { status: 503 }
      );
    }

    const t0 = Date.now();
    console.log(`[render] topic="${params.topic}"`);
    const imageUrl = await renderCartoon(apiKey, String(concept.image_prompt));
    console.log(`[render] ok via ${IMAGE_MODEL} in ${Date.now() - t0}ms (${Math.round(imageUrl.length / 1024)}KB)`);

    const creation = buildCreation(concept, params, imageUrl);
    return NextResponse.json({ success: true, creation, source: 'gemini' });
  } catch (error) {
    console.error('API /render error:', errorMessage(error, 'Render failed'));
    return NextResponse.json(
      { error: errorMessage(error, 'Failed to render the cartoon. Please try again.') },
      { status: errorStatus(error) }
    );
  }
}
