import { el, BRICK_SVG } from '../ui/dom';
import { Hud } from '../ui/hud';
import { Phone } from '../ui/phone';
import { Walkthrough } from '../ui/walkthrough';
import { Whiteboard } from '../render/Whiteboard';
import { GameState, type CohortId } from '../engine/state';
import { LESSONS } from '../content/lessons';
import { cohortLine } from '../content/cohorts';
import { sfx } from '../audio/sfx';

const RANKS = ['Novice User', 'Connected Citizen', 'Data Aware', 'Privacy Defender',
  'Network Navigator', 'Finance Explorer', 'Creator Awakened', 'Decentralized Apprentice',
  'Protocol Engineer', 'Grandmaster Technician'];
const COHORT_BADGES: Record<CohortId, string> = { t: '⚡', y: '💧', p: '🛡️', m: '🔒' };
const COHORT_NAMES: Record<CohortId, string> = { t: 'Teen Piper', y: 'Young Piper', p: 'Parent Piper', m: 'Mature Piper' };
const QUOTES = [
  '"You can see the invisible."',
  '"Clean water is power."',
  '"Privacy isn\'t paranoia — it\'s hygiene."',
  '"Every tap has a journey."',
  '"Follow the data. Clean the water."'
];

/*
 * Onboarding phases
 *   0  = not started (intro screen)
 *   1-3 = walkthrough info cards (player clicks through)
 *   6  = guided: "tap MailDrop, type a password, hit Send"
 *   7  = guided: bucket is in flight, wait for deliver → quiz appears
 *   8  = guided: answer the quiz → advance to normal game
 *   9  = normal gameplay
 */
export class Game {
  private state = new GameState();
  private wb = new Whiteboard();
  private cohort: CohortId = 'y';
  private lastClean = true;
  private startTime = 0;

  private hud!: Hud;
  private phone!: Phone;
  private stage!: HTMLElement;
  private speechEl!: HTMLElement;
  private xrayCard!: HTMLElement;
  private rootEl!: HTMLElement;
  private pendingCohort: CohortId = 'y';
  private walk!: Walkthrough;
  private phase = 0;

  async init(root: HTMLElement) {
    root.innerHTML = '';
    this.rootEl = root;

    // ---- HUD ----
    const hudEl = el('div', { id: 'hud' });
    this.hud = new Hud(hudEl, this.state, {
      onHelp: () => this.help(),
      onCohort: (c) => this.setCohort(c)
    });

    // ---- Stage (whiteboard canvas + Brick + speech + X-ray card) ----
    this.speechEl = el('div', { id: 'speech', textContent: 'Booting the lab…' });
    const brick = el('div', { id: 'brick' });
    brick.innerHTML = BRICK_SVG;
    this.xrayCard = el('div', { className: 'xraycard' });
    this.stage = el('div', { id: 'stage' }, brick, this.speechEl, this.xrayCard);

    // ---- Phone ----
    const phoneWrap = el('div', { id: 'phoneWrap' });
    this.phone = new Phone(phoneWrap, {
      onOpenMail: () => this.onOpenMail(),
      onSend: (pw) => this.onSend(pw),
      onQuizAnswer: (correct) => this.answerQuiz(correct),
      onCookie: (ess) => this.handleCookie(ess),
      onReplay: () => this.replay(),
      onDeadApp: () => this.onDeadApp()
    });

    root.append(hudEl, this.stage, phoneWrap);

    // ---- Whiteboard ----
    await this.wb.init(this.stage);
    this.wb.onDeliver = (clean) => this.onDeliver(clean);
    this.wb.onFrame = (dtSec) => this.onFrame(dtSec);
    this.wb.setLeakCap(4);
    this.wireStageInput();
    window.addEventListener('resize', () => this.wb.relayout());

    // ---- Begin ----
    this.state.on('levelup', () => this.onLevelUp());
    (window as any).Pipedream = { state: this.state, wb: this.wb, lessonCount: LESSONS.length };
    this.buildIntro();
  }

  // =====================================================================
  //  INTRO + WALKTHROUGH
  // =====================================================================

