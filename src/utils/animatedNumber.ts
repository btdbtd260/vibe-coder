import { useState, useRef, useEffect } from "react";

export function useAnimatedNumber(target: number, duration = 200): number {
  const [display, setDisplay] = useState(target);
  const rafRef = useRef(0);
  const animatedRef = useRef(target);

  useEffect(() => {
    const start = performance.now();
    const from = animatedRef.current;
    cancelAnimationFrame(rafRef.current);

    const animate = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      const current = from + (target - from) * eased;
      animatedRef.current = current;
      setDisplay(current);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);

  return display;
}
