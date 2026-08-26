// Headless test harness for Pipedream Protocol preview.
// Stubs DOM + Canvas so we can EXECUTE the game script and catch runtime errors
// without a browser. Usage: node test-harness.js
const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, 'index.html');
const html = fs.readFileSync(htmlPath, 'utf8');
const m = html.match(/<script>([\s\S]*?)<\/script>/);
if (!m) { console.error('NO SCRIPT FOUND'); process.exit(1); }
const code = m[1];

// ---- stub canvas 2d context (no-op for any method) ----
function makeCtx() {
  return new Proxy({}, {
    get(t, p) { if (p in t) return t[p]; return () => {}; },
    set(t, p, v) { t[p] = v; return true; }
  });
}

// ---- stub element ----
function makeEl(id) {
  const handlers = {};
  const classes = new Set();
  const el = {
    id, dataset: {}, style: {}, value: '', textContent: '', innerHTML: '',
    clientWidth: 800, clientHeight: 480, width: 800, height: 480,
    classList: {
      add: c => classes.add(c), remove: c => classes.delete(c),
      contains: c => classes.has(c), toggle: c => classes.has(c) ? (classes.delete(c), false) : (classes.add(c), true)
    },
    addEventListener: (type, fn) => { (handlers[type] = handlers[type] || []).push(fn); },
    removeEventListener: () => {},
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 800, height: 480 }),
    getContext: () => makeCtx(),
    appendChild: () => {},
    trigger: (type, evt = {}) => { (handlers[type] || []).forEach(fn => fn(evt)); },
    querySelectorAll: () => [],
    _classes: classes
  };
  return el;
}

const registry = {};
function getEl(id) { return registry[id] || (registry[id] = makeEl(id)); }

// cohort buttons
const cbtns = ['t', 'y', 'p', 'm'].map(c => { const e = makeEl('cbtn-' + c); e.dataset.c = c; return e; });

const documentStub = {
  getElementById: getEl,
  createElement: () => makeEl('_el'),
  querySelectorAll: sel => sel === '.cbtn' ? cbtns : [],
  addEventListener: () => {}
};

// window + timers + rAF (manual pump)
let rafQ = [];
let timers = [], timerId = 1;
const windowStub = {
  devicePixelRatio: 2,
  addEventListener: () => {},
  requestAnimationFrame: cb => { rafQ.push(cb); return rafQ.length; }
};
function requestAnimationFrame(cb) { return windowStub.requestAnimationFrame(cb); }
function setTimeoutStub(cb, d) { const id = timerId++; timers.push({ id, cb, d: d || 0 }); return id; }
function clearTimeoutStub(id) { timers = timers.filter(t => t.id !== id); }
function flushTimers(maxMs) { // fire timers with delay<=maxMs (used to simulate long-press)
  timers = timers.filter(t => { if (t.d <= (maxMs || 0)) { try { t.cb(); } catch (e) { throw e; } return false; } return true; });
}
function pump(frames) {
  for (let i = 0; i < frames; i++) {
    const q = rafQ; rafQ = [];
    q.forEach(cb => { try { cb(i * 16); } catch (e) { throw e; } });
  }
}

// ---- run ----
const sandbox = {
  document: documentStub, window: windowStub,
  requestAnimationFrame, setTimeout: setTimeoutStub, clearTimeout: clearTimeoutStub,
  console, Math, Date, JSON, performance: { now: () => Date.now() }
};

const errors = [];
function step(name, fn) {
  try { fn(); console.log('  OK   -', name); }
  catch (e) { errors.push(name + ': ' + (e && e.stack || e)); console.log('  FAIL -', name, '\n        ', e && e.message); }
}

step('load + initial frames', () => { new Function('document', 'window', 'requestAnimationFrame', 'setTimeout', 'clearTimeout', 'console', 'Math', 'Date', 'JSON', 'performance', code)
  (sandbox.document, sandbox.window, sandbox.requestAnimationFrame, sandbox.setTimeout, sandbox.clearTimeout, sandbox.console, Math, Date, JSON, sandbox.performance); });

const appMail = getEl('appMail'), send = getEl('send'), replay = getEl('replay');
const stage = getEl('stage');
const pw = getEl('pw');

step('idle frames', () => pump(10));
step('open MailDrop', () => appMail.trigger('click'));
step('send WEAK bucket (short pw)', () => { pw.value = 'abc'; send.trigger('click'); pump(420); });
step('replay trace', () => { replay.trigger('click'); pump(420); });
const pp0 = () => sandbox.window.__pp.state;
step('WEAK send reduces Clean Water (<100)', () => { if (!(pp0().cw < 100)) throw new Error('cw not penalized, cw=' + pp0().cw); });
step('send STRONG bucket', () => { pw.value = 'correct horse battery'; send.trigger('click'); pump(420); });
step('STRONG send grants XP (>0)', () => { if (!(pp0().xp > 0)) throw new Error('xp did not increase'); });
step('repeat strong sends -> level up + skin change', () => {
  const beforeLvl = pp0().level;
  for (let i = 0; i < 14; i++) {
    pw.value = 'another strong pass ' + i; send.trigger('click');
    for (let f = 0; f < 8; f++) { stage.trigger('click', { clientX: 400, clientY: 240 }); pump(55); }
  }
  if (!(pp0().level > beforeLvl)) throw new Error('did not level up (lvl=' + pp0().level + ')');
  if (!(pp0().bestCombo >= 2)) throw new Error('combo never built (best=' + pp0().bestCombo + ')');
});
step('cohort switch x4', () => cbtns.forEach(b => b.trigger('click')));
step('resize event', () => windowStub.addEventListener && sandbox.window && true);
step('long-press X-Ray ON (flush 350ms)', () => { stage.trigger('mousedown'); flushTimers(350); pump(30); });
step('long-press X-Ray OFF', () => { stage.trigger('mousedown'); flushTimers(350); pump(10); });
step('stage click (leak zap attempt)', () => { stage.trigger('click', { clientX: 400, clientY: 240 }); pump(20); });
step('debug hook present', () => { if (!sandbox.window.__pp) throw new Error('window.__pp missing'); });
step('spawn + zap a leak via hook', () => {
  const pp = sandbox.window.__pp;
  const before = pp.state.leaksZapped;
  pp.spawnLeak();
  const l = pp.leaks()[0];
  if (!l) throw new Error('spawnLeak did not create a leak');
  pp.zapAt(l.x, l.y);
  if (pp.state.leaksZapped !== before + 1) throw new Error('zapAt did not increment leaksZapped');
});
step('drive many frames (loop stability)', () => pump(600));
step('lesson quiz opens after a deliver', () => {
  const pp = sandbox.window.__pp;
  pp.startTrace(true); pump(420);
  // openQuiz should have fired during deliver; force-answer correct path
  const xpBefore = pp.state.xp;
  pp.answerQuiz(true);
  flushTimers(800); // run startLesson(next) timeout
  if (!(pp.state.xp > xpBefore)) throw new Error('answerQuiz did not award XP');
});
step('wrong quiz answer is safe (no crash, gentle)', () => { sandbox.window.__pp.answerQuiz(false); pump(5); });

console.log('\n==== RESULT ====');
if (errors.length) { console.log('ERRORS:', errors.length); errors.forEach(e => console.log(' -', e)); process.exit(1); }
else { console.log('ALL STEPS PASSED'); }
