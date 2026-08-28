import { Application, Container, Graphics, Text } from 'pixi.js';
import { Trace, type Point } from '../engine/trace';
import { PIPE_SKINS } from '../engine/state';

interface WBNode {
  x: number;
  y: number;
  label: string;
}
interface Leak {
  x: number;
  y: number;
  r: number;
  life: number;
  spin: number;
}
interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: number;
}
interface Floater {
  t: Text;
  life: number;
}
interface TrackerFish {
  angle: number;
  dist: number;
  speed: number;
  life: number;
  size: number;
}
interface SiphonDrop {
  x: number;
  y: number;
  vy: number;
  life: number;
}
interface Thief {
  prog: number;
  speed: number;
  pulse: number;
}
interface Boss {
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  flash: number;
  t: number;
}

// The living whiteboard: nodes, pipes, traveling buckets, leaks, particles, floaters.
// Pure renderer driven by Trace/state; no game rules live here (GDD 11.2).
export class Whiteboard {
  app!: Application;
  private parent!: HTMLElement;
  private w = 800;
  private h = 480;

  private gridG = new Graphics();
  private pipesG = new Graphics();
  private nodesG = new Graphics();
  private labels = new Container();
  private dynamicG = new Graphics();
  private flashG = new Graphics();
  private floatersC = new Container();

  private nodeLabels: Text[] = [];
  private nodes: WBNode[] = [];

  private skin = 0;
  private xray = false;
  private flash = 0;

  private bucket: { trace: Trace; clean: boolean; delivered: boolean } | null = null;
  private leaks: Leak[] = [];
  private particles: Particle[] = [];
  private floaters: Floater[] = [];
  private trackerFish: TrackerFish[] = [];
  private siphonDrops: SiphonDrop[] = [];
  private cohort: string = 'y';
  private thieves: Thief[] = [];
  private thiefTimer = 0;
  private boss: Boss | null = null;

  // Concept overlays per level (encryption / privacy / metadata / footprint / 2fa / safe-browse)
  private encOn = false;
  private privOn = false;
  private metaOn = false;
  private footOn = false;
  private tfaOn = false;
  private safeOn = false;
  private overlayG = new Graphics();
  private metaLabels: Text[] = [];
  private ghostPaths: { x: number; y: number }[][] = [];

  // Network-map decoys (phishing level): impostor/ads nodes drawn over the map.
  private showDecoy = false;
  private decoyDefs = [
    { rx: 0.28, ry: 0.24, label: 'ADS' },
    { rx: 0.62, ry: 0.82, label: 'IMPOSTOR' }
  ];
  private decoyLabels: Text[] = [];

  onDeliver?: (clean: boolean) => void;
  onFrame?: (dtSec: number) => void;
  onThiefMissed?: () => void;

  async init(parent: HTMLElement) {
    this.parent = parent;
    this.app = new Application();
    await this.app.init({
      background: 0x0b1220,
      antialias: true,
      resizeTo: parent,
      autoDensity: true,
      resolution: Math.min(2, window.devicePixelRatio || 1)
    });
    parent.appendChild(this.app.canvas);
    [this.gridG, this.pipesG, this.nodesG, this.labels, this.dynamicG, this.flashG, this.floatersC, this.overlayG].forEach(
      (l) => this.app.stage.addChild(l)
    );
    this.app.renderer.on('resize', () => this.layout());
    this.layout();
    this.app.ticker.add((tk) => this.tick(tk.deltaTime));
  }

  private layout() {
    this.w = this.parent.clientWidth || 800;
    this.h = this.parent.clientHeight || 480;
    // Vertical spine: phone (bottom) -> router -> ISP -> reservoir (top).
    this.nodes = [
      { x: this.w * 0.5, y: this.h * 0.86, label: 'phone' },
      { x: this.w * 0.5, y: this.h * 0.66, label: 'router' },
      { x: this.w * 0.5, y: this.h * 0.42, label: 'ISP' },
      { x: this.w * 0.5, y: this.h * 0.16, label: 'reservoir' }
    ];
    this.drawStatic();
    if (this.nodeLabels.length === 0) {
      for (let i = 0; i < this.nodes.length; i++) {
        const t = new Text({
          text: '',
          style: { fontSize: 10, fill: 0x9fb3d1 }
        });
        t.anchor.set(0.5, 0);
        this.labels.addChild(t);
        this.nodeLabels.push(t);
      }
    }
    this.nodes.forEach((n, i) => {
      this.nodeLabels[i].text = n.label;
      this.nodeLabels[i].x = n.x;
      this.nodeLabels[i].y = n.y + 14;
    });
  }

