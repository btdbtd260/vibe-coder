interface Props {
  onDismiss: () => void;
}

export default function OnboardingOverlay({ onDismiss }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="glass-card p-6 w-80 max-w-[90vw] text-center">
        <h2 className="text-sm text-neon-300 uppercase tracking-wider mb-4">Welcome to Vibe Coder</h2>
        <div className="space-y-2 text-[0.7rem] text-dark-200 mb-4 leading-relaxed">
          <p>Click the terminal to write code and earn lines + money.</p>
          <p>Buy upgrades and automation to accelerate your progress.</p>
        </div>
        <button
          onClick={onDismiss}
          className="w-full py-2.5 rounded border border-neon-300/40 text-neon-300 text-xs hover:bg-neon-300/10 cursor-pointer uppercase tracking-wider transition-all"
        >
          Get Started
        </button>
      </div>
    </div>
  );
}
