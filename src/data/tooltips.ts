import type { GameState } from '../types/game';

export interface TooltipContent {
  title: string;
  long: string;
  mechanic: string;
}

export const UPGRADE_LORE: Record<string, TooltipContent> = {
  money: {
    title: 'Digital Assets',
    long: 'Fiat currency converted to crypto on the fly. Every line of code generates revenue from automated micro-contracts deployed to the blockchain.',
    mechanic: 'Base $0.05/line + bonuses from Rubber Duck (+$0.01) and Tidy Comments (+1%). Multiplied by global production multipliers.',
  },
  vibeShards: {
    title: 'Vibe Shards',
    long: 'Fragments of pure computational essence. Earned from leveling up and trading Vibe Levels in the Cloud Shop.',
    mechanic: 'Spent on Premium upgrades (Hyper-Threaded Vibe, Cloud Compute, AI Overlord).',
  },
  maxLPS: {
    title: 'Hash Rate (LPS)',
    long: 'Lines Per Second — the speed at which your automation generates code. Aggregated from Auto-Linters, milestone boosts, and emergent upgrades.',
    mechanic: 'Base = lintOwned × 1 × milestoneBoost. Perks multiply further. Multiplied by Cloud Compute (2×), Code Review (+2%), etc.',
  },
  vibeLevel: {
    title: 'Vibe Level',
    long: 'Your mastery of the coding flow state. Each level represents a deeper synchronization with the compiler.',
    mechanic: 'Each level grants +5% global production (additive). XP required: 100 × 1.5^level.',
  },
  ascensionMultiplier: {
    title: 'Ascension Multiplier',
    long: 'The permanent productivity boost earned by graduating. Each ascension resets progress but crystallizes output into a permanent multiplier.',
    mechanic: 'Multiplier = 1 + √(totalLinesEver / 1M). Stacks multiplicatively with all bonuses.',
  },
  edOwned: {
    title: 'Energy Drink',
    long: 'Bootleg caffeine derivatives sourced from the dark web. Each can rewires your neural stack for faster code output.',
    mechanic: '+0.5 base click power per level (additive). Cap: 5. Cost: 1.00 × 1.15^owned.',
  },
  fluxOwned: {
    title: 'Energy Flux',
    long: 'A refined energy substrate that optimizes your entire development stack. Reduces the friction cost of Mechanical Keyboards and Auto-Linters.',
    mechanic: 'Each level reduces KB and Lint costs by 5% (multiplicative). Cost: 100 × 1.25^owned (aggressive scaling). Replaces Energy Drink at cap.',
  },
  kbOwned: {
    title: 'Mechanical Keyboard',
    long: 'A vintage Model M keyboard with buckling-spring switches. Each keystroke sounds like a tiny thunderclap. The louder you type, the more the compiler respects you.',
    mechanic: '+1.5 base click power per level (additive). Cost: 5.00 × 1.15^owned × 0.95^fluxOwned.',
  },
  lintOwned: {
    title: 'Auto-Linter',
    long: 'A daemon that crawls through your codebase correcting syntax and generating boilerplate. It learns from every line you write, slowly becoming self-aware.',
    mechanic: '+1 LoC/sec per level × milestone boost. Milestones at level 10, 25, 100+ (2× each). Cost: 20.00 × 1.15^owned × 0.95^fluxOwned.',
  },
  perkEdTier: {
    title: 'ED Perks',
    long: 'Enhancements to your Energy Drink stack. Double Shot doubles the caffeine hit; Caffeine IV is a direct neural tap.',
    mechanic: 'Tier 1: ED power +25%. Tier 2: ED power +50%. Unlock at ED 3 and ED 5.',
  },
  perkKbTier: {
    title: 'Keyboard Perks',
    long: 'After enough keystrokes, you begin to modify the hardware itself. Each tier is a new switch technology.',
    mechanic: 'Each tier adds a multiplicative bonus to KB click power (up to +500% at tier 7). Unlocks at KB 10, 25, 100, 200, 500, 750, 1000.',
  },
  perkLintTier: {
    title: 'Linter Perks',
    long: 'As the linter grows more experienced, it begins to optimize its own optimization algorithms.',
    mechanic: 'Each tier adds a multiplicative bonus to linter speed (up to +500% at tier 7). Unlocks at Lint 10, 25, 100, 200, 500, 750, 1000.',
  },
  premiumHyperThreaded: {
    title: 'Hyper-Threaded Vibe',
    long: 'A direct neural interface that lets you code in parallel threads. Your consciousness splits into two simultaneous debug sessions.',
    mechanic: 'Permanent ×2 click power. 10 Shards.',
  },
  premiumCloudCompute: {
    title: 'Cloud Compute',
    long: 'AWS, GCP, Azure — you rent them all simultaneously. The auto-linter now runs on a distributed cluster of retired cryptocurrency miners.',
    mechanic: 'Permanent ×2 auto-linter speed. 25 Shards.',
  },
  premiumAIOverlord: {
    title: 'AI Overlord',
    long: 'You sold 51% of your company to a sentient GPT instance. In return, it rewrites your code while you sleep.',
    mechanic: '+1% to all production per 100 total manual clicks (multiplicative, uncapped). 50 Shards.',
  },
  premiumEternalLoop: {
    title: 'Eternal Loop',
    long: 'Each ascension makes you stronger. This upgrade ensures that memory is never truly lost.',
    mechanic: 'Ascension multiplier gains +10% additive per prior ascension. 100 Shards.',
  },
  premiumQuantumBackup: {
    title: 'Quantum Backup',
    long: 'A snapshot of your consciousness at the moment of peak productivity. When you ascend, a fragment remains.',
    mechanic: 'Keep 10% of your vibeLevel on ascend (rounded down). 75 Shards.',
  },
  premiumRecursiveCompile: {
    title: 'Recursive Compile',
    long: 'The compiler learns from its own output. The dark web nodes begin to whisper in XP.',
    mechanic: 'Dark Web node income also generates XP at 50% efficiency. 150 Shards.',
  },
  premiumParallelDim: {
    title: 'Parallel Dimension',
    long: 'The Archive is not a record of the past — it is a live feed from a universe where you are more productive.',
    mechanic: '+25% global production while Archive has any unlocked entry. 200 Shards.',
  },
  premiumNeuralLink: {
    title: 'Neural Link',
    long: 'The final upgrade: your thoughts are the input. No keyboard needed. No keys to press.',
    mechanic: 'Hotkeys also work while any text input is focused (except during rebinding). 250 Shards.',
  },
};
