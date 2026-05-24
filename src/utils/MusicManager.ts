let audioCtx: AudioContext | null = null;

const MASTER_VOL = 0.05;

function getCtx(): AudioContext | null {
  if (!audioCtx) {
    try {
      audioCtx = new AudioContext();
    } catch {
      return null;
    }
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

let droneOsc: OscillatorNode | null = null;
let droneGain: GainNode | null = null;
let lfoOsc: OscillatorNode | null = null;
let lfoGain: GainNode | null = null;
let _enabled = false;
let chimeInterval: ReturnType<typeof setInterval> | null = null;

export function startMusic(): void {
  if (_enabled) return;
  _enabled = true;
  const ctx = getCtx();
  if (!ctx) return;

  const now = ctx.currentTime;

  droneGain = ctx.createGain();
  droneGain.gain.setValueAtTime(MASTER_VOL, now);
  droneGain.connect(ctx.destination);

  droneOsc = ctx.createOscillator();
  droneOsc.type = "sine";
  droneOsc.frequency.setValueAtTime(55, now);
  droneOsc.connect(droneGain);
  droneOsc.start(now);

  lfoGain = ctx.createGain();
  lfoGain.gain.setValueAtTime(MASTER_VOL * 0.5, now);
  lfoGain.connect(droneGain.gain);

  lfoOsc = ctx.createOscillator();
  lfoOsc.type = "sine";
  lfoOsc.frequency.setValueAtTime(0.15, now);
  lfoOsc.connect(lfoGain);
  lfoOsc.start(now);

  scheduleChime(ctx);
  chimeInterval = setInterval(() => {
    const c = getCtx();
    if (c) scheduleChime(c);
  }, 12000);
}

function scheduleChime(ctx: AudioContext): void {
  if (!_enabled) return;
  const now = ctx.currentTime;
  const baseFreq = 220 + Math.random() * 440;
  const count = 1 + Math.floor(Math.random() * 3);
  for (let i = 0; i < count; i++) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(baseFreq * (1 + i * 0.5), now + i * 0.15);
    gain.gain.setValueAtTime(MASTER_VOL * 0.3, now + i * 0.15);
    gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.15 + 2);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now + i * 0.15);
    osc.stop(now + i * 0.15 + 2);
  }
}

export function stopMusic(): void {
  _enabled = false;
  if (chimeInterval) {
    clearInterval(chimeInterval);
    chimeInterval = null;
  }
  try {
    droneOsc?.stop();
    lfoOsc?.stop();
  } catch {
    /* already stopped */
  }
  droneOsc = null;
  droneGain = null;
  lfoOsc = null;
  lfoGain = null;
}

export function setMusicEnabled(enabled: boolean): void {
  if (enabled) {
    startMusic();
  } else {
    stopMusic();
  }
}

export function isMusicEnabled(): boolean {
  return _enabled;
}
