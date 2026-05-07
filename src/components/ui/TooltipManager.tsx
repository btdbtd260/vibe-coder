import { createContext, useContext, useState, useCallback, useRef, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';

interface TooltipState {
  title: string;
  long: string;
  mechanic: string;
  x: number;
  y: number;
}

interface TooltipContextType {
  showTooltip: (content: Omit<TooltipState, 'x' | 'y'>, e: MouseEvent | React.MouseEvent | React.FocusEvent) => void;
  hideTooltip: () => void;
  tooltipHandlers: {
    onMouseEnter: (e: React.MouseEvent) => void;
    onMouseMove: (e: React.MouseEvent) => void;
    onMouseLeave: () => void;
    onFocus: (e: React.FocusEvent) => void;
    onBlur: () => void;
    onClick: (e: React.MouseEvent) => void;
  };
}

const TooltipContext = createContext<TooltipContextType>(null!);

export function TooltipProvider({ children }: { children: ReactNode }) {
  const [tip, setTip] = useState<TooltipState | null>(null);
  const touchActiveRef = useRef(false);
  const isTouch = typeof window !== 'undefined' && 'ontouchstart' in window;

  const showTooltip = useCallback((content: Omit<TooltipState, 'x' | 'y'>, e: any) => {
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const x = (e as React.MouseEvent).clientX ?? rect.left + rect.width / 2;
    const y = (e as React.MouseEvent).clientY ?? rect.top - 8;
    setTip({ ...content, x: x + 12, y: y + 12 });
  }, []);

  const hideTooltip = useCallback(() => setTip(null), []);

  const handlers = {
    onMouseEnter: (e: React.MouseEvent) => {},
    onMouseMove: (e: React.MouseEvent) => {
      if (!isTouch) {
        const rect = (e.target as HTMLElement).getBoundingClientRect();
        setTip(prev => prev ? { ...prev, x: e.clientX + 12, y: e.clientY + 12 } : null);
      }
    },
    onMouseLeave: () => { if (!isTouch) hideTooltip(); },
    onFocus: (e: React.FocusEvent) => {
      const rect = (e.target as HTMLElement).getBoundingClientRect();
      if (tip) setTip({ ...tip, x: rect.left, y: rect.top - 8 });
    },
    onBlur: () => hideTooltip(),
    onClick: (e: React.MouseEvent) => {
      if (isTouch) {
        if (touchActiveRef.current) {
          touchActiveRef.current = false;
          hideTooltip();
        } else {
          touchActiveRef.current = true;
          const rect = (e.target as HTMLElement).getBoundingClientRect();
          const target = (e.target as HTMLElement).dataset.tooltip;
          if (target) {
            try {
              const data = JSON.parse(target);
              setTip({ ...data, x: rect.left + rect.width / 2, y: rect.top - 8 });
            } catch {}
          }
          setTimeout(() => { touchActiveRef.current = false; }, 3000);
        }
      }
    },
  };

  return (
    <TooltipContext.Provider value={{ showTooltip, hideTooltip, tooltipHandlers: handlers }}>
      {children}
      <AnimatePresence>
        {tip && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ duration: 0.12 }}
            style={{ position: 'fixed', left: tip.x, top: tip.y, zIndex: 9999, pointerEvents: 'none' }}
            className="glass p-3 max-w-xs text-[0.65rem] leading-relaxed"
          >
            <div className="text-neon-300 font-bold mb-1 uppercase tracking-wider">{tip.title}</div>
            <div className="text-dark-200 mb-1">{tip.long}</div>
            <div className="text-dark-400 italic mt-1 border-t border-dark-600 pt-1">{tip.mechanic}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </TooltipContext.Provider>
  );
}

export function useTooltip(content: Omit<TooltipState, 'x' | 'y'> | null) {
  const ctx = useContext(TooltipContext);
  if (!ctx) throw new Error('useTooltip needs TooltipProvider');

  if (!content) return { tooltipHandlers: ctx.tooltipHandlers };

  const wrap = (fn: (e: any) => void) => (e: any) => {
    ctx.showTooltip(content, e);
    fn(e);
  };

  return {
    tooltipHandlers: {
      onMouseEnter: wrap(ctx.tooltipHandlers.onMouseEnter),
      onMouseMove: (e: React.MouseEvent) => {
        const rect = (e.target as HTMLElement).getBoundingClientRect();
        const isTouch = typeof window !== 'undefined' && 'ontouchstart' in window;
        if (!isTouch) ctx.showTooltip(content, e);
      },
      onMouseLeave: ctx.tooltipHandlers.onMouseLeave,
      onFocus: (e: React.FocusEvent) => {
        const rect = (e.target as HTMLElement).getBoundingClientRect();
        ctx.showTooltip(content, e);
      },
      onBlur: ctx.tooltipHandlers.onBlur,
      onClick: (e: React.MouseEvent) => {
        const target = (e.target as HTMLElement);
        target.dataset.tooltip = JSON.stringify(content);
        ctx.tooltipHandlers.onClick(e);
      },
    },
  };
}
