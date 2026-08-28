import { chromium } from 'playwright';

const url = process.argv[2] || 'http://localhost:4173/';
const browser = await chromium.launch({ args: ['--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

const log = [];
const say = (m) => { log.push(m); console.log(m); };
page.on('console', (m) => { if (m.type() === 'error') log.push('[console err] ' + m.text()); });
page.on('pageerror', (e) => log.push('[page err] ' + e.message));

await page.goto(url, { waitUntil: 'networkidle' });
await page.waitForSelector('#intro');
say('Loaded. Cohort cards: ' + await page.locator('.intro-card').count());
await page.click('.intro-card:nth-child(2)');
await page.click('#playBtn');

for (let s = 1; s <= 3; s++) {
  say('Walkthrough step ' + s + ' body: "' + await page.locator('.walk-body').textContent() + '"');
  await page.click('#walk-' + s);
}

say('Guided Brick: "' + await page.locator('#speech').textContent() + '"');

// Click a DEAD app like a real confused player (force = simulate a real tap)
await page.locator('.app.dead').first().click({ force: true });
await page.waitForTimeout(300);
say('Tapped a dead app (Streamly) — mail form opened? ' + await page.locator('#mailform.show').count());

// Open MailDrop, use a WEAK password on purpose
await page.click('#appMail');
await page.fill('#pw', '123456');
await page.click('#send');
say('Sent weak pw. Brick: "' + await page.locator('#speech').textContent() + '"');

// Skip zapping, wait for deliver -> quiz
await page.waitForSelector('.qopt', { timeout: 15000 });
say('Quiz Q: "' + await page.locator('#quizQ').textContent() + '"');
// Answer WRONG on purpose
const wrong = page.locator('.qopt[data-correct="false"]').first();
await wrong.click();
await page.waitForTimeout(1700);
say('After wrong answer, Brick: "' + await page.locator('#speech').textContent() + '"');
say('CW value: ' + await page.locator('#cwVal').textContent());
const right = page.locator('.qopt[data-correct="true"]').first();
await right.click();
await page.waitForTimeout(1500);
say('After right answer, phase-9 Brick: "' + await page.locator('#speech').textContent() + '"');

// Lesson 2 cookies — the banner must NOT be present before sending (regression for the overlap bug)
await page.waitForTimeout(2600);
const cookieDump = await page.evaluate(() => {
  const c = document.querySelector('#cookie');
  return c ? { cls: c.className, disp: getComputedStyle(c).display } : 'no #cookie';
});
say('COOKIE DUMP (must be hidden before send): ' + JSON.stringify(cookieDump));

// Send a CLEAN bucket on lesson 2 -> cookie banner should appear AFTER the send
await page.click('#appMail');
await page.fill('#pw', 'correcthorsebatterystaple');
await page.click('#send');
await page.waitForTimeout(1300);
const afterSend = await page.evaluate(() => {
  const c = document.querySelector('#cookie');
  return c ? { cls: c.className, disp: getComputedStyle(c).display } : 'no #cookie';
});
say('COOKIE DUMP (after send, should be visible): ' + JSON.stringify(afterSend));

await page.waitForSelector('.qopt', { timeout: 15000 });
await page.locator('.qopt[data-correct="true"]').first().click();
await page.waitForTimeout(800);
say('Lesson 3 Brick: "' + await page.locator('#speech').textContent() + '"');

// Find whether leaks ever got explained: spawn is 8-15s; peek at whiteboard leaks via brick text over time
let leakTaught = false;
const started = Date.now();
while (Date.now() - started < 9000) {
  const t = await page.locator('#speech').textContent();
  if (t && t.includes('leak')) { say('Leak tutorial fired: "' + t + '"'); leakTaught = true; break; }
  await page.waitForTimeout(500);
}
if (!leakTaught) say('No leak tutorial seen in 9s of lesson 3');

await page.screenshot({ path: 'playthrough.png' });
say('--- HUD at end: cw=' + await page.locator('#cwVal').textContent() + ' xp=' + await page.locator('#xpVal').textContent() + ' lesson=' + await page.locator('#lessonVal').textContent());
say('--- console/page errors: ' + (log.filter(l => l.includes('err')).join(' | ') || 'none'));

await browser.close();