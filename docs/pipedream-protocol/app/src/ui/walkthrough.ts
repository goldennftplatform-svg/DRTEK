import { el } from './dom';

export interface WalkStep {
  n: number;
  title: string;
  body: string;
  action: string;
  actionId: string;
}

const STEPS: WalkStep[] = [
  {
    n: 1,
    title: 'Your phone',
    body: 'Below is your phone. That\'s where everything happens — apps, messages, choices.',
    action: 'Got it',
    actionId: 'walk-1'
  },
  {
    n: 2,
    title: 'The network',
    body: 'Above is the network. Your data travels through pipes like water. Leaks can siphon it away.',
    action: 'I see it',
    actionId: 'walk-2'
  },
  {
    n: 3,
    title: 'Your guide',
    body: 'Brick (bottom left) tells you exactly what to do, one step at a time. Just follow along.',
    action: "Let's play!",
    actionId: 'walk-3'
  }
];

export class Walkthrough {
  private root!: HTMLElement;
  private stepIdx = 0;
  private overlay!: HTMLElement;
  private card!: HTMLElement;
  private dotsEl!: HTMLElement;
  private onDone!: () => void;

  build(root: HTMLElement, onDone: () => void) {
    this.root = root;
    this.onDone = onDone;
    this.stepIdx = 0;

    this.overlay = el('div', { id: 'walkOverlay' });
    this.card = el('div', { id: 'walkCard' });
    this.dotsEl = el('div', { id: 'walkDots' });

    for (let i = 0; i < STEPS.length; i++) {
      const dot = el('span', { className: 'walk-dot' });
      this.dotsEl.append(dot);
    }

    this.overlay.append(this.card);
    this.root.append(this.overlay);

    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) this.next();
    });

    this.render();
  }

  next() {
    sfx_click();
    this.stepIdx++;
    if (this.stepIdx >= STEPS.length) {
      this.overlay.remove();
      this.onDone();
      return;
    }
    this.render();
  }

  private render() {
    const s = STEPS[this.stepIdx];
    const dots = this.dotsEl.querySelectorAll('.walk-dot');
    dots.forEach((d, i) => d.classList.toggle('active', i <= this.stepIdx));

    this.card.innerHTML = '';
    this.card.append(this.dotsEl);

    const num = el('div', { className: 'walk-num', textContent: String(s.n) });
    const title = el('div', { className: 'walk-title', textContent: s.title });
    const body = el('div', { className: 'walk-body', textContent: s.body });
    const btn = el('button', { className: 'walk-btn', textContent: s.action, id: s.actionId });
    btn.onclick = () => this.next();
    const hint = el('div', { className: 'walk-hint', textContent: 'or tap anywhere to continue' });
    this.card.append(num, title, body, btn, hint);

    this.overlay.classList.remove('fade-in');
    void this.overlay.offsetWidth;
    this.overlay.classList.add('fade-in');
  }
}

function sfx_click() {
  try {
    const Ctor = (window as any).AudioContext || (window as any).webkitAudioContext;
    const ctx = Ctor ? new Ctor() : null;
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'square';
    o.frequency.value = 440;
    o.connect(g); g.connect(ctx.destination);
    const t = ctx.currentTime;
    g.gain.setValueAtTime(0.03, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
    o.start(t); o.stop(t + 0.05);
  } catch {}
}
