import { useState, useCallback } from "react";

export interface Particle {
  id: number;
  x: number;
  y: number;
  vX: number;
  vY: number;
  hex: string;
  lifetime: number;
  maxLifetime: number;
  text: string;
}

let nextId = 0;

const HEXES = ["#fffb00", "#ff6666", "#66ff66", "#66ffff", "#ff66ff", "#ff8844", "#44ff88", "#ff44ff"];

export function useParticles() {
  const [particles, setParticles] = useState<Particle[]>([]);

  /** Spawn a single particle at (x, y) */
  const spawn = useCallback((x: number, y: number, text = "+") => {
    const hex = HEXES[Math.floor(Math.random() * HEXES.length)];
    const p: Particle = {
      id: ++nextId,
      x: x + (Math.random() - 0.5) * 20,
      y: y - 10,
      vX: (Math.random() - 0.5) * 3,
      vY: -2 - Math.random() * 4,
      hex,
      lifetime: 600,
      maxLifetime: 600,
      text,
    };
    setParticles((prev) => [...prev.slice(-80), p]);
  }, []);

  /** Spawn a burst of multiple particles at (x, y) with optional text */
  const spawnBurst = useCallback((x: number, y: number, count = 8, texts?: string[]) => {
    const newParticles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      const hex = HEXES[Math.floor(Math.random() * HEXES.length)];
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
      const speed = 2 + Math.random() * 4;
      newParticles.push({
        id: ++nextId,
        x: x + (Math.random() - 0.5) * 30,
        y: y - 10,
        vX: Math.cos(angle) * speed,
        vY: Math.sin(angle) * speed - 2,
        hex,
        lifetime: 800,
        maxLifetime: 800,
        text: texts ? texts[i % texts.length] : "+",
      });
    }
    setParticles((prev) => [...prev.slice(-80 + count), ...newParticles]);
  }, []);

  /** Advance particle physics by dt seconds */
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

  return { particles, spawn, spawnBurst, tick };
}