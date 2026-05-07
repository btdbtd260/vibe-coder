import { Terminal, Cpu, Rocket, BarChart3, Cloud, Settings, BookOpen, Package, Bug, Crown } from 'lucide-react';

const nav = [
  { id: 'terminal', label: 'Terminal', icon: Terminal },
  { id: 'upgrades', label: 'Upgrades', icon: Package },
  { id: 'automation', label: 'Auto', icon: Cpu },
  { id: 'ascension', label: 'Ascend', icon: Rocket },
  { id: 'senior', label: 'Senior', icon: Crown },
  { id: 'metrics', label: 'Metrics', icon: BarChart3 },
  { id: 'cloud', label: 'Cloud Shop', icon: Cloud },
  { id: 'config', label: 'Config', icon: Settings },
  { id: 'archive', label: 'Archive', icon: BookOpen },
  { id: 'devconsole', label: 'Dev', icon: Bug, dev: true },
];

export default function Sidebar({ activeTab, onTab }: { activeTab: string; onTab: (t: string) => void }) {
  return (
    <nav className="glass flex flex-col items-center gap-1 py-4 px-2 w-16 lg:w-48 overflow-y-auto max-h-screen transition-all duration-200">
      <h1 className="text-neon-300 text-xs lg:text-sm font-bold mb-6 tracking-widest [writing-mode:vertical-lr] lg:[writing-mode:unset]">
        VIBE CODER
      </h1>
      {nav.map(({ id, label, icon: Icon, dev }) => (
        <button
          key={id}
          onClick={() => onTab(id)}
          className={`flex items-center justify-center lg:justify-start gap-3 w-full px-3 py-2.5 rounded-lg text-xs transition-all duration-150 shrink-0
            ${activeTab === id
              ? 'bg-neon-300/10 text-neon-300 border border-neon-300/30'
              : dev
                ? 'text-red-500/60 hover:text-red-400 hover:bg-red-500/5 border border-transparent'
                : 'text-dark-300 hover:text-dark-100 hover:bg-white/5 border border-transparent'}`}
        >
          <Icon size={18} />
          <span className="hidden lg:inline tracking-wider uppercase">{dev ? 'DEV' : label}</span>
        </button>
      ))}
    </nav>
  );
}
