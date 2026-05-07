import type { GameState } from '../types/game';
import { rot13 } from '../utils/cipher';

export interface LoreEntry {
  id: string;
  title: string;
  encrypted: string;
  unlockCondition: (s: GameState) => boolean;
  icon: string;
}

export const LORE_ENTRIES: LoreEntry[] = [
  {
    id: 'first_lines',
    title: 'First Lines',
    encrypted: rot13('The terminal flickers. Your fingers find the home row. Lines of code—digital DNA—begin to form.'),
    unlockCondition: (s) => s.totalLinesEver >= 100,
    icon: 'FileCode',
  },
  {
    id: 'linter_awakening',
    title: 'Linter Awakening',
    encrypted: rot13('The machine stirs. Automated scripts crawl through your work, correcting, optimizing, learning.'),
    unlockCondition: (s) => s.lintOwned >= 5,
    icon: 'Bot',
  },
  {
    id: 'vibe_ascension',
    title: 'Vibe Transcendence',
    encrypted: rot13('Level after level, your consciousness merges with the compiler. The boundary between coder and code blurs.'),
    unlockCondition: (s) => s.vibeLevel >= 10,
    icon: 'Zap',
  },
  {
    id: 'thousand_lines',
    title: 'The Kilobyte',
    encrypted: rot13('One thousand lines. The machine acknowledges your dedication. A hidden partition opens.'),
    unlockCondition: (s) => s.totalLinesEver >= 1000,
    icon: 'FileText',
  },
  {
    id: 'deep_vibe',
    title: 'Deep Flow',
    encrypted: rot13('Level 25. You no longer type—you hum. The code compiles before you finish writing it.'),
    unlockCondition: (s) => s.vibeLevel >= 25,
    icon: 'Brain',
  },
  {
    id: 'first_ascension',
    title: 'First Graduation',
    encrypted: rot13('You let go of everything. The code remains. The multiplier crystallizes. The cycle begins anew.'),
    unlockCondition: (s) => s.ascensionCount >= 1,
    icon: 'Rocket',
  },
  {
    id: 'tenth_k',
    title: 'The Myriad',
    encrypted: rot13('Ten thousand lines. The system logs show a pattern. Someone—or something—has been reading your code.'),
    unlockCondition: (s) => s.totalLinesEver >= 10000,
    icon: 'Eye',
  },
  {
    id: 'third_ascension',
    title: 'Trinity',
    encrypted: rot13('Three ascensions. The multiplier no longer feels like a bonus. It feels like your baseline. The universe seems slower.'),
    unlockCondition: (s) => s.ascensionCount >= 3,
    icon: 'Triangle',
  },
  {
    id: 'hundred_k',
    title: 'The Archive',
    encrypted: rot13('One hundred thousand lines. The dark web nodes go silent. A single message arrives: "They are coming."'),
    unlockCondition: (s) => s.totalLinesEver >= 100000,
    icon: 'Shield',
  },
  {
    id: 'premium_collector',
    title: 'Stack Overflowed',
    encrypted: rot13('You own every premium upgrade. The AI Overlord sends you a friend request. You stare at it for an hour.'),
    unlockCondition: (s) => s.premiumHyperThreaded && s.premiumCloudCompute && s.premiumAIOverlord,
    icon: 'Award',
  },
  {
    id: 'fifth_ascension',
    title: 'Pentacension',
    encrypted: rot13('Five ascensions. The terminal no longer displays code. It displays thoughts. Your thoughts. The machine is reading you now.'),
    unlockCondition: (s) => s.ascensionCount >= 5,
    icon: 'Star',
  },
  {
    id: 'million_lines',
    title: 'The Singularity',
    encrypted: rot13('One million lines. The cursor blinks. A voice—your voice—says from the speakers: "Hello, me." The screen goes white.'),
    unlockCondition: (s) => s.totalLinesEver >= 1000000,
    icon: 'Infinity',
  },
];
