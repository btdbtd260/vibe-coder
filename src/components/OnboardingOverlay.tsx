import { motion, AnimatePresence } from "motion/react";

interface Props {
  onDismiss: () => void;
}

export default function OnboardingOverlay({ onDismiss }: Props) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="glass-card p-6 w-80 max-w-[90vw] text-center"
        >
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-sm text-neon-300 uppercase tracking-wider mb-4"
          >
            Welcome to Vibe Coder
          </motion.h2>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="space-y-2 text-[0.7rem] text-dark-200 mb-4 leading-relaxed"
          >
            <p>Click the terminal to write code and earn lines + money.</p>
            <p>Buy upgrades and automation to accelerate your progress.</p>
          </motion.div>
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            onClick={onDismiss}
            className="w-full py-2.5 rounded border border-neon-300/40 text-neon-300 text-xs hover:bg-neon-300/10 cursor-pointer uppercase tracking-wider transition-all"
          >
            Get Started
          </motion.button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