  private drawStatic() {
    const sk = PIPE_SKINS[this.skin];
    // grid
    this.gridG.clear();
    for (let x = 0; x < this.w; x += 28) this.gridG.moveTo(x, 0).lineTo(x, this.h);
    for (let y = 0; y < this.h; y += 28) this.gridG.moveTo(0, y).lineTo(this.w, y);
    this.gridG.stroke({ width: 1, color: 0x22d3ee, alpha: 0.06 });
    // pipes
    this.pipesG.clear();
    for (let i = 0; i < this.nodes.length - 1; i++) {
      const a = this.nodes[i];
      const b = this.nodes[i + 1];
      this.pipesG.moveTo(a.x, a.y).lineTo(b.x, b.y).stroke({ width: 14, color: sk.glow, alpha: 0.12 });
      this.pipesG.moveTo(a.x, a.y).lineTo(b.x, b.y).stroke({ width: 6, color: sk.core, alpha: 0.35 });
    }
    // nodes
    this.nodesG.clear();
    this.nodes.forEach((n) => {
      const col = n.label === 'phone' ? 0x22d3ee : n.label === 'reservoir' ? 0x34d399 : 0x1e3a5f;
      this.nodesG.circle(n.x, n.y, n.label === 'phone' ? 10 : 9).fill(col);
    });
  }

  setSkin(i: number) {
    this.skin = i % PIPE_SKINS.length;
    this.drawStatic();
  }
  setCohort(c: string) {
    this.cohort = c;
  }
  spawnTrackers(count: number) {
    this.trackerFish = [];
    for (let i = 0; i < count; i++) {
      this.trackerFish.push({
        angle: Math.random() * Math.PI * 2,
        dist: 16 + Math.random() * 18,
        speed: 0.8 + Math.random() * 1.5,
        life: 1,
        size: 3 + Math.random() * 3
      });
    }
  }
  hasTrackers(): boolean {
    return this.trackerFish.length > 0;
  }
  setXray(b: boolean) {
    this.xray = b;
  }
  relayout() {
    this.layout();
  }
  flashNow() {
    this.flash = 1;
  }

  private nodePath(): Point[] {
    return this.nodes.map((n) => ({ x: n.x, y: n.y }));
  }

  spawnBucket(clean: boolean, level: number) {
    this.bucket = { trace: new Trace(this.nodePath(), 1 + level * 0.08), clean, delivered: false };
  }

  // ---- leaks (contaminant mini-game) ----
  spawnLeak() {
    if (this.leaks.length >= this.leakCap) return;
    const s = Math.floor(Math.random() * 3);
    const a = this.nodes[s];
    const b = this.nodes[s + 1];
    const t = 0.3 + Math.random() * 0.4;
    this.leaks.push({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, r: 11, life: 1, spin: Math.random() * 6 });
  }
  setLeakCap(cap: number) {
    this.leakCap = cap;
  }
  private leakCap = 4;
  zapAt(x: number, y: number): boolean {
    for (let i = 0; i < this.leaks.length; i++) {
      const l = this.leaks[i];
      const dx = x - l.x;
      const dy = y - l.y;
      if (dx * dx + dy * dy <= (l.r + 14) * (l.r + 14)) {
        this.leaks.splice(i, 1);
        this.burst(l.x, l.y, 0xe23a8e);
        return true;
      }
    }
    return false;
  }
  private maybeLeakTick(rate: number) {
    if (Math.random() < rate && this.leaks.length < this.leakCap) this.spawnLeak();
  }

