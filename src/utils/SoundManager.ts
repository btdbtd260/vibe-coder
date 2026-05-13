/**
 * SoundManager - procedural sound effects using Web Audio API.
 * No external audio files needed. All sounds are synthesized.
 */

let audioCtx: AudioContext | null = null;
let _enabled = true;

function getCtx(): AudioContext | null {
  if (!_enabled) return null;
  if (!audioCtx) {
    try { audioCtx = new AudioContext(); } catch { return null; }
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

const MASTER_VOL = 0.15;

export function playClick(): void {
  const ctx = getCtx();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "square";
  osc.frequency.setValueAtTime(800, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.06);
  gain.gain.setValueAtTime(MASTER_VOL, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.08);
}

export function playBuy(): void {
  const ctx = getCtx();
  if (!ctx) return;
  const now = ctx.currentTime;
  [523.25, 659.25].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, now + i * 0.08);
    gain.gain.setValueAtTime(MASTER_VOL * 0.7, now + i * 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.12);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now + i * 0.08);
    osc.stop(now + i * 0.08 + 0.12);
  });
}

export function playAscend(): void {
  const ctx = getCtx();
  if (!ctx) return;
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(200, now);
  osc.frequency.exponentialRampToValueAtTime(1200, now + 0.4);
  gain.gain.setValueAtTime(MASTER_VOL * 0.5, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.5);
}

export function playPrestige(): void {
  const ctx = getCtx();
  if (!ctx) return;
  const now = ctx.currentTime;
  [261.63, 329.63, 392.0].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(freq * 3, now + 0.6);
    gain.gain.setValueAtTime(MASTER_VOL * 0.4, now + i * 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.05 + 0.7);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now + i * 0.05);
    osc.stop(now + i * 0.05 + 0.7);
  });
  const low = ctx.createOscillator();
  const lowGain = ctx.createGain();
  low.type = "sine";
  low.frequency.setValueAtTime(55, now);
  lowGain.gain.setValueAtTime(MASTER_VOL * 0.6, now + 0.1);
  lowGain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
  low.connect(lowGain);
  lowGain.connect(ctx.destination);
  low.start(now + 0.1);
  low.stop(now + 0.8);
}

export function playError(): void {
  const ctx = getCtx();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "square";
  osc.frequency.setValueAtTime(150, ctx.currentTime);
  gain.gain.setValueAtTime(MASTER_VOL * 0.4, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.2);
}

export function setSoundEnabled(enabled: boolean): void {
  _enabled = enabled;
  if (!enabled && audioCtx) {
    audioCtx.close().catch(() => {});
    audioCtx = null;
  }
}

export function isSoundEnabled(): boolean {
  return _enabled;
}

