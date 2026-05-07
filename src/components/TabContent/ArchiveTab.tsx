import type { GameState } from '../../types/game';
import { LORE_ENTRIES } from '../../data/lore';
import { rot13 } from '../../utils/cipher';
import { FileCode, Bot, Zap, FileText, Brain, Rocket, Eye, Triangle, Shield, Award, Star, Infinity } from 'lucide-react';

const ICON_MAP: Record<string, React.ComponentType<any>> = {
  FileCode, Bot, Zap, FileText, Brain, Rocket, Eye, Triangle, Shield, Award, Star, Infinity,
};

export default function ArchiveTab({ state }: { state: GameState }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {LORE_ENTRIES.map(entry => {
        const unlocked = entry.unlockCondition(state);
        const Icon = ICON_MAP[entry.icon] || FileCode;
        return (
          <div
            key={entry.id}
            className={`glass-card p-3 transition-all ${unlocked ? 'border-neon-300/20' : 'opacity-50'}`}
          >
            <div className="flex items-center gap-2 mb-1">
              <Icon size={14} className={unlocked ? 'text-neon-300' : 'text-dark-500'} />
              <span className={`text-[0.65rem] uppercase tracking-wider ${unlocked ? 'text-neon-300' : 'text-dark-500'}`}>
                {unlocked ? entry.title : '???'}
              </span>
            </div>
            <p className={`text-[0.65rem] leading-relaxed ${unlocked ? 'text-dark-200' : 'blur-sm select-none text-dark-500'}`}>
              {unlocked ? rot13(entry.encrypted) : '⁂⁂⁂ ENCRYPTED FRAGMENT ⁂⁂⁂'}
            </p>
            {!unlocked && (
              <p className="text-[0.55rem] text-dark-500 mt-1 italic">Locked — keep coding to decrypt</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
