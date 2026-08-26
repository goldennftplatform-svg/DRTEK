// Lightweight, dependency-free game state with a tiny event emitter.
// (GDD 11.2: State/Event architecture. Swap for Zustand without touching callers.)

export type CohortId = 't' | 'y' | 'p' | 'm';

export const LEVEL_XP = [0, 300, 800, 1500, 2500, 3800];

// Pipe skins cycle on level-up (cyan -> green -> gold -> violet).
export const PIPE_SKINS = [
  { core: 0x22d3ee, glow: 0x22d3ee },
  { core: 0x34d399, glow: 0x34d399 },
  { core: 0xfbbf24, glow: 0xfbbf24 },
  { core: 0xa78bfa, glow: 0xa78bfa }
];

type Listener = (payload?: any) => void;

export class GameState {
  xp = 0;
  cw = 100;
  level = 1;
  combo = 0;
  bestCombo = 0;
  sent = 0;
  leaksZapped = 0;
  lessonIdx = 0;
  quizOpen = false;

  private listeners: Record<string, Listener[]> = {};

  on(ev: string, cb: Listener) {
    (this.listeners[ev] ||= []).push(cb);
  }
  emit(ev: string, payload?: any) {
    (this.listeners[ev] || []).forEach((f) => f(payload));
  }

  comboMult(): number {
    return Math.min(3, 1 + Math.floor(this.combo / 3) * 0.5);
  }

  addXp(n: number) {
    this.xp += n;
    let lvl = 1;
    for (let i = 0; i < LEVEL_XP.length; i++) if (this.xp >= LEVEL_XP[i]) lvl = i + 1;
    if (lvl > this.level) {
      this.level = lvl;
      this.emit('levelup', lvl);
    }
    this.emit('change');
  }

  registerDeliver(clean: boolean) {
    this.sent++;
    if (clean) {
      this.combo++;
      this.bestCombo = Math.max(this.bestCombo, this.combo);
      this.addXp(Math.round(30 * this.comboMult()));
    } else {
      this.combo = 0;
      this.cw = Math.max(0, this.cw - 8);
      this.addXp(5);
    }
    this.emit('change');
  }

  penalizeCw(n: number) {
    this.cw = Math.max(0, this.cw - n);
    this.emit('change');
  }
  rewardCw(n: number) {
    this.cw = Math.min(100, this.cw + n);
    this.emit('change');
  }

  // Gentle passive CW decay — creates urgency without being punishing.
  // ~0.12/sec at level 1, scales up slightly with level.
  tickDt(dtSec: number) {
    const rate = 0.12 + this.level * 0.02;
    const drop = rate * dtSec;
    if (this.cw > 0) {
      this.cw = Math.max(0, this.cw - drop);
      this.emit('change');
    }
  }
}
