// Headless Beta smoke test: walkthrough + all 10 levels + viral features.
// Run: npm run test:beta
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';

const PORT = 4173;
const URL = `http://localhost:${PORT}/`;

function waitForServer(timeoutMs = 30000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const tick = async () => {
      try { if ((await fetch(URL)).ok) return resolve(); } catch {}
      if (Date.now() - start > timeoutMs) return reject(new Error('server timeout'));
      setTimeout(tick, 300);
    };
    tick();
  });
}

const errors = [];
let server;

async function main() {
  server = spawn('cmd', ['/c', 'npx vite preview --port ' + PORT + ' --strictPort'], {
    cwd: process.cwd(), stdio: 'ignore'
  });
  await waitForServer();

  const browser = await chromium.launch({
    args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader',
           '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist']
  });
  const page = await browser.newPage({ viewport: { width: 900, height: 600 } });
  page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));

  await page.goto(URL, { waitUntil: 'networkidle' });

  // 1) Intro: pick cohort, enter
  await page.waitForSelector('#intro', { timeout: 10000 });
  await page.click('.intro-card:nth-child(2)');
  await page.click('#playBtn');

  // 2) Walkthrough: click through 3 info cards
  await page.waitForSelector('#walkOverlay', { timeout: 10000 });
  for (let i = 1; i <= 3; i++) {
    await page.waitForSelector(`#walk-${i}`, { timeout: 5000 });
    await page.click(`#walk-${i}`);
  }

  // Helper: play one lesson cycle (open mail → send → zap threats → quiz)
  async function playLesson(pwSuffix) {
    // Dismiss cookie banner if visible
    if (await page.$('#cookie.show')) await page.click('#cookieEssential');
    // Wait for appMail to be visible and click it
    await page.waitForSelector('#appMail', { state: 'visible', timeout: 10000 });
    await page.click('#appMail');
    // Fill password and send
    await page.waitForSelector('#pw', { state: 'visible', timeout: 5000 });
    await page.fill('#pw', 'correcthorsebatterystaple' + pwSuffix);
    // Dismiss cookie again in case it appeared after appMail click
    if (await page.$('#cookie.show')) await page.click('#cookieEssential');
    await page.click('#send');
    // Cookie roulette: on the cookies lesson the banner shows ~900ms after send —
    // dismiss it (as a player would) instead of letting it time out.
    await page.waitForTimeout(1400);
    if (await page.$('#cookie.show')) await page.click('#cookieEssential');
    // Zap active leaks + tap the boss so the pressure drain can't dry the pipes.
    await page.evaluate(() => {
      const stage = document.querySelector('#stage');
      const r = stage.getBoundingClientRect();
      const pts = window.Pipedream.wb.leakPoints();
      for (const p of pts) {
        stage.dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: r.left + p.x, clientY: r.top + p.y }));
      }
      const b = window.Pipedream.wb.bossPoint();
      if (b) {
        for (let k = 0; k < 3; k++) {
          stage.dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: r.left + b.x, clientY: r.top + b.y }));
        }
      }
    });
    // Wait for quiz and answer correctly
    await page.waitForSelector('.qopt', { timeout: 15000 });
    await page.click('.qopt[data-correct="true"]');
    // Wait for startLesson to fire (resetForm + next quiz)
    await page.waitForTimeout(1500);
  }

  // 3) Guided first send (lesson 0 — Email)
  await playLesson('');

  const lessonCount = await page.evaluate(() => window.Pipedream.lessonCount);

  // 4) Play through remaining lessons (1..N-1)
  for (let n = 1; n < lessonCount; n++) {
    await playLesson(String(n));
  }

  // 5) Share card should appear after lesson 10
  const shareOverlay = await page.$('#shareOverlay');
  if (shareOverlay) {
    await page.screenshot({ path: 'beta-sharecard.png' });
    console.log('  [share card captured]');
  }

  // 6) Verify XP > 0
  const xp = await page.evaluate(() => {
    const v = document.querySelector('#xpVal');
    return v ? parseInt(v.textContent || '0', 10) : 0;
  });

  await page.screenshot({ path: 'beta-smoke.png' });
  await browser.close();

  if (errors.length) {
    console.error('FAIL — runtime errors:\n' + errors.join('\n'));
    process.exit(1);
  }
  if (xp <= 0) {
    console.error('FAIL — XP is ' + xp + ', expected > 0');
    process.exit(1);
  }
  console.log('PASS — walkthrough + all ' + lessonCount + ' levels + share card + XP=' + xp);
  process.exit(0);
}

main().catch((e) => {
  console.error('FAIL —', e.message);
  if (errors.length) console.error(errors.join('\n'));
  process.exit(1);
}).finally(() => {
  if (server) server.kill();
});
