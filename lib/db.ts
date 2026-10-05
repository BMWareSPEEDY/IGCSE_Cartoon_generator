import Dexie, { type Table } from 'dexie';
import { AllegoryCreation } from './types';

export const CURATED_ALLEGORIES: AllegoryCreation[] = [
  {
    id: 'curated-procrastination-1910',
    title: 'Midnight Cramming & Self-Sabotage',
    topic: 'Midnight Cramming & Self-Sabotaging Procrastination',
    subtext: 'Polishing desk ornaments and trivia while the exam deadline tsunami bears down upon the scholar.',
    vehicle: 'precipice_cliff',
    cynicismLevel: 80,
    caption: 'THE TIDAL HOUR.',
    centralMetaphor: 'A frantic student obsessively polishing a tiny useless brass inkpot labeled TRIVIA, while a colossal towering tidal wave of textbooks and clocks labeled EXAM DEADLINE crashes over his head as the candle labeled REMAINING HOURS flickers its last breath.',
    metaphorBreakdown: [
      'The Polished Inkpot: Represents trivial displacements—cleaning desks and formatting margins to evade the terrifying core task.',
      'The Wave of Textbooks: The accumulated weight of unread chapters transforming from manageable daily lessons into an overwhelming cataclysm.',
      'The Guttering Candle: The finite, non-negotiable countdown of remaining hours before the trial begins.'
    ],
    etchedLabels: [
      { label: 'EXAM DEADLINE', targetObject: 'Towering Wave', symbolism: 'The inexorable deadline approaching with oceanic force', xPercent: 50, yPercent: 22 },
      { label: 'TRIVIA', targetObject: 'Brass Inkpot', symbolism: 'Obsessive attention paid to petty non-essentials', xPercent: 52, yPercent: 76 },
      { label: 'REMAINING HOURS', targetObject: 'Tallow Candle', symbolism: 'The finite wick of midnight stamina running dry', xPercent: 32, yPercent: 77 }
    ],
    historicalThesis: 'Procrastination is not laziness, but an irrational avoidance of inadequacy that guarantees the exact panic it seeks to postpone.',
    imageUrl: '/seed/procrastination.jpg',
    promptUsed: '1910s editorial cartoon: student polishing trivia inkpot under tidal wave of textbooks EXAM DEADLINE in Punch magazine style.',
    createdAt: 1727798400000,
    isCurated: true
  },
  {
    id: 'curated-burnout-1912',
    title: 'Corporate Burnout & Hustle Culture',
    topic: 'Modern Corporate Hustle Culture and Endless Zoom Calls',
    subtext: 'Trading youth and sanity for vanity titles and quarterly slides inside an infinite treadmill.',
    vehicle: 'monolithic_beast',
    cynicismLevel: 90,
    caption: 'THE CONVEYOR OF DREAMS.',
    centralMetaphor: 'An exhausted clerk in a crumpled bowler hat running frantically inside a massive iron hamster-wheel treadmill labeled HUSTLE, turning the teeth of a giant gear labeled THE DAILY GRIND while fat corporate directors on a velvet balcony toast champagne to QUARTERLY TARGETS.',
    metaphorBreakdown: [
      'The Hustle Wheel: The self-imposed mechanical trap where stopping for a breath feels like tumbling to disaster.',
      'The Daily Grind Gear: The institutional machinery that converts human vitality into anonymous quarterly increments.',
      'The Velvet Balcony: The physical separation of stakeholders who praise employee resilience while pocketing the dividends.'
    ],
    etchedLabels: [
      { label: 'HUSTLE', targetObject: 'Treadmill Wheel', symbolism: 'The cult of endless overwork disguised as virtue', xPercent: 14, yPercent: 52 },
      { label: 'THE DAILY GRIND', targetObject: 'Spurred Iron Gear', symbolism: 'The relentless corporate rhythm grinding down morale', xPercent: 75, yPercent: 62 },
      { label: 'QUARTERLY TARGETS', targetObject: 'Champagne Flutes', symbolism: 'Arbitrary fiscal milestones detached from human endurance', xPercent: 64, yPercent: 18 }
    ],
    historicalThesis: 'Hustle culture convinces workers that their exhaustion is personal failure rather than the deliberate design of the machine.',
    imageUrl: '/seed/burnout.jpg',
    promptUsed: '1912 vintage editorial cartoon: clerk in hamster wheel treadmill HUSTLE turning gear DAILY GRIND beneath executive balcony.',
    createdAt: 1727797000000,
    isCurated: true
  },
  {
    id: 'curated-smartphone-1920',
    title: 'Smartphone Addiction & The Feed',
    topic: 'Algorithmic Feeds & The Vanishing Attention Span',
    subtext: 'A glowing pocket rectangle quietly hypnotizing humanity into passive spectators.',
    vehicle: 'puppet_master',
    cynicismLevel: 88,
    caption: 'THE CAPTIVE EYE.',
    centralMetaphor: 'A pale, hollow-eyed citizen transfixed before an ornate mirror labeled THE FEED held by a towering cloaked puppet master, as flying pocket watches disperse into the night and forgotten books labeled REALITY gather spiderwebs on the floor.',
    metaphorBreakdown: [
      'The Feed Mirror: An algorithmic reflection designed to flatter and stimulate while delivering zero genuine nourishment.',
      'The Escaping Pocket Watches: The quiet, unnoticed theft of hours, days, and creative focus.',
      'The Dusty Books of Reality: The tangible, messy physical world discarded for frictionless digital shadows.'
    ],
    etchedLabels: [
      { label: 'THE FEED', targetObject: 'Hypnotic Mirror Glass', symbolism: 'The algorithmic stream capturing human consciousness', xPercent: 70, yPercent: 36 },
      { label: 'REALITY', targetObject: 'Discarded Book Pile', symbolism: 'The physical, present world gathering dust and neglect', xPercent: 53, yPercent: 84 }
    ],
    historicalThesis: 'The attention economy sells our own hours back to us packaged as entertainment.',
    imageUrl: '/seed/smartphone.jpg',
    promptUsed: '1920s vintage editorial cartoon: mesmerized citizen staring into vanity mirror THE FEED held by cloaked puppet master.',
    createdAt: 1727795000000,
    isCurated: true
  },
  {
    id: 'curated-versailles-1919',
    title: 'The Treaty of Versailles (1919)',
    topic: 'The Treaty of Versailles & War Guilt Clause 231',
    subtext: 'Victorious Allies demanded astronomical reparations that shattered German economy while expecting enduring continental peace.',
    vehicle: 'teetering_scale',
    cynicismLevel: 85,
    caption: 'THE RECKONING.',
    centralMetaphor: 'A colossal, fractured stone balance scale held by a cynical allegorical figure of Justice, teetering precariously over the smoking ruins of Europe. A massive millstone of punitive reparations crushes the defeated imperial eagle, while a fragile hourglass leaks Europe’s remaining peaceful sands.',
    metaphorBreakdown: [
      'The Colossal Millstone: Symbolizes Article 231 and the unpayable 132 billion gold marks debt crushing the Weimar Republic.',
      'The Fractured Stone Balance: Demonstrates that the Allied concept of Justice was tilted by revenge rather than equilibrium.',
      'The Leaking Hourglass: Illustrates that punishing Germany merely started a 20-year countdown to a second global catastrophe.'
    ],
    etchedLabels: [
      { label: 'REPARATIONS', targetObject: 'Crushing Millstone', symbolism: 'The economic chokehold of 132B gold marks', xPercent: 24, yPercent: 52 },
      { label: 'VERDUN BALANCE', targetObject: 'Cracked Crossbeam', symbolism: 'The fragile wartime compromise born from slaughter', xPercent: 50, yPercent: 32 },
      { label: 'EUROPE’S FUTURE', targetObject: 'Fragile Hourglass', symbolism: 'The finite timeline before renewed continental conflagration', xPercent: 78, yPercent: 68 }
    ],
    historicalThesis: 'The Treaty of Versailles was neither mild enough to conciliate Germany nor harsh enough to permanently dismember it; instead, it saddled a fragile democracy with terminal resentment.',
    imageUrl: '/seed/versailles.jpg',
    promptUsed: '1919 vintage political cartoon woodcut engraving: colossal cracked stone balance scale teetering over abyss labeled THE RECKONING.',
    createdAt: 1727784000000,
    isCurated: true
  },
  {
    id: 'curated-wall-street-1929',
    title: 'The Great Wall Street Crash (1929)',
    topic: 'Speculative Margin Buying & The Collapse of the Roaring Twenties',
    subtext: 'Euphoric speculation created an illusion of permanent prosperity that galloped heedlessly off a cliff into catastrophic economic reality.',
    vehicle: 'precipice_cliff',
    cynicismLevel: 90,
    caption: 'BLIND MOMENTUM.',
    centralMetaphor: 'A muscular bull blindfolded with ribboned ticker-tape leaping off the edge of a high jagged precipice into a dark abyss of thunderclouds, while panicked investors below watch their umbrellas and paper ledgers scatter in the wind.',
    metaphorBreakdown: [
      'The Blindfolded Bull: Embodying unbridled market optimism and the belief that the stock market could only rise indefinitely.',
      'The Ticker-Tape Blindfold: Shows how rapid price updates gave speculators the illusion of control while blinding them to systemic insolvency.',
      'The Falling Ledgers: The sudden evaporation of phantom paper wealth when bank runs and margin calls turned prosperity into depression.'
    ],
    etchedLabels: [
      { label: 'SPECULATION', targetObject: 'Ticker Tape Blindfold', symbolism: 'Margin buying with borrowed money driving artificial asset inflation', xPercent: 66, yPercent: 35 },
      { label: 'REALITY', targetObject: 'Stormy Thundercloud Chasm', symbolism: 'The unforgiving reckoning of debt default, deflation, and unemployment', xPercent: 84, yPercent: 48 },
      { label: 'EASY MONEY', targetObject: 'Floating Ribbon Banner', symbolism: 'Loose credit and lack of federal banking oversight in the 1920s', xPercent: 18, yPercent: 37 }
    ],
    historicalThesis: 'The 1929 crash proved that financial bubbles powered by ungrounded debt and blind speculation will inevitably obey gravity when collective confidence evaporates.',
    imageUrl: '/seed/wall_street.jpg',
    promptUsed: '1929 vintage editorial political cartoon woodcut engraving: massive bull blindfolded with ticker tape jumping off cliff into abyss REALITY.',
    createdAt: 1727794800000,
    isCurated: true
  }
];

