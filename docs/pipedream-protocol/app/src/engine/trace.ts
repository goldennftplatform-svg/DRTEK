// Deterministic, fixed-step bucket journey along a polyline of waypoints.
// Renderer is a pure function of Trace state -> position (GDD 8.4 replay principle).

export interface Point {
  x: number;
  y: number;
}

export class Trace {
  pts: Point[];
  speed: number;
  seg = 0;
  p = 0;
  done = false;
  pos: Point;

  constructor(pts: Point[], speed = 1) {
    this.pts = pts;
    this.speed = speed;
    this.pos = { ...pts[0] };
  }

  // dt is the frame delta (~1 at 60fps). Pure & deterministic for a given dt sequence.
  step(dt = 1) {
    if (this.done) return;
    this.p += 0.014 * this.speed * dt;
    if (this.p >= 1) {
      this.seg++;
      this.p = 0;
      if (this.seg >= this.pts.length - 1) {
        this.done = true;
        this.seg = this.pts.length - 2;
        this.p = 1;
      }
    }
    const a = this.pts[this.seg];
    const b = this.pts[this.seg + 1];
    this.pos.x = a.x + (b.x - a.x) * this.p;
    this.pos.y = a.y + (b.y - a.y) * this.p;
  }
}