  burst(x: number, y: number, color: number) {
    for (let i = 0; i < 14; i++)
      this.particles.push({ x, y, vx: (Math.random() - 0.5) * 3, vy: -1 - Math.random() * 2.5, life: 1, color });
  }
  floater(x: number, y: number, text: string, color: number) {
    const t = new Text({ text, style: { fontSize: 13, fill: color, fontWeight: 'bold' } });
    t.anchor.set(0.5);
    t.x = x;
    t.y = y;
    this.floatersC.addChild(t);
    this.floaters.push({ t, life: 1 });
  }
  tryBoost(x: number, y: number): boolean {
    if (this.bucket && !this.bucket.trace.done) {
      const dx = x - this.bucket.trace.pos.x;
      const dy = y - this.bucket.trace.pos.y;
      if (dx * dx + dy * dy < 40 * 40) {
        this.bucket.trace.speed = Math.min(5, this.bucket.trace.speed * 1.6);
        this.floater(x, y - 18, 'FAST!', 0x22d3ee);
        return true;
      }
    }
    return false;
  }
  isTracing(): boolean {
    return !!this.bucket && !this.bucket.trace.done;
  }
  hasBucket(): boolean {
    return !!this.bucket;
  }

  // ---- pressure drain readings (feature: water pressure / stakes) ----
  getLeakCount(): number {
    return this.leaks.length;
  }
  getTrackerCount(): number {
    return this.trackerFish.length;
  }
  leakPoints(): { x: number; y: number }[] {
    return this.leaks.map((l) => ({ x: l.x, y: l.y }));
  }
  clearThreats() {
    this.leaks = [];
    this.trackerFish = [];
    this.thieves = [];
    this.boss = null;
  }

  // ---- X-Ray thief packets (feature: scan & catch) ----
  private nodePathPoint(t: number): { x: number; y: number } {
    const pts = this.nodes;
    const seg = pts.length - 1;
    const local = Math.min(1, Math.max(0, t)) * seg;
    const i = Math.min(seg - 1, Math.floor(local));
    const f = local - i;
    return { x: pts[i].x + (pts[i + 1].x - pts[i].x) * f, y: pts[i].y + (pts[i + 1].y - pts[i].y) * f };
  }
  private spawnThief() {
    const p = this.nodePathPoint(0.35 + Math.random() * 0.3);
    // thief trails the bucket, catching up slowly
    this.thieves.push({ prog: 0.35 + Math.random() * 0.3, speed: 0.0024, pulse: Math.random() * 6 });
  }
  tryCatchThief(x: number, y: number): boolean {
    if (!this.xray) return false;
    for (let i = 0; i < this.thieves.length; i++) {
      const t = this.thieves[i];
      const p = this.nodePathPoint(t.prog);
      const dx = x - p.x;
      const dy = y - p.y;
      if (dx * dx + dy * dy <= 20 * 20) {
        this.thieves.splice(i, 1);
        this.burst(p.x, p.y, 0xe23a8e);
        this.floater(p.x, p.y - 14, 'STRIPPED +XP', 0x22d3ee);
        return true;
      }
    }
    return false;
  }
  hasThieves(): boolean {
    return this.thieves.length > 0;
  }

