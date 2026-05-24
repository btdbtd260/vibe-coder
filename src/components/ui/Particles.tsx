import { useRef } from "react";
import type { Particle } from "../../hooks/useParticles";

interface Props {
  particles: Particle[];
}

export default function Particles({ particles }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);

  if (particles.length === 0) return null;

  return (
    <div ref={ref} className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map((p) => {
        const opacity = Math.max(0, Math.min(1, p.lifetime / p.maxLifetime));
        return (
          <div
            key={p.id}
            className="absolute text-xs font-bold select-none"
            style={{
              left: p.x,
              top: p.y,
              color: p.hex,
              opacity: opacity,
              transform: "rotate(" + (p.vX * 50) + "deg)",
              textShadow: "0 0 4px " + p.hex + ", 0 0 8px " + p.hex,
              transition: "none",
              fontSize: p.text.length > 1 ? "0.75rem" : "0.875rem",
            }}
          >
            {p.text}
          </div>
        );
      })}
    </div>
  );
}