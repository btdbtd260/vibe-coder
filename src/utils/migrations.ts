import type { GameState } from '../types/game';

export const CURRENT_SAVE_VERSION = 4;

type Migration = (state: GameState) => GameState;

const migrations: Record<number, Migration> = {
  4: (s) => ({ ...s, onboardingSeen: true }),
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
