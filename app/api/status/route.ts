import { NextResponse } from 'next/server';
import { CODE_VERSION, REASONING_MODELS, IMAGE_MODEL } from '@/lib/engine';

// Lightweight health check for the engraving engine.
// Costs no quota, exposes no secrets — safe to open in a browser.
export async function GET() {
  return NextResponse.json({
    ok: true,
    engine: 'gemini-interactions',
    codeVersion: CODE_VERSION,
    reasoningModels: REASONING_MODELS,
    imageModel: IMAGE_MODEL,
    // True only if the RUNNING server loaded a key from .env at startup.
    // False means: .env missing/empty, or the server was started before the key was added.
    keyConfigured: Boolean(process.env.GEMINI_API_KEY),
    now: Date.now()
  });
}
