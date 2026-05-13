# Vibe Coder — Project Handoff

## Current Status: 2 / 5 phases through Steam Release roadmap

Phase 1 (Stabilization) = complete.
Phase 2 (Content Expansion) = 80% complete (2A finished, 2B at 80%).

---

## Completed Work

### Phase 1 — Stabilization & Foundation (Complete)

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

### Phase 2A — Automation System (Complete)

- 3 nested settings objects in GameState (autoEditors, autoUpgrades, autoAscension)
- AutomationTab UI with toggles, steppers, and typed interval inputs
- `autoBuyEditors(state)` — buys ED/KB/Lint/Flux with cheapest/priority, 1x/max, reserve %
- `autoBuyUpgrades(state)` — buys perk tiers + masteries with money/vibe reserve
- `autoAscend(state)` — first-layer ascension with threshold/runtime gates
- All 3 wired into useAutomation.ts with independent useRef timers
- 39 dedicated tests for automation pure helpers

### Phase 2B — The Framework Prestige Layer (Complete)

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

---

## Pending Tasks

### Phase 2B — Content Expansion (Remaining)
- Sound effects + background music
- Particle effects on click, screen shake on ascension

### Phase 3 — Desktop Shell (Not Started)
- Tauri or Electron migration
- File-based saves replacing localStorage
- Auto-updater

### Phase 4 — Steamworks (Not Started)
- Steam SDK setup + App ID
- Achievements (30-50)
- Cloud saves
- Overlay + Rich Presence
- Steam Input / controller support

### Phase 5 — Steam Deck & Platform QA (Not Started)

### Phase 6 — Storefront & Launch (Not Started)

---

## Project Constraints

### Tests: 241 passing (8 test files)
- `math.test.ts` — 106 tests (cost formulas, progression, formatting, milestones)
- `saveLoad.test.ts` — 68 tests (save/load, validation, migration, export/import, offline)
- `autoEditors.test.ts` — 12 tests
- `autoUpgrades.test.ts` — 16 tests
- `autoAscension.test.ts` — 11 tests
- `offlineProgress.test.ts` — 8 tests
- `framework.test.ts` — 17 tests
- `ErrorBoundary.test.tsx` — 3 tests

### Key Architecture Patterns
- `State` is a single flat `GameState` interface (no context/state management library)
- All game state mutations flow through `setState(prev => ...)` or `wrappedSetState`
- Save/load pipeline: `tryLoadFromKey` ? `validateState` ? `migrateState`
- Pure helpers in `src/utils/` tested independently
- Barrel re-exports from `src/hooks/useGameState.ts`
- Automation wired in `useAutomation.ts` with separate `useRef` timers per system

### Math/Scaling Rules
- Cost scaling: `cost = base * 1.12^owned * 0.95^flux` (min 0.10)
- XP scaling: `xpForLevel = 100 * 1.5^level`
- Ascension: `ascensionMult = 1 + sqrt(totalLinesEver / 100_000)`
- Senior prestige threshold: `100_000_000` total lines
- Framework prestige threshold: `100` total Senior Points
- Framework points: `floor(sqrt(totalSeniorPoints / 100))`
- Framework upgrade cost: `1 * 1.5^level` (min 0.10)
- Offline cap: 24 hours
- All math functions have `finite()` guards (fallback to minimum)

### Nuances for Future Work
- New GameState fields ? bump `CURRENT_SAVE_VERSION` + add no-op migration + add to `validateState.ts` lists
- Tests use `makeState(overrides)` pattern with `{ ...defaultState, ...overrides }`
- Nested object validation must deep-copy (`result.x = { ...result.x }`) to avoid mutating `defaultState`
- Automation wiring follows the pattern: pure helper ? barrel export ? useRef in useAutomation ? setState(prev => ...)
- Framework follows same prestige pattern as Senior: pure math function + tab component + wiring
- `npm test && npx tsc -b && npm run build` is the standard verification command

### Pre-existing Errors Still Present (pre-dating all our work)
- None — all 21 pre-existing TypeScript errors were fixed during Phase 1 cleanup.

(End of file - total 132 lines)