  private buildIntro() {
    const intro = el('div', { id: 'intro' });
    const cards: Record<CohortId, string> = { t: 'Teens 12-17', y: 'Young 18-30', p: 'Parents 31-45', m: 'Mature 45+' };
    const captions: Record<CohortId, string> = { t: 'quick & casual', y: 'straightforward', p: 'family-focused', m: 'calm & detailed' };
    intro.append(
      el('div', { className: 'tag', textContent: 'INTERNET SAFETY GAME' }),
      el('h1', { textContent: 'Pipedream Protocol' }),
      el('div', {
        className: 'sub',
        textContent:
          'Your data is water. Don\'t let it leak. 10 lessons to stop getting scammed.'
      })
    );
    const cardWrap = el('div', { className: 'cards' });
    const cardEls: Partial<Record<CohortId, HTMLElement>> = {};
    (Object.keys(cards) as CohortId[]).forEach((c) => {
      const cEl = el('div', { className: 'intro-card' + (c === this.pendingCohort ? ' sel' : '') });
      cEl.append(document.createTextNode(cards[c]), el('small', { textContent: captions[c] }));
      cEl.onclick = () => {
        this.pendingCohort = c;
        Object.values(cardEls).forEach((e) => e && e.classList.remove('sel'));
        cEl.classList.add('sel');
        sfx.click();
      };
      cardEls[c] = cEl;
      cardWrap.append(cEl);
    });
    intro.append(cardWrap);
    const play = el('button', { id: 'playBtn', textContent: 'Play' });
    play.onclick = () => {
      sfx.click();
      intro.remove();
      this.cohort = this.pendingCohort;
      this.wb.setCohort(this.cohort);
      this.startTime = Date.now();
      this.startWalkthrough();
    };
    intro.append(play);
    this.rootEl.append(intro);
  }

  private startWalkthrough() {
    this.phase = 1;
    this.walk = new Walkthrough();
    this.walk.build(this.rootEl, () => this.endWalkthrough());
  }

  private endWalkthrough() {
    this.phase = 6;
    this.state.lessonIdx = 0;
    this.phone.resetForm();
    this.phone.guide();
    this.phone.showMailCallout(true);
    this.phone.showHint(false);
    this.wb.showDecoys(false);
    this.wb.showEncryption(false);
    this.wb.showPrivacy(false);
    this.wb.showMeta(false);
    this.wb.showFootprint(false);
    this.wb.showTfa(false);
    this.wb.showSafe(false);
    this.state.quizOpen = false;
    this.phone.hideQuiz();
    this.hud.setObjective('Lesson 1 — Email');
    this.hud.setLesson(0, LESSONS.length);
    this.say('Tap MailDrop below, type a password, and hit Send.');
  }

  // =====================================================================
  //  GUIDED ONBOARDING ACTIONS
  // =====================================================================

  private onOpenMail() {
    this.phone.showForm();
    this.phone.showMailCallout(false);
    this.say('Good. Now type any password and hit Send.');
  }

  private advanceToWatch() {
    this.phase = 7;
    this.hud.setObjective('Watch your bucket');
    this.say("See that? That's your data traveling. It'll reach the reservoir soon.");
  }

  private advanceToQuiz() {
    this.phase = 8;
    this.hud.setObjective('Answer the quiz');
    this.say('Quiz time — pick the right answer.');
  }

  private startNormalGame() {
    this.phase = 9;
    this.state.lessonIdx = 1;
    this.state.quizOpen = false;
    this.phone.hideQuiz();
    this.startLesson(1);
  }

  // =====================================================================
  //  GAME TICK (every frame)
  // =====================================================================

  private leakTimer = 0;
  private leakTutorialShown = false;
  private onFrame(dtSec: number) {
    if (this.phase < 9) return;
    // CW decay
    this.state.tickDt(dtSec);
    // Random leak spawning every 8-15 seconds
    this.leakTimer -= dtSec;
    if (this.leakTimer <= 0) {
      this.wb.spawnLeak();
      this.leakTimer = 8 + Math.random() * 7;
      // Leak tutorial: explain on first spawn
      if (!this.leakTutorialShown) {
        this.leakTutorialShown = true;
        this.say('A leak appeared! Tap it on the network to zap it. Leaks drain your water.');
      }
    }
  }

  // =====================================================================
  //  NORMAL LESSON FLOW
  // =====================================================================

  private startLesson(i: number) {
    this.state.lessonIdx = i;
    const L = LESSONS[i];
    this.say(L.teach[this.cohort]);
    this.hud.setObjective('Lesson ' + L.id + ' — ' + L.name);
    this.hud.setLesson(i, LESSONS.length);
    this.phone.resetForm();
    this.phone.guide();
    this.phone.showMailCallout(false);
    // Cookie banner is triggered AFTER the player sends (see onSend), so it never covers Send.
    this.phone.showCookie(false);
    this.wb.showDecoys(L.id === 4);
    this.wb.showEncryption(L.id === 5);
    this.wb.showPrivacy(L.id === 6);
    this.wb.showMeta(L.id === 7);
    this.wb.showFootprint(L.id === 8);
    this.wb.showTfa(L.id === 9);
    this.wb.showSafe(L.id === 10);
    this.state.quizOpen = false;
    this.phone.hideQuiz();
    this.phone.showHint(true);
  }

