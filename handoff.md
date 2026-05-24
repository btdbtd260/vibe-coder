# Vibe Coder — Project Handoff

## Current Status: Phase 2B (Content Expansion) — Complete

Phase 1 (Stabilization) = complete.
Phase 2 (Content Expansion) = COMPLETE (2A + 2B finished).

---

## Completed Work

### Phase 1 — Stabilization & Foundation (Complete)

**Save System:**
- Save versioning + migration runner (v1–v12)
- Validation on load (validateState.ts)
- Backup before overwrite + restore on corruption
- Export/import in Config tab
- Debounced save fix (100ms game loop no longer triggers saves)

**Offline Progress:**
- lastSavedAt field + save stamping
- computeOfflineProgress() helper with 24h cap
- Wired into loadState
- Config tab toggle
- Welcome Back overlay

**Core Math & Stability:**
- Vitest setup + 108 math tests + 68 save/load tests
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
- utoBuyEditors(state) — buys ED/KB/Lint/Flux with cheapest/priority, 1x/max, reserve %
- utoBuyUpgrades(state) — buys perk tiers + masteries with money/vibe reserve
- utoAscend(state) — first-layer ascension with threshold/runtime gates
- All 3 wired into useAutomation.ts with independent useRef timers
- 39 dedicated tests for automation pure helpers

### Phase 2B — Content Expansion (Complete)

**The Framework Prestige Layer:**
- Tier 3 prestige unlocked after 100 total Senior Points
- performFrameworkPrestige resets Senior/Ascension/Vibe progress, preserves FP
- FrameworkTab UI with prestige button, FP display, and upgrade rows

**Framework Upgrades:**
- Code Reviewer: +5% auto speed per level (max 10)
- DevOps Pipeline: +5% global production per level (max 10)
- Both with cost scaling (1.5^level) and max level 10

**Extended Content:**
- KB/Lint perks extended: 12 tiers (was 7), up to 10000 owned
- Milestones extended: new 1000-tier segment in checkMilestones
- Flux perk system: 7 threshold-based tiers (25–10000 flux owned)
- Per-layer seniorLines tracking (separate from totalLinesEver)

**Items Pricing Fix:**
- Removed all hard caps (owned, flux, fluxOwned)
- Prices now always increase with owned count (no ceiling)

**Bugs Fixed:**
- HOTKEY_NAMES was missing tab_framework (hotkey loss on save/load)
- Code Reviewer: UI said +5% but code used +3%
- Code Reviewer incorrectly applied to clickMultiplier (now auto-only)
- Duplicate setState(next) call in ascension

### Architecture Shift: BigNum (Complete)

- 8 high-growth fields converted from 
umber to { m: mantissa; e: exponent } objects
- Cost functions compute in log-space so 1.12^owned never hits Infinity
- 76 dedicated BigNum tests (arithmetic, comparison, toString, normalization)
- BNUtil: BN.fromNumber, BN.add, BN.sub, BN.mul, BN.div, BN.pow, BN.lt/gt/gte/eq, BN.toString, BN.floor
- inite() guard pattern applied after every operation (normalize mantissa to [1, 10), catch NaN/Infinity)
- v11 migration: converts 8 number fields to BigNum

### New Masteries (Complete)
- Stand-Up Sync (+2% click & auto, cost 2)
- Agile Retro (+2% money/line, cost 2)
- Test-Driven Dev (+1% click, cost 1)
- Refactor Pro (+2% auto, cost 2)
- Ship It (+3% money/line, cost 3)

### v1.8: Sound, Particles, Music & Visual Polish (Complete)

**Sound Effects System:**
- 5 procedural sound effects (click, buy, ascend, prestige, error) using Web Audio API
- useSound() hook with state sync and mute toggle
- Wired into TerminalTab, UpgradesTab, AscensionTab, SeniorOfficeTab, FrameworkTab

**Particle Effects:**
- useParticles() hook with spawn, spawnBurst, and tick physics
- Particles.tsx overlay component rendering particles as positioned text labels
- 8 color palette, configurable text, radial burst distribution
- rAF-based physics loop (decoupled from 100ms game loop)
- Particles on: click, ascension burst (16 particles), senior prestige (12), framework prestige (16), purchases

**Background Music:**
- Procedural ambient music via Web Audio API (drone + LFO + random chimes)
- MusicManager.ts singleton with start/stop/setEnabled API
- useMusic() hook syncing state.musicEnabled to music system
- ConfigTab toggle button (data-action="toggle-music")
- Save version v12 migration for musicEnabled field