  // ---- boss leak (feature: every 3rd lesson) ----
  private bossPos(): { x: number; y: number } {
    const n = this.nodes[this.nodes.length - 1];
    return { x: n.x, y: n.y - 44 };
  }
  hasBoss(): boolean {
    return !!this.boss;
  }
  bossPoint(): { x: number; y: number } | null {
    return this.boss ? { x: this.boss.x, y: this.boss.y } : null;
  }
  bossHp(): number {
    return this.boss ? this.boss.hp : 0;
  }
  spawnBoss() {
    const p = this.bossPos();
    this.boss = { x: p.x, y: p.y, hp: 6, maxHp: 6, flash: 0, t: 0 };
    this.burst(p.x, p.y, 0xe23a8e);
  }
  clearBoss() {
    this.boss = null;
  }
  bossTap(x: number, y: number): 'hit' | 'killed' | 'miss' {
    if (!this.boss) return 'miss';
    const b = this.boss;
    const dx = x - b.x;
    const dy = y - b.y;
    if (dx * dx + dy * dy > 34 * 34) return 'miss';
    b.hp--;
    b.flash = 1;
    this.burst(b.x, b.y - 10, 0xe23a8e);
    if (b.hp <= 0) {
      this.boss = null;
      this.burst(b.x, b.y, 0xe23a8e);
      this.burst(b.x, b.y, 0xfbbf24);
      this.floater(b.x, b.y - 26, 'LEAK BURST!', 0xfbbf24);
      return 'killed';
    }
    return 'hit';
  }
  bossFailFx() {
    const p = this.bossPos();
    this.burst(p.x, p.y, 0xf59e0b);
    this.floater(this.w / 2, this.h * 0.22, 'PASSWORD COPIED!', 0xe23a8e);
  }

  // ---- clean-tide burst (feature: chain rewards) ----
  tideFx() {
    const n = this.nodes[this.nodes.length - 1];
    this.burst(n.x, n.y, 0xfbbf24);
    this.burst(n.x, n.y, 0xfbbf24);
    this.floater(this.w / 2, this.h * 0.26, 'CLEAN TIDE!', 0xfbbf24);
  }
  showDecoys(on: boolean) {
    this.showDecoy = on;
    if (!on) {
      this.decoyLabels.forEach((t) => t.destroy());
      this.decoyLabels = [];
      return;
    }
    if (this.decoyLabels.length === 0) {
      for (const d of this.decoyDefs) {
        const t = new Text({ text: d.label, style: { fontSize: 11, fill: 0xe23a8e, fontFamily: 'system-ui' } });
        t.anchor.set(0.5, 1);
        this.labels.addChild(t);
        this.decoyLabels.push(t);
      }
    }
  }
  showEncryption(on: boolean) {
    this.encOn = on;
  }
  showPrivacy(on: boolean) {
    this.privOn = on;
    this.nodeLabels.forEach((t, i) => {
      if (i < this.nodes.length - 1) t.alpha = on ? 0.35 : 1;
    });
  }
  showMeta(on: boolean) {
    this.metaOn = on;
    if (!on) {
      this.metaLabels.forEach((t) => t.destroy());
      this.metaLabels = [];
      return;
    }
    if (this.metaLabels.length === 0) {
      const lines = ['ts: 14:32', 'dev: iPhone 15', 'loc: 48.85N'];
      for (const line of lines) {
        const t = new Text({ text: line, style: { fontSize: 9, fill: 0x9fb3d1, fontFamily: 'monospace' } });
        this.floatersC.addChild(t);
        this.metaLabels.push(t);
      }
    }
  }
  showFootprint(on: boolean) {
    this.footOn = on;
    if (on) this.ghostPaths = [];
    else this.ghostPaths = [];
  }
  showTfa(on: boolean) {
    this.tfaOn = on;
  }
  showSafe(on: boolean) {
    this.safeOn = on;
  }

  // Visual flourishes fired by the Game on delivery / combo milestones.
  deliverFx(clean: boolean, gain: number) {
    if (!this.bucket) return;
    const x = this.bucket.trace.pos.x;
    const y = this.bucket.trace.pos.y;
    this.burst(x, y, clean ? 0x22d3ee : 0xe23a8e);
    this.floater(x, y - 18, '+' + gain + ' XP', clean ? 0x22d3ee : 0xe23a8e);
  }
  comboFx(combo: number) {
    if (!this.bucket) return;
    const x = this.bucket.trace.pos.x;
    const y = this.bucket.trace.pos.y;
    this.burst(x, y, 0xfbbf24);
    this.burst(x, y, 0xfbbf24);
    this.floater(x, y - 34, 'COMBO x' + Math.min(3, 1 + Math.floor(combo / 3) * 0.5).toFixed(1), 0xfbbf24);
  }
  announce(text: string, color: number) {
    this.floater(this.w / 2, this.h * 0.3, text, color);
  }