  // =====================================================================
  //  CORE ACTIONS
  // =====================================================================

  private onSend(pw: string) {
    sfx.click();
    const weak = pw.length < 8;
    this.phone.setPww(weak);
    this.lastClean = !weak;
    this.wb.spawnBucket(!weak, this.state.level);
    if (this.phase === 6) {
      this.advanceToWatch();
    } else if (weak) {
      this.say(cohortLine(this.cohort, 'roast'));
    } else {
      this.say(cohortLine(this.cohort, 'send'));
    }
    // Cookies lesson: the site asks for cookies right after you send your data
    if (LESSONS[this.state.lessonIdx].id === 2) {
      setTimeout(() => this.phone.showCookie(true), 900);
    }
  }

  private onDeadApp() {
    sfx.click();
    if (this.phase >= 6 && this.phase <= 8 && !this.state.quizOpen) {
      this.say(cohortLine(this.cohort, 'deadApp'));
    } else {
      this.say('That app is still locked. MailDrop is the one for now.');
    }
  }

  private replay() {
    this.wb.spawnBucket(this.lastClean, this.state.level);
    this.say(cohortLine(this.cohort, 'send'));
  }

  private onDeliver(clean: boolean) {
    sfx.deliver(clean);
    this.state.registerDeliver(clean);
    const gain = clean ? Math.round(30 * this.state.comboMult()) : 5;
    this.wb.deliverFx(clean, gain);
    if (clean && [3, 5, 10, 20, 30].includes(this.state.combo)) {
      this.wb.comboFx(this.state.combo);
      this.say(cohortLine(this.cohort, 'combo', { n: this.state.combo }));
    }
    if (this.phase === 7) {
      this.advanceToQuiz();
      this.state.quizOpen = true;
      this.phone.showQuiz(LESSONS[this.state.lessonIdx]);
      return;
    }
    if (!this.state.quizOpen) {
      this.state.quizOpen = true;
      this.phone.showQuiz(LESSONS[this.state.lessonIdx]);
    }
  }

  private answerQuiz(correct: boolean) {
    if (this.phase === 8) {
      if (correct) {
        sfx.quiz(true);
        this.state.addXp(40);
        this.phone.hideQuiz();
        this.state.quizOpen = false;
        this.wb.announce('+40 XP - learned!', 0x34d399);
        this.say('Got it! Now you know how email travels. Let the real game begin.');
        setTimeout(() => this.startNormalGame(), 1200);
      } else {
        sfx.quiz(false);
        this.state.penalizeCw(2);
        this.say("Not quite — try again.");
      }
      return;
    }
    if (correct) {
      sfx.quiz(true);
      this.state.addXp(40);
      this.phone.hideQuiz();
      this.state.quizOpen = false;
      this.wb.announce('+40 XP - learned!', 0x34d399);
      this.say(cohortLine(this.cohort, 'mission'));
      const next = (this.state.lessonIdx + 1) % LESSONS.length;
      if (next === 0) {
        setTimeout(() => this.showShareCard(), 1000);
      } else {
        setTimeout(() => this.startLesson(next), 700);
      }
    } else {
      this.state.penalizeCw(2);
      this.say(cohortLine(this.cohort, 'wrong'));
      sfx.quiz(false);
    }
  }

  private handleCookie(essential: boolean) {
    this.phone.showCookie(false);
    if (essential) {
      this.state.addXp(10);
      this.say('Essential only — clean choice.');
    } else {
      this.state.penalizeCw(6);
      this.wb.spawnLeak();
      this.wb.spawnLeak();
      this.wb.spawnTrackers(18);
      this.say('Accept-all invited 18 trackers to siphon your data. Look at them go.');
    }
  }

  private onLevelUp() {
    sfx.levelup();
    this.wb.setSkin(this.state.level);
    this.wb.flashNow();
    this.wb.announce('LEVEL ' + this.state.level + '!', 0xfbbf24);
    this.say(cohortLine(this.cohort, 'lvl'));
  }

  private setCohort(c: CohortId) {
    this.cohort = c;
    this.wb.setCohort(c);
    this.say(LESSONS[this.state.lessonIdx].teach[c]);
  }
  private help() {
    this.say(LESSONS[this.state.lessonIdx].teach[this.cohort]);
  }

  private say(t: string) {
    this.speechEl.textContent = t;
    this.speechEl.classList.remove('hidden');
  }

