// Ambient background music for the studio. A single looping classical track,
// served locally — no streaming, no tracking, no autoplay violations: playback
// begins on the visitor's first click anywhere (browser autoplay policy).
//
// Track: Goldberg Variations, BWV 988 — Aria
// Composer: Johann Sebastian Bach (1741, public domain)
// Recording: Kimiko Ishizaka, Open Goldberg Variations Project,
// dedicated to the public domain (CC0 1.0).
// Source: https://archive.org/details/OpenGoldbergVariations

export const TRACK = {
  title: 'Goldberg Variations, BWV 988 — Aria',
  artist: 'Johann Sebastian Bach, performed by Kimiko Ishizaka',
  license: 'Public domain (CC0 1.0) — free to use, no copyright restriction',
  sourceUrl: 'https://archive.org/details/OpenGoldbergVariations',
  file: '/audio/bach-goldberg-aria.mp3',
  volume: 0.4
};

const STORAGE_KEY = 'ironicink_music_enabled';

type Listener = (playing: boolean) => void;

class MusicBox {
  private audio: HTMLAudioElement | null = null;
  private listeners = new Set<Listener>();
  private unlocked = false;
  private pref: boolean | null = null;

  /** Visitor preference; defaults to ON. */
  getPreferred(): boolean {
    if (this.pref === null) {
      try {
        const saved = typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_KEY) : null;
        this.pref = saved === null ? true : saved === '1';
      } catch {
        this.pref = true;
      }
    }
    return this.pref;
  }

  private ensure(): HTMLAudioElement | null {
    if (typeof window === 'undefined') return null;
    if (!this.audio) {
      const el = new Audio(TRACK.file);
      el.loop = true;
      el.volume = TRACK.volume;
      el.preload = 'auto';
      this.audio = el;
    }
    return this.audio;
  }

  playing(): boolean {
    return !!this.audio && !this.audio.paused;
  }

  subscribe(fn: Listener): () => void {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  }

  private emit() {
    const p = this.playing();
    this.listeners.forEach((fn) => {
      try {
        fn(p);
      } catch {
        /* listener errors must never break playback */
      }
    });
  }

  /** Call once on the first user gesture anywhere on the page. */
  userInteracted() {
    if (this.unlocked) return;
    this.unlocked = true;
    if (this.getPreferred()) {
      this.play();
    }
  }

  play() {
    const el = this.ensure();
    if (!el) return;
    el.play()
      .then(() => this.emit())
      .catch(() => {
        /* autoplay blocked or media unavailable — stay silent */
      });
  }

  pause() {
    if (this.audio) {
      this.audio.pause();
    }
    this.emit();
  }

  setEnabled(on: boolean) {
    this.pref = on;
    try {
      window.localStorage.setItem(STORAGE_KEY, on ? '1' : '0');
    } catch {
      /* private mode — preference simply won't persist */
    }
    if (on) {
      if (this.unlocked) this.play();
    } else {
      this.pause();
    }
  }

  toggle() {
    this.setEnabled(!this.playing());
  }
}

export const music = new MusicBox();