class SatiricaDatabase extends Dexie {
  allegories!: Table<AllegoryCreation, string>;

  constructor() {
    super('SatiricaArchiveDB');
    this.version(2).stores({
      allegories: 'id, topic, vehicle, createdAt, isCurated'
    });
  }
}

export const db = new SatiricaDatabase();

export async function initDatabase(): Promise<AllegoryCreation[]> {
  try {
    const existing = await db.allegories.toArray();
    // Update or populate curated items so new seed images always take effect
    for (const curated of CURATED_ALLEGORIES) {
      const match = existing.find((e) => e.id === curated.id);
      if (!match) {
        await db.allegories.put(curated);
      } else if (match.imageUrl !== curated.imageUrl || match.caption !== curated.caption) {
        await db.allegories.put(curated);
      }
    }
    return await db.allegories.orderBy('createdAt').reverse().toArray();
  } catch (err) {
    console.error('Failed to initialize IndexedDB, falling back to in-memory curated set:', err);
    return CURATED_ALLEGORIES;
  }
}

export async function saveAllegory(allegory: AllegoryCreation): Promise<void> {
  try {
    await db.allegories.put(allegory);
  } catch (err) {
    console.error('Error saving to IndexedDB:', err);
  }
}

export async function deleteAllegory(id: string): Promise<void> {
  try {
    await db.allegories.delete(id);
  } catch (err) {
    console.error('Error deleting from IndexedDB:', err);
  }
}
