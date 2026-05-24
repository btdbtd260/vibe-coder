import { AnimatePresence, motion } from "motion/react";
import type { Toast } from "../../hooks/useNotificationToast";

const TYPE_STYLES: Record<Toast["type"], string> = {
  info: "border-neon-300/30 bg-neon-300/5 text-neon-300",
  success: "border-green-400/30 bg-green-400/5 text-green-400",
  prestige: "border-yellow-400/30 bg-yellow-400/5 text-yellow-400",
  error: "border-red-400/30 bg-red-400/5 text-red-400",
};

export default function NotificationToast({
  toasts,
  onDismiss,
}: {
  toasts: Toast[];
  onDismiss: (id: number) => void;
}) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 80, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 80, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            onClick={() => onDismiss(toast.id)}
            className={`pointer-events-auto cursor-pointer px-4 py-2 rounded-lg border text-[0.7rem] font-bold uppercase tracking-wider shadow-lg ${TYPE_STYLES[toast.type]}`}
          >
            {toast.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
