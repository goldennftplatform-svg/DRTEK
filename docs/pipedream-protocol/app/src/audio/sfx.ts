// Tiny WebAudio sound layer. No asset files; pure oscillator blips.
// Fully guarded so it never throws on environments without AudioContext.
let ctx: AudioContext | null = null;
function ac(): AudioContext | null {
  if (ctx) return ctx;
  try {
    const Ctor = (window as any).AudioContext || (window as any).webkitAudioContext;
    ctx = Ctor ? new Ctor() : null;
  } catch {
    ctx = null;
  }
  return ctx;
}
function blip(freq: number, dur = 0.08, type: OscillatorType = 'sine', gain = 0.04) {
  const c = ac();
  if (!c) return;
  if (c.state === 'suspended') c.resume().catch(() => {});
  try {
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type;
    o.frequency.value = freq;
    o.connect(g);
    g.connect(c.destination);
    const t = c.currentTime;
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.start(t);
    o.stop(t + dur);
  } catch {
    /* ignore */
  }
}
export const sfx = {
  click() {
    blip(440, 0.05, 'square', 0.03);
  },
  deliver(clean: boolean) {
    clean ? blip(660, 0.12, 'sine', 0.05) : blip(180, 0.18, 'sawtooth', 0.04);
  },
  levelup() {
    blip(523, 0.1, 'sine', 0.05);
    setTimeout(() => blip(784, 0.14, 'sine', 0.05), 90);
  },
  zap() {
    blip(900, 0.06, 'triangle', 0.04);
  },
  quiz(correct: boolean = true) {
    correct ? blip(700, 0.12, 'sine', 0.05) : blip(200, 0.15, 'sawtooth', 0.04);
  }
};
