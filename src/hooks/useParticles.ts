import { useState, useCallback } from "react";

export interface Particle {
  id: number;
  x: number;
  y: number;
  vX: number;
  vY: number;
  hex: string;
  lifetime: number;
}

let nextId = 0;

export function useParticles() {
  const [particles, setParticles] = useState<Particle[]>([]);

  const spawn = useCallback((x: number, y: number) => {
    const hexes = ["#fffb00", "#ff6666", "#66ff66", "#66ffff", "#ff66ff"];
    const hex = hexes[Math.floor(Math.random() * hexes.length)];
    const p: Particle = {
      id: ++nextId,
      x: x + (Math.random() - 0.5) * 20,
      y: y - 10,
      vX: (Math.random() - 0.5) * 3,
      vY: -2 - Math.random() * 4,
      hex,
      lifetime: 600,
    };
    setParticles((prev) => [...prev.slice(-80), p]);
  }, []);

  const tick = useCallback((dt: number) => {
    setParticles((prev) => {
      const alive = prev.filter((p) => p.lifetime > 0);
      if (alive.length === 0) return [];
      return alive.map((p) => ({
        ...p,
        x: p.x + p.vX * dt * 60,
        y: p.y + p.vY * dt * 60,
        vY: p.vY + 200 * dt,
        lifetime: p.lifetime - dt * 1000,
      }));
    });
  }, []);

  return { particles, spawn, tick };
}
