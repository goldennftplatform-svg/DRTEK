import { el } from './dom';
import type { Lesson } from '../content/lessons';
import type { CohortId } from '../engine/state';

export interface PhoneCallbacks {
  onOpenMail: () => void;
  onSend: (pw: string) => void;
  onQuizAnswer: (correct: boolean) => void;
  onCookie: (essential: boolean) => void;
  onReplay: () => void;
}

export class Phone {
  private cb: PhoneCallbacks;
  private appMail!: HTMLElement;
  private appgrid!: HTMLElement;
  private mailform!: HTMLElement;
  private pw!: HTMLInputElement;
  private pww!: HTMLElement;
  private quiz!: HTMLElement;
  private quizQ!: HTMLElement;
  private quizOpts!: HTMLElement;
  private cookie!: HTMLElement;
  private mailCallout!: HTMLElement;
  private hintEl!: HTMLElement;

  constructor(parent: HTMLElement, cb: PhoneCallbacks) {
    this.cb = cb;
    const hands = el('div', { id: 'hands' }, el('div', { className: 'hand l' }), el('div', { className: 'hand r' }));
    this.pw = el('input', { id: 'pw', placeholder: 'type a password (8+ chars = clean)', type: 'password' }) as HTMLInputElement;
    this.pww = el('span', { id: 'pww', className: 'chip warn', textContent: 'murky water' });

    this.appMail = el('div', { className: 'app mail', id: 'appMail', textContent: 'MailDrop' });
    this.appMail.onclick = cb.onOpenMail;

    const send = el('button', { id: 'send', textContent: 'Send bucket ▶' });
    send.onclick = () => cb.onSend(this.pw.value);

    const appStreamly = el('div', { className: 'app dead', textContent: 'Streamly' });
    const appChirp = el('div', { className: 'app dead', textContent: 'Chirp' });
    const appBrowser = el('div', { className: 'app dead', textContent: 'Browser' });

    this.appgrid = el('div', { id: 'appgrid' }, this.appMail, appStreamly, appChirp, appBrowser);

    this.mailCallout = el('div', { className: 'mail-callout', textContent: '↓ TAP HERE' });

    const backBtn = el('button', { className: 'back-btn', textContent: '← Back' });
    backBtn.onclick = () => {
      this.mailform.classList.remove('show');
      this.appgrid.style.display = 'grid';
    };

    this.mailform = el(
      'div',
      { id: 'mailform' },
      backBtn,
      el('div', { className: 'form-header', textContent: 'MailDrop' }),
      el('div', { className: 'form-sub', textContent: 'Create a data bucket and send it through the network' }),
      el('input', { id: 'handle', placeholder: 'your name (e.g. sam)' }),
      this.pw,
      el(
        'div',
        { id: 'preview' },
        el('span', { innerHTML: 'Password strength: ' }),
        this.pww
      ),
      send
    );

    this.quizQ = el('div', { id: 'quizQ' });
    this.quizOpts = el('div', { id: 'quizOpts' });
    this.quiz = el('div', { id: 'quiz' }, this.quizQ, this.quizOpts);

    const cookieEssential = el('button', { className: 'ess', id: 'cookieEssential', textContent: 'Essential only' });
    const cookieAll = el('button', { id: 'cookieAll', textContent: 'Accept all' });
    cookieEssential.onclick = () => cb.onCookie(true);
    cookieAll.onclick = () => cb.onCookie(false);
    this.cookie = el(
      'div',
      { id: 'cookie' },
      el('div', { className: 'cookie-title', textContent: 'This site wants cookies' }),
      el('div', { className: 'cookie-sub', textContent: "'Essential only' keeps your data clean. 'Accept all' lets trackers follow you." }),
      cookieEssential,
      cookieAll
    );

    const screen = el('div', { id: 'screen' }, this.appgrid, this.mailform, this.quiz, this.cookie);
    const phone = el(
      'div',
      { id: 'phone' },
      el('div', { id: 'notch' }),
      el('div', { id: 'statusbar' }, el('span', { textContent: '9:41' }), el('span', { id: 'net', textContent: 'Wi-Fi' })),
      screen
    );
    const hint = el('div', {
      id: 'hint',
      textContent: 'Send clean buckets · Zap leaks · Keep your water above zero'
    });
    this.hintEl = hint;
    const replay = el('div', { id: 'replay', textContent: '⟲ Replay' });
    replay.onclick = cb.onReplay;

    parent.append(hands, phone, this.mailCallout, hint, replay);
  }

  setPww(weak: boolean) {
    this.pww.textContent = weak ? 'murky water' : 'crystal clear';
    this.pww.className = weak ? 'chip warn' : 'chip';
  }
  showForm() {
    this.appMail.classList.add('on');
    this.mailform.classList.add('show');
    this.appgrid.style.display = 'none';
    this.mailCallout.style.display = 'none';
  }
  resetForm() {
    this.appMail.classList.remove('on');
    this.mailform.classList.remove('show');
    this.appgrid.style.display = 'grid';
  }
  showMailCallout(show: boolean) {
    this.mailCallout.style.display = show ? 'block' : 'none';
  }
  showHint(show: boolean) {
    this.hintEl.style.display = show ? 'block' : 'none';
  }
  guide() {
    document.querySelectorAll('.pulse').forEach((e) => e.classList.remove('pulse'));
    this.appMail.classList.add('pulse');
  }
  showQuiz(lesson: Lesson) {
    this.quizQ.textContent = lesson.quiz.q;
    this.quizOpts.innerHTML = '';
    let locked = false;
    lesson.quiz.opts.forEach((o) => {
      const b = el('button', { className: 'qopt', textContent: o.text });
      b.dataset.correct = String(o.correct);
      b.onclick = () => {
        if (locked) return;
        if (o.correct) {
          b.classList.add('correct');
          this.cb.onQuizAnswer(true);
        } else {
          locked = true;
          b.classList.add('wrong');
          const all = this.quizOpts.querySelectorAll('.qopt');
          all.forEach((opt, i) => {
            if (lesson.quiz.opts[i].correct) opt.classList.add('correct');
            (opt as HTMLElement).style.pointerEvents = 'none';
          });
          setTimeout(() => {
            all.forEach((opt) => {
              opt.classList.remove('wrong', 'correct');
              (opt as HTMLElement).style.pointerEvents = '';
            });
            locked = false;
            this.cb.onQuizAnswer(false);
          }, 1500);
        }
      };
      this.quizOpts.append(b);
    });
    this.quiz.classList.add('show');
    this.cookie.classList.remove('show');
  }
  hideQuiz() {
    this.quiz.classList.remove('show');
  }
  showCookie(b: boolean) {
    this.cookie.classList.toggle('show', b);
  }
}
