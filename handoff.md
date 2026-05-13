# Vibe Coder — Project Handoff

## Current Status: Phase 2B (Content Expansion) — In Progress

Phase 1 (Stabilization) = complete.
Phase 2 (Content Expansion) = STARTED (2A finished, 2B in progress).

---

## Completed Work

### Phase 1 � Stabilization & Foundation (Complete)

**Save System:**
- Save versioning + migration runner (v1?v9)
- Validation on load (validateState.ts)
- Backup before overwrite + restore on corruption
- Export/import in Config tab
- Debounced save fix (100ms game loop no longer triggers saves)

**Offline Progress:**
- `lastSavedAt` field + save stamping
- `computeOfflineProgress()` helper with 24h cap
- Wired into loadState
- Config tab toggle
- Welcome Back overlay

**Core Math & Stability:**
- Vitest setup + 106 math tests + 68 save/load tests
- NaN/Infinity boundary guards in all math functions
- Fixed writeLines O(N) crash (xpForLevel now recalculated per loop iteration)
- Fixed stale-closure purchase bugs in SeniorOfficeTab and TerminalTab
- Fixed infinite ascension multiplier crash

**Code Quality:**
- Extracted game actions into useGameActions.ts
- Removed duplicate keyboard handler (useKeyboard.ts was dead code)
- Added ErrorBoundary at App level
- Fixed all 21 pre-existing TypeScript errors
- MetricsTab expanded with 5 new stat rows

**UI:**
- Onboarding overlay (first-visit tutorial)
- MetricsTab LIFETIME + EFFICIENCY sections

### Phase 2A � Automation System (Complete)

- 3 nested settings objects in GameState (autoEditors, autoUpgrades, autoAscension)
- AutomationTab UI with toggles, steppers, and typed interval inputs
- `autoBuyEditors(state)` � buys ED/KB/Lint/Flux with cheapest/priority, 1x/max, reserve %
- `autoBuyUpgrades(state)` � buys perk tiers + masteries with money/vibe reserve
- `autoAscend(state)` � first-layer ascension with threshold/runtime gates
- All 3 wired into useAutomation.ts with independent useRef timers
- 39 dedicated tests for automation pure helpers

### Phase 2B � The Framework Prestige Layer (Complete)

**New Prestige Layer:**
- Tier 3 prestige unlocked after 100 total Senior Points
- `performFrameworkPrestige` resets Senior/Ascension/Vibe progress, preserves FP
- FrameworkTab UI with prestige button, FP display, and upgrade rows

**Framework Upgrades:**
- Code Reviewer: +5% auto speed per level (max 10)
- DevOps Pipeline: +5% global production per level (max 10)
- Both with cost scaling (1.5^level) and max level 10

**Extended Content:**
- KB/Lint perks extended: 10 tiers (was 7), up to 5000 owned
- Milestones extended: new 1000-tier segment in checkMilestones
- Save version bumped to 9, all fields validated

**Bugs Fixed:**
- HOTKEY_NAMES was missing tab_framework (hotkey loss on save/load)
- Code Reviewer: UI said +5% but code used +3%
- Code Reviewer incorrectly applied to clickMultiplier (now auto-only)

### New Masteries (Phase 2.2)
- Stand-Up Sync (+2% click & auto, cost 2)
- Agile Retro (+2% money/line, cost 2)
- Test-Driven Dev (+1% click, cost 1)
- Refactor Pro (+2% auto, cost 2)
- Ship It (+3% money/line, cost 3)

### Phase 2B — Per-Layer Lines & Flux Perks (Complete)

**Per-Layer Line Tracking:**
- Added `seniorLines` field — tracks lines in current senior run
- `seniorPointsToGain` now uses `seniorLines` instead of `totalLinesEver`
- `seniorLines` increments in `writeLines`, resets on senior prestige and framework prestige
- Ascension and higher layers do NOT reset `seniorLines`
- Save version bumped to 10

**Item Pricing Fix:**
- Removed all hard caps (`capOwned` at 5000, `capFlux` at 5000, `capFluxOwned` at 2000)
- Prices now always increase with owned count (no ceiling at $0.10 after ~6300 owned)
- `finite()` guard still protects against Infinity/NaN

**Flux Perk System (3rd Main Item):**
- Added `perkFluxTier` field and `FLUX_THRESHOLDS`/`FLUX_COSTS` arrays
- 7 threshold-based tiers: 25, 100, 1000, 2500, 5000, 7500, 10000
- Each tier multiplies flux power (`%` bonuses: 50, 100, 200, 350, 550, 900, 1450)
- Wired into `linesPerClick`, `UpgradesTab`, `autoUpgrades`
- Flux perk auto-buy supported

**Extended KB/Lint Thresholds:**
- KB/LINT thresholds extended to 12 tiers: up to 10000 owned (was 5000)
- Bonus percentages extended: up to 5500% (was 2000%)
- New perk names for tiers 8-12

---

## In-Progress Work

### Architecture Shift: BigNum Option B

**Goal:** Remove all `number` overflow ceilings. 8 high-growth fields convert from raw `number` to `{ m: mantissa; e: exponent }` objects. Cost functions compute in log-space so `1.12^owned` never hits `Infinity` (even at owned=1,000,000).