  // =====================================================================
  //  SHARE CARD (VIRAL: end-of-game stats card)
  // =====================================================================

  private showShareCard() {
    const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
    const min = Math.floor(elapsed / 60);
    const sec = elapsed % 60;
    const timeStr = min + 'm ' + sec + 's';
    const rank = RANKS[Math.min(this.state.level - 1, RANKS.length - 1)];
    const badge = COHORT_BADGES[this.cohort];
    const cName = COHORT_NAMES[this.cohort];
    const quote = QUOTES[Math.floor(Math.random() * QUOTES.length)];

    const overlay = el('div', { id: 'shareOverlay' });
    const card = el('div', { className: 'share-card' });
    card.innerHTML =
      '<div class="share-tag">PIPEDREAM PROTOCOL</div>' +
      '<div class="share-title">Mission Complete</div>' +
      '<div class="share-sub">10 lessons learned. The internet has fewer secrets now.</div>' +
      '<div class="share-cohort-icon">' + badge + '</div>' +
      '<div class="share-badge">' + badge + ' ' + cName + '</div>' +
      '<div class="share-stats">' +
        '<div class="share-stat"><b>' + rank + '</b>Rank</div>' +
        '<div class="share-stat"><b>' + Math.round(this.state.cw) + '/100</b>Clean Water</div>' +
        '<div class="share-stat"><b>' + this.state.xp + '</b>XP Earned</div>' +
        '<div class="share-stat"><b>x' + this.state.bestCombo + '</b>Best Combo</div>' +
        '<div class="share-stat"><b>' + this.state.sent + '</b>Buckets Sent</div>' +
        '<div class="share-stat"><b>' + timeStr + '</b>Time</div>' +
      '</div>' +
      '<div class="share-divider"></div>' +
      '<div class="share-quote">' + quote + '</div>' +
      '<div class="share-hint">screenshot this card to share your rank</div>' +
      '<div class="share-btns">' +
        '<button class="share-btn primary" id="shareClose">Play Again</button>' +
      '</div>';

    overlay.append(card);
    this.rootEl.append(overlay);
    requestAnimationFrame(() => overlay.classList.add('fade-in'));

    (card.querySelector('#shareClose') as HTMLElement).onclick = () => {
      window.location.reload();
    };
  }

  // =====================================================================
  //  STAGE INPUT: X-ray (long press) + zap/boost (tap)
  // =====================================================================

  private wireStageInput() {
    let pressT: number | null = null;
    const rectXY = (e: MouseEvent | TouchEvent) => {
      const r = this.stage.getBoundingClientRect();
      const cx = 'clientX' in e ? e.clientX : (e as TouchEvent).changedTouches[0].clientX;
      const cy = 'clientY' in e ? e.clientY : (e as TouchEvent).changedTouches[0].clientY;
      return { x: cx - r.left, y: cy - r.top };
    };
    const down = () => {
      pressT = window.setTimeout(() => {
        if (!this.wb.hasBucket()) {
          this.say('Send a bucket first.');
          return;
        }
        const on = !this.xrayOn;
        this.xrayOn = on;
        this.wb.setXray(on);
        if (on) {
          this.say(cohortLine(this.cohort, 'xray'));
          this.showXrayCard(true);
        } else this.showXrayCard(false);
      }, 350);
    };
    const up = () => {
      if (pressT) {
        clearTimeout(pressT);
        pressT = null;
      }
    };
    this.stage.addEventListener('mousedown', down);
    this.stage.addEventListener('mouseup', up);
    this.stage.addEventListener('mouseleave', up);
    this.stage.addEventListener('touchstart', down, { passive: true });
    this.stage.addEventListener('touchend', up);
    this.stage.addEventListener('click', (e) => {
      const { x, y } = rectXY(e as MouseEvent);
      if (this.wb.isTracing() && this.wb.tryBoost(x, y)) return;
      if (this.wb.zapAt(x, y)) {
        sfx.zap();
        this.state.rewardCw(4);
        this.state.addXp(20);
      }
    });
  }
  private xrayOn = false;

  private showXrayCard(show: boolean) {
    if (!show) {
      this.xrayCard.style.display = 'none';
      return;
    }
    this.xrayCard.style.display = 'block';
    this.xrayCard.style.left = '40px';
    this.xrayCard.style.top = '40px';
    this.xrayCard.innerHTML =
      '<b>Packet X-Ray</b><br>from: ' +
      this.cohort +
      '-piper@pipedream.mail<br>to: reservoir<br>payload: mail, reset-token, passphrase-hash<br>water: CLEAR';
  }
}
