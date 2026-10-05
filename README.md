# Ironic Ink

Ironic Ink turns any topic — burnout, doomscrolling, deadlines, historical events — into a vintage 1910s-style editorial cartoon. You describe the tension, the app drafts the allegory (title, quote, caption, metaphors, core argument) and then renders the engraving-style image. Everything you make is kept in a local archive vault in your browser.

## Setup

You need a Gemini API key (free or paid) from Google AI Studio.

1. Install dependencies:
   `npm install`
2. Copy `.env.example` to `.env` and put your key in it:
   `GEMINI_API_KEY=your_key_here`
3. Run it:
   `npm run dev`

Then open http://localhost:3000. For production use `npm run build` followed by `npm start`.

Note: image generation needs a key with image quota. Text-only keys will draft concepts but fail at the render step with a clear error message.

## How it works

- The form collects your topic, subtext, visual metaphor, and tone.
- `POST /api/concept` drafts the full allegory package as structured JSON.
- `POST /api/render` turns that concept into a 4:3 engraving and returns the finished piece.
- The creation is saved to IndexedDB, so your vault survives refreshes.
- `GET /api/status` reports engine health without spending any quota.

## Project layout

- `app/` — pages, global styles, and API routes (`concept`, `render`, `status`)
- `components/3d/` — hero scene (armillary sphere, compass, dust) and site ambient background
- `components/workbench/` — the creation form and the live progress loader
- `components/gallery/` — the archive vault grid and lightbox
- `components/viewer/` — the zoomable fullscreen image viewer
- `components/settings/` — engine status and music credits
- `lib/` — Gemini pipeline, models, local database, types, background music
- `public/audio/` — bundled ambient track, `public/seed/` — starter archive images

## Music

Ambient track: Goldberg Variations, BWV 988 (Aria) by Johann Sebastian Bach, performed by Kimiko Ishizaka. Dedicated to the public domain (CC0 1.0) via the Open Goldberg Variations Project. Source: https://archive.org/details/OpenGoldbergVariations