**Fields Converting to BigNum (8):**
| Field | Current Type | New Type | Reason |
|---|---|---|---|
| `money` | `number` | `BigNum` | Core currency, no ceiling |
| `lines` | `number` | `BigNum` | Primary resource, unlimited growth |
| `totalLinesEver` | `number` | `BigNum` | Accumulates forever |
| `seniorLines` | `number` | `BigNum` | Accumulates in senior runs |
| `vibeXP` | `number` | `BigNum` | Grows with lines |
| `currentLPS` | `number` | `BigNum` | Display, can be enormous |
| `maxLPS` | `number` | `BigNum` | Historical max |
| `ascensionMultiplier` | `number` | `BigNum` | Grows with every ascension |

**Files Touched (11):**
| File | Type | Change |
|---|---|---|
| `src/utils/BigNum.ts` | **NEW** | ~60 lines: `BN.fromNumber`, `BN.add`, `BN.sub`, `BN.mul`, `BN.div`, `BN.pow`, `BN.lt/gt/gte/eq`, `BN.toString`, `BN.floor` |
| `src/types/game.ts` | Edit | 8 fields → `BigNum`, bump version to 11 |
| `src/utils/math.ts` | Edit | Cost/production return `BigNum`. `formatNum` accepts union. |
| `src/hooks/useGameState.ts` | Edit | `writeLines` BigNum arithmetic. `OfflineGains` BigNum. |
| `src/hooks/useGameActions.ts` | Edit | `handleBuy` BigNum comparisons. |
| `src/utils/autoEditors.ts` | Edit | BigNum cost/money comparison. |
| `src/utils/autoUpgrades.ts` | Edit | BigNum cost comparisons. |
| `src/utils/autoAscension.ts` | Edit | BigNum money threshold. |
| `src/hooks/useJuniorDevBot.ts` | Edit | BigNum cost check. |
| `src/utils/validateState.ts` | Edit | Validate `{ m, e }` objects. |
| `src/utils/migrations.ts` | Edit | **v11**: convert 8 number fields to `{ m, e }`. |

**Guard Pattern:**
All BigNum arithmetic must use the existing `finite()` guard pattern — every operation normalizes mantissa to [1, 10) after computation and catches NaN/Infinity, falling back to `BN.zero` or `BN.one`.

**Migration:** v11 converts `{ lines: 500000 }` → `{ lines: { m: 5, e: 5 } }`. Pre-v11 saves migrate automatically; v11+ saves use BigNum throughout.

---

## Pending Tasks

### Phase 2B � Content Expansion (Remaining)
- Sound effects + background music
- Particle effects on click, screen shake on ascension

### Phase 3 � Desktop Shell (Not Started)
- Tauri or Electron migration
- File-based saves replacing localStorage
- Auto-updater

### Phase 4 � Steamworks (Not Started)
- Steam SDK setup + App ID
- Achievements (30-50)
- Cloud saves
- Overlay + Rich Presence
- Steam Input / controller support

### Phase 5 � Steam Deck & Platform QA (Not Started)

### Phase 6 � Storefront & Launch (Not Started)

---

## Project Constraints

### Tests: 244 passing (8 test files)
- `math.test.ts` — 108 tests (cost formulas, progression, formatting, milestones, price monotonicity, seniorLines)
- `saveLoad.test.ts` — 68 tests (save/load, validation, migration, export/import, offline)
- `autoEditors.test.ts` — 12 tests
- `autoUpgrades.test.ts` — 17 tests (added flux perk auto-buy)
- `autoAscension.test.ts` — 11 tests
- `offlineProgress.test.ts` — 8 tests
- `framework.test.ts` — 17 tests
- `ErrorBoundary.test.tsx` — 3 tests

### Key Architecture Patterns
- `State` is a single flat `GameState` interface (no context/state management library)
- All game state mutations flow through `setState(prev => ...)` or `wrappedSetState`
- Save/load pipeline: `tryLoadFromKey` → `validateState` → `migrateState`
- Pure helpers in `src/utils/` tested independently
- Barrel re-exports from `src/hooks/useGameState.ts`
- Automation wired in `useAutomation.ts` with separate `useRef` timers per system
- BigNum representation: `{ m: number; e: number }` for unbounded values

### Math/Scaling Rules
- Cost scaling: `cost = base * 1.12^owned * 0.95^flux` (min 0.10, computed in log-space post-BigNum)
- XP scaling: `xpForLevel = 100 * 1.5^level`
- Ascension: `ascensionMult = 1 + sqrt(totalLinesEver / 100_000)`
- Senior prestige threshold: `100_000_000` total lines (uses `seniorLines`)
- Framework prestige threshold: `100` total Senior Points
- Framework points: `floor(sqrt(totalSeniorPoints / 100))`
- Framework upgrade cost: `1 * 1.5^level` (min 0.10)
- Offline cap: 24 hours
- All math functions have `finite()` guards (fallback to minimum)

### Nuances for Future Work
- New GameState fields → bump `CURRENT_SAVE_VERSION` + add migration + add to `validateState.ts` lists
- BigNum fields: `{ m: mantissa (1-10), e: exponent (integer) }` — normalize after every operation
- Tests use `makeState(overrides)` pattern with `{ ...defaultState, ...overrides }`
- Nested object validation must deep-copy (`result.x = { ...result.x }`) to avoid mutating `defaultState`
- Automation wiring follows the pattern: pure helper → barrel export → useRef in useAutomation → setState(prev => ...)
- Framework follows same prestige pattern as Senior: pure math function + tab component + wiring
- `npm test && npx tsc -b && npm run build && npx eslint src` is the standard verification command

### Pre-existing Errors Still Present (pre-dating all our work)
- None — all 21 pre-existing TypeScript errors were fixed during Phase 1 cleanup. All lint errors are pre-existing (65 across codebase, mostly `@typescript-eslint/no-explicit-any`).

(End of file - total 132 lines)