**Button Glow Visual Feedback:**
- uttonGlow(el) utility — applies then removes .button-glow CSS class
- CSS keyframe animation (utton-glow-pulse) — subtle green glow decay
- Applied to: all hotkey actions, buy buttons, prestige buttons, toggle buttons, data actions
- data-action attributes on all interactive elements for querySelector targeting

**Code Quality Improvements:**
- aseMultiplier() extraction — DRY refactor of shared multiplier logic
- Consistent double-quote formatting across all files
- gainsRef refactored to offlineGains state variable
- hotkeysRef.current sync wrapped in useEffect for correctness
- NumberInputControl simplified (removed redundant useEffect)
- Particle rAF loop properly cleaned up on unmount

**Prestige Unlock Notifications:**
- usePrestigeUnlocks() hook — detects first-time access to ascension, senior, framework
- Logs message when new prestige layer becomes available (checked every 3s)

---

## Pending Tasks

### Phase 3 — Desktop Shell (Not Started)
- Tauri or Electron migration
- File-based saves replacing localStorage
- Auto-updater

### Phase 4 — Steamworks (Not Started)
- Steam SDK setup + App ID
- Achievements (30–50)
- Cloud saves
- Overlay + Rich Presence
- Steam Input / controller support

### Phase 5 — Steam Deck & Platform QA (Not Started)

### Phase 6 — Storefront & Launch (Not Started)

---

## Project Constraints

### Tests: 320 passing (9 test files)
- BigNum.test.ts — 76 tests (arithmetic, comparison, formatting, normalization)
- math.test.ts — 108 tests (cost formulas, progression, formatting, milestones, price monotonicity, seniorLines)
- saveLoad.test.ts — 68 tests (save/load, validation, migration, export/import, offline)
- utoEditors.test.ts — 12 tests
- utoUpgrades.test.ts — 17 tests (added flux perk auto-buy)
- utoAscension.test.ts — 11 tests
- offlineProgress.test.ts — 8 tests
- ramework.test.ts — 17 tests
- ErrorBoundary.test.tsx — 3 tests

### Current Save Version: 12
- v11: BigNum conversion (8 fields)
- v12: Added musicEnabled field

### Key Architecture Patterns
- State is a single flat GameState interface (no context/state management library)
- All game state mutations flow through setState(prev => ...) or wrappedSetState
- Save/load pipeline: 	ryLoadFromKey ? alidateState ? migrateState
- Pure helpers in src/utils/ tested independently
- Barrel re-exports from src/hooks/useGameState.ts
- Automation wired in useAutomation.ts with separate useRef timers per system
- BigNum representation: { m: number; e: number } for unbounded values
- Sound/music: procedural Web Audio API, state-synced via hooks
- Particle physics: rAF loop decoupled from game loop (100ms interval)
- Button glow: CSS animation triggered via glowButton() utility + data-action selectors

### Math/Scaling Rules
- Cost scaling: cost = base * 1.12^owned * 0.95^flux (min 0.10, computed in log-space post-BigNum)
- XP scaling: xpForLevel = 100 * 1.5^level
- Ascension: scensionMult = 1 + sqrt(totalLinesEver / 100_000)
- Senior prestige threshold: 100_000_000 total lines (uses seniorLines)
- Framework prestige threshold: 100 total Senior Points
- Framework points: loor(sqrt(totalSeniorPoints / 100))
- Framework upgrade cost: 1 * 1.5^level (min 0.10)
- Offline cap: 24 hours
- All math functions have inite() guards (fallback to minimum)

### Nuances for Future Work
- New GameState fields ? bump CURRENT_SAVE_VERSION + add migration + add to alidateState.ts lists
- BigNum fields: { m: mantissa (1-10), e: exponent (integer) } — normalize after every operation
- Tests use makeState(overrides) pattern with { ...defaultState, ...overrides }
- Nested object validation must deep-copy (esult.x = { ...result.x }) to avoid mutating defaultState
- Automation wiring follows the pattern: pure helper ? barrel export ? useRef in useAutomation ? setState(prev => ...)
- Framework follows same prestige pattern as Senior: pure math function + tab component + wiring
- New hooks follow pattern: pure function in src/utils/ ? React hook in src/hooks/ ? wire in App.tsx
- uttonGlow uses classList.remove/add + setTimeout — DOM element must exist
- usePrestigeUnlocks uses a ired Set to ensure one-time notifications per session
- 
pm test && npx tsc -b && npm run build && npx eslint src is the standard verification command

### Pre-existing Errors Still Present
- None — all 21 pre-existing TypeScript errors were fixed during Phase 1 cleanup. All lint errors are pre-existing (65 across codebase, mostly @typescript-eslint/no-explicit-any).

