# Checkpoint: v1.6
## Timestamp: 2026-05-12 20:25

---

## Tests

| File | Tests | Status |
|------|-------|--------|
| `math.test.ts` | 106 | ? All pass |
| `saveLoad.test.ts` | 68 | ? All pass |
| `autoEditors.test.ts` | 12 | ? All pass |
| `autoUpgrades.test.ts` | 16 | ? All pass |
| `autoAscension.test.ts` | 11 | ? All pass |
| `offlineProgress.test.ts` | 8 | ? All pass |
| `ErrorBoundary.test.tsx` | 3 | ? All pass |
| `framework.test.ts` | 17 | ? All pass |
| **Total** | **241** | **? 241/241 pass** |

---

## Build

| Check | Result |
|-------|--------|
| `npx tsc -b` | ? 0 errors |
| `npm run build` | ? Vite build succeeds (404 KB JS, 23 KB CSS) |

---

## Changes Since v1.5

### Phase 2B — The Framework Prestige Layer (Complete)

**New Prestige Layer:**
- Tier 3 prestige unlocked after 100 total Senior Points
- `FRAMEWORK_PRESTIGE_THRESHOLD = 100` total SP
- `frameworkPointsToGain` — sqrt-scaling FP gain from totalSeniorPoints
- `performFrameworkPrestige` — resets Senior + Ascension + Vibe progress, preserves FP
- FrameworkTab UI with prestige button, FP display, and upgrade rows
- Wired into App (tab component), Sidebar (nav), hotkeys (tab_framework)

**Framework Upgrades:**
- Code Reviewer: +5% auto speed per level (max 10) — 3 FP base, 1.5^level scaling
- DevOps Pipeline: +5% global production per level (max 10) — 3 FP base, 1.5^level scaling
- Both wired into autoMultiplier; DevOps also in clickMultiplier (global)

**Extended Perk Thresholds:**
- KB_THRESHOLDS/LINT_THRESHOLDS extended from 7?10 entries (up to 5000 owned)
- KB_COSTS/LINT_COSTS extended with higher tiers (up to 10^10)
- KB_PERK_PCTS/LINT_PERK_MULTS extended from 8?11 entries (up to 20x mult)
- Perk names already wired: Quantum Keyboard, Plasma Interface, Neural Implant (KB); AI Overlord, Singularity Linter, Cosmic Code (Lint)

**Extended Milestones:**
- `checkMilestones` now has a 1000-tier segment (every 500 owned, capped at 60 doublings)
- Scales automationLPS further into endgame

**Validation & Migration:**
- Save version bumped to 9 with no-op migration
- All 5 new GameState fields validated (NUMERIC_GE0)
- `tab_framework` hotkey validated (was missing from HOTKEY_NAMES)

**Bugs Fixed:**
- HOTKEY_NAMES missing `tab_framework` ? framework tab hotkey would be lost on save/load
- Code Reviewer: UI said +5% but code used +3% (0.05 correct ? 0.03 incorrect)
- Code Reviewer applied to clickMultiplier (should be auto-only per UI description)

### Size
~404 KB JS bundle, ~2,166 modules transformed

---

## Completed Tasks
- [x] Phase 1: Stabilization & Foundation
- [x] Phase 2A: Automation System
- [x] Phase 2B.1: Framework prestige layer (GameState, math, UI, tests, wiring)
- [x] Phase 2B.2: Framework upgrades (Code Reviewer, DevOps Pipeline)
- [x] Phase 2B.3: Extended perk thresholds (10 tiers for KB/Lint)
- [x] Phase 2B.4: Extended milestones (1000-tier linter milestone segment)
- [x] Phase 2B.Bugs: HOTKEY_NAMES fix, Code Reviewer % fix, auto-only fix

---

## Pending Tasks
- [ ] Phase 2B: Sound effects + background music
- [ ] Phase 2B: Visual effects (particles, screen shake)
- [ ] Phase 3: Desktop shell (Tauri/Electron)
- [ ] Phase 4: Steamworks integration
- [ ] Phase 5: Steam Deck & platform QA
- [ ] Phase 6: Storefront & launch

---

## Blocking Issues
- None. All 241 tests pass, tsc is clean, build succeeds.

---

## Next Steps
1. Remaining Phase 2B content (sound/music, visual effects)
2. Phase 3 desktop shell (Tauri/Electron)