  private tick(dt: number) {
    // tracker fish — orbit bucket, siphon droplets, fade when delivered
    if (this.trackerFish.length > 0) {
      if (this.bucket && !this.bucket.delivered) {
        const bx = this.bucket.trace.pos.x;
        const by = this.bucket.trace.pos.y;
        for (const f of this.trackerFish) {
          f.angle += f.speed * dt * 0.04;
          if (Math.random() < 0.06 * dt) {
            const fx = bx + Math.cos(f.angle) * f.dist;
            const fy = by + Math.sin(f.angle) * f.dist;
            this.siphonDrops.push({ x: fx, y: fy, vy: 0.4 + Math.random() * 0.6, life: 1 });
          }
        }
      } else {
        for (const f of this.trackerFish) f.life -= 0.025 * dt;
        this.trackerFish = this.trackerFish.filter((f) => f.life > 0);
      }
    }
    // siphon drops
    for (let i = this.siphonDrops.length - 1; i >= 0; i--) {
      const d = this.siphonDrops[i];
      d.y += d.vy * dt;
      d.life -= 0.025 * dt;
      if (d.life <= 0) this.siphonDrops.splice(i, 1);
    }

    // bucket
    if (this.bucket) {
      const b = this.bucket;
      if (!this.xray && !b.trace.done) {
        b.trace.step(dt);
      }
      if (b.trace.done) {
        if (!b.delivered) {
          b.delivered = true;
          if (this.footOn) {
            this.ghostPaths.push([...b.trace.pts]);
          }
          this.thieves = [];
          this.thiefTimer = 0;
          this.onDeliver?.(b.clean);
        }
        const last = this.nodes[this.nodes.length - 1];
        b.trace.pos.x = last.x;
        b.trace.pos.y = last.y;
        this.bucket = null;
      }
    }

    // X-Ray thieves: creep toward the reservoir only while looking + in flight
    if (this.xray && this.bucket && !this.bucket.delivered) {
      this.thiefTimer -= dt;
      if (this.thiefTimer <= 0 && this.thieves.length < 3) {
        this.spawnThief();
        this.thiefTimer = 90 + Math.random() * 90;
      }
      for (let i = this.thieves.length - 1; i >= 0; i--) {
        const t = this.thieves[i];
        t.prog += t.speed * dt;
        t.pulse += 0.12 * dt;
        if (t.prog >= 1) {
          this.thieves.splice(i, 1);
          this.onThiefMissed?.();
        }
      }
    }

    // boss: age + flash decay
    if (this.boss) {
      this.boss.t += 0.06 * dt;
      this.boss.flash = Math.max(0, this.boss.flash - 0.04 * dt);
    }

    // leaks lifecycle
    for (let i = this.leaks.length - 1; i >= 0; i--) {
      const l = this.leaks[i];
      l.life -= 0.004 * dt;
      l.spin += 0.08 * dt;
      if (l.life <= 0) this.leaks.splice(i, 1);
    }
    this.maybeLeakTick(0.012);

    // particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 0.08 * dt;
      p.life -= 0.02 * dt;
      if (p.life <= 0) this.particles.splice(i, 1);
    }
    // floaters
    for (let i = this.floaters.length - 1; i >= 0; i--) {
      const f = this.floaters[i];
      f.t.y -= 0.4 * dt;
      f.life -= 0.015 * dt;
      f.t.alpha = Math.max(0, f.life);
      if (f.life <= 0) {
        f.t.destroy();
        this.floaters.splice(i, 1);
      }
    }

    this.draw();

    // game tick callback (CW decay, etc.)
    this.onFrame?.(dt / 60);

    // overlay: encryption, privacy, metadata, footprint, 2fa, safe-browse
    const og = this.overlayG;
    og.clear();

    // ghost paths (digital footprint)
    if (this.footOn && this.ghostPaths.length) {
      for (const pts of this.ghostPaths) {
        if (pts.length < 2) continue;
        og.moveTo(pts[0].x, pts[0].y);
        for (let i = 1; i < pts.length; i++) og.lineTo(pts[i].x, pts[i].y);
        og.stroke({ color: 0x7dd3fc, width: 1.5, alpha: 0.15 });
      }
    }

