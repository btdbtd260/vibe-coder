import type { GameState } from '../types/game';
import { fromNumber, BN_ZERO } from './BigNum';

export const CURRENT_SAVE_VERSION = 11;

type Migration = (state: GameState) => GameState;

const migrations: Record<number, Migration> = {
  4: (s) => ({ ...s, onboardingSeen: true }),
  5: (s) => ({ ...s }),
  6: (s) => ({ ...s }),
  7: (s) => ({ ...s }),
  8: (s) => ({ ...s }),
  9: (s) => ({ ...(s as any), frameworkPoints: 0, totalFrameworkPoints: 0, frameworkLevel: 0, frameworkCodeReview: 0, frameworkDevOps: 0 }) as GameState,
  10: (s) => ({ ...(s as any), seniorLines: BN_ZERO, perkFluxTier: 0 }) as GameState,
  11: (s) => ({
    ...(s as any),
    lines: typeof (s as any).lines === 'number' ? fromNumber((s as any).lines) : (s as any).lines,
    money: typeof (s as any).money === 'number' ? fromNumber((s as any).money) : (s as any).money,
    totalLinesEver: typeof (s as any).totalLinesEver === 'number' ? fromNumber((s as any).totalLinesEver) : (s as any).totalLinesEver,
    seniorLines: typeof (s as any).seniorLines === 'number' ? fromNumber((s as any).seniorLines) : (s as any).seniorLines,
    vibeXP: typeof (s as any).vibeXP === 'number' ? fromNumber((s as any).vibeXP) : (s as any).vibeXP,
    currentLPS: typeof (s as any).currentLPS === 'number' ? fromNumber((s as any).currentLPS) : (s as any).currentLPS,
    maxLPS: typeof (s as any).maxLPS === 'number' ? fromNumber((s as any).maxLPS) : (s as any).maxLPS,
    ascensionMultiplier: typeof (s as any).ascensionMultiplier === 'number' ? fromNumber((s as any).ascensionMultiplier) : (s as any).ascensionMultiplier,
  }) as GameState,
};

export function migrateState(state: GameState): GameState {
  let result = { ...state };
  while (result.version < CURRENT_SAVE_VERSION) {
    const target = result.version + 1;
    const migrate = migrations[target];
    if (migrate) {
      result = { ...migrate(result), version: target };
    } else {
      result = { ...result, version: target };
    }
  }
  return result;
}
