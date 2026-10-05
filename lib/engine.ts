// Single source of truth for the AI engraving engine configuration.
// Bump CODE_VERSION whenever the generation pipeline changes so a stale
// server (old build still running) can be identified via /api/status.
export const CODE_VERSION = 'v4-logging-status-quota-errors';

// Step 1 — reasoning models (tried in order; failover on capacity errors).
export const REASONING_MODELS = ['gemini-3.8-flash', 'gemini-3.5-flash'];

// Step 2 — speed-optimized native image model ("Nano Banana 2").
export const IMAGE_MODEL = 'gemini-3.1-flash-image';