    if (this.bucket) {
      const bx = this.bucket.trace.pos.x;
      const by = this.bucket.trace.pos.y;
      if (this.encOn) {
        og.roundRect(bx - 10, by - 30, 20, 16, 3).fill({ color: 0x34d399, alpha: 0.92 });
        og.arc(bx, by - 30, 7, Math.PI, 0, false).stroke({ color: 0x34d399, width: 2.5 });
        og.rect(bx - 2, by - 26, 4, 4).fill({ color: 0xffffff, alpha: 0.8 });
      }
      if (this.tfaOn) {
        og.roundRect(bx - 10, by - 50, 20, 16, 3).fill({ color: 0xfbbf24, alpha: 0.92 });
        og.arc(bx, by - 50, 7, Math.PI, 0, false).stroke({ color: 0xfbbf24, width: 2.5 });
        og.rect(bx - 2, by - 46, 4, 4).fill({ color: 0xffffff, alpha: 0.8 });
      }
      if (this.metaOn) {
        this.metaLabels.forEach((t, i) => {
          t.x = bx + 18;
          t.y = by - 14 + i * 12;
          t.alpha = 0.85;
        });
      }
    } else if (this.metaOn) {
      this.metaLabels.forEach((t) => { t.alpha = 0; });
    }
    if (this.privOn) {
      this.nodes.forEach((n, i) => {
        if (i < this.nodes.length - 1) {
          og.circle(n.x, n.y, 18).fill({ color: 0x0b1220, alpha: 0.4 });
          og.circle(n.x, n.y, 18).stroke({ color: 0xe23a8e, width: 1.5, alpha: 0.5 });
        }
      });
    }
    if (this.safeOn) {
      this.nodes.forEach((n, i) => {
        const isReservoir = i === this.nodes.length - 1;
        const isMail = i <= 1;
        const col = isReservoir ? 0x34d399 : isMail ? 0xfbbf24 : 0x9fb3d1;
        og.circle(n.x, n.y - 22, 5).fill({ color: col, alpha: 0.9 });
      });
    }
  }

  private draw() {
    const g = this.dynamicG;
    g.clear();
    // ambient drifting droplets
    for (let i = 0; i < 18; i++) {
      const y = this.h - (i / 18) * this.h * ((performance.now() / 40 + i * 30) % 1);
      g.circle(this.w * 0.5 + Math.sin(i * 1.7) * 40, this.h - ((performance.now() / 30 + i * 50) % this.h), 2.5).fill({
        color: 0x7dd3fc,
        alpha: 0.18
      });
    }
    // leaks
    this.leaks.forEach((l) => {
      g.circle(l.x, l.y, l.r).fill({ color: 0xe23a8e, alpha: 0.25 });
      const pts: number[] = [];
      for (let k = 0; k < 10; k++) {
        const ang = (k / 10) * Math.PI * 2 + l.spin;
        const rad = k % 2 ? l.r : l.r * 0.5;
        pts.push(l.x + Math.cos(ang) * rad, l.y + Math.sin(ang) * rad);
      }
      g.poly(pts).fill({ color: 0xe23a8e, alpha: 0.9 });
    });
    // X-Ray thief packets — magenta squares riding the pipe (tap to strip)
    if (this.xray) {
      this.thieves.forEach((t) => {
        const p = this.nodePathPoint(t.prog);
        const k = 5 + Math.sin(t.pulse) * 1.5;
        g.circle(p.x, p.y, k + 4).fill({ color: 0xe23a8e, alpha: 0.18 });
        g.rect(p.x - k, p.y - k, k * 2, k * 2).fill({ color: 0xe23a8e, alpha: 0.95 });
        g.rect(p.x - 1, p.y - 1, 2, 2).fill({ color: 0xffffff, alpha: 0.9 });
      });
    }
    // boss leak — pulsing spike ring over the reservoir
    if (this.boss) {
      const b = this.boss;
      const r = 24 + Math.sin(b.t) * 3;
      g.circle(b.x, b.y, r + 8).fill({ color: 0xe23a8e, alpha: 0.2 });
      const pts: number[] = [];
      for (let k = 0; k < 14; k++) {
        const ang = (k / 14) * Math.PI * 2 + b.t;
        const rad = k % 2 ? r : r * 0.5;
        pts.push(b.x + Math.cos(ang) * rad, b.y + Math.sin(ang) * rad);
      }
      g.poly(pts).fill({ color: 0xe23a8e, alpha: 0.95 });
      // hp bar
      const bw = 44;
      g.rect(b.x - bw / 2, b.y - r - 14, bw, 5).fill({ color: 0x0b1220, alpha: 0.85 });
      g.rect(b.x - bw / 2, b.y - r - 14, bw * (b.hp / b.maxHp), 5).fill({
        color: b.hp <= 2 ? 0xe23a8e : 0xfbbf24,
        alpha: 0.95
      });
      if (b.flash > 0) g.circle(b.x, b.y, r + 8).stroke({ color: 0xffffff, alpha: b.flash, width: 3 });
    }
    // particles
    this.particles.forEach((p) => g.circle(p.x, p.y, 3).fill({ color: p.color, alpha: Math.max(0, p.life) }));
    // bucket
    if (this.bucket) this.drawBucket(g, this.bucket.trace.pos.x, this.bucket.trace.pos.y, this.bucket.clean);

    // tracker fish — magenta dots orbiting the bucket
    if (this.trackerFish.length > 0 && this.bucket && !this.bucket.delivered) {
      const bx = this.bucket.trace.pos.x;
      const by = this.bucket.trace.pos.y;
      for (const f of this.trackerFish) {
        const fx = bx + Math.cos(f.angle) * f.dist;
        const fy = by + Math.sin(f.angle) * f.dist;
        // fish body
        g.circle(fx, fy, f.size).fill({ color: 0xe23a8e, alpha: f.life * 0.85 });
        // tiny eye
        g.circle(fx + f.size * 0.3, fy - f.size * 0.2, f.size * 0.25).fill({ color: 0xffffff, alpha: f.life * 0.6 });
        // siphon line from fish to bucket
        g.moveTo(fx, fy).lineTo(bx, by).stroke({ width: 0.8, color: 0xe23a8e, alpha: f.life * 0.25 });
      }
    }
    // siphon drops — tiny magenta droplets falling from fish
    this.siphonDrops.forEach((d) => {
      g.circle(d.x, d.y, 2).fill({ color: 0xe23a8e, alpha: d.life * 0.7 });
    });

    // network-map decoys (phishing level): impostor / ads nodes
    if (this.showDecoy) {
      this.decoyDefs.forEach((d, i) => {
        const x = d.rx * this.w;
        const y = d.ry * this.h;
        g.poly([x - 10, y, x, y - 10, x + 10, y, x, y + 10]).fill({ color: 0xe23a8e, alpha: 0.9 });
        g.poly([x - 5, y, x, y - 5, x + 5, y, x, y + 5]).fill({ color: 0xffffff, alpha: 0.55 });
        const t = this.decoyLabels[i];
        if (t) {
          t.x = x;
          t.y = y + 12;
        }
      });
    }

    // flash
    this.flashG.clear();
    if (this.flash > 0) {
      this.flashG.rect(0, 0, this.w, this.h).fill({ color: 0xfbbf24, alpha: this.flash * 0.16 });
      this.flash -= 0.03;
    }
  }

  private drawBucket(g: Graphics, x: number, y: number, clean: boolean) {
    const col = clean ? 0x22d3ee : 0xe23a8e;
    g.circle(x, y, 13).fill({ color: col, alpha: 0.22 });
    g.moveTo(x - 9, y - 11).lineTo(x + 9, y - 11).lineTo(x + 9, y + 7);
    g.quadraticCurveTo(x, y + 15, x - 9, y + 7).closePath();
    g.fill(col);
    g.ellipse(x, y - 7, 7, 3).fill({ color: 0xffffff, alpha: 0.55 });
  }
}
