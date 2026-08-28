import { el } from './dom';
import type { GameState, CohortId } from '../engine/state';

export class Hud {
  private state: GameState;
  private cwEl = el('span', { id: 'cwVal', textContent: '100' });
  private xpEl = el('span', { id: 'xpVal', textContent: '0' });
  private objEl = el('div', { id: 'obj', textContent: 'Loading…' });
  private lvlEl = el('span', { id: 'lvlVal', textContent: 'Lv 1' });
  private comboEl = el('span', { id: 'comboVal', textContent: '' });
  private tideEl = el('span', { id: 'tideVal', textContent: '' });
  private lessonEl = el('span', { id: 'lessonVal', textContent: '' });
  private cbtns: HTMLElement[] = [];

  constructor(parent: HTMLElement, state: GameState, opts: { onHelp: () => void; onCohort: (c: CohortId) => void }) {
    this.state = state;
    const cwBox = el('div', { className: 'score cw-score' }, el('span', { className: 'drop' }), this.cwEl, ' Safety');
    const xpBox = el('div', { className: 'score' }, this.xpEl, ' XP');
    const pill = el('div', { className: 'pill' }, this.lvlEl, ' · ', this.comboEl, this.tideEl);
    const help = el('div', { className: 'pill', id: 'helpBtn', textContent: '? Help' });
    help.onclick = opts.onHelp;
    const beta = el('div', { className: 'pill', textContent: 'BETA', style: 'border-color:#FBBF24;color:#FBBF24' });
    const cohortWrap = el('div', { id: 'cohort' });
    (['t', 'y', 'p', 'm'] as CohortId[]).forEach((c) => {
      const b = el('div', { className: 'cbtn' + (c === 'y' ? ' sel' : ''), textContent: c });
      b.dataset.c = c;
      b.onclick = () => {
        this.cbtns.forEach((x) => x.classList.remove('sel'));
        b.classList.add('sel');
        opts.onCohort(c);
      };
      this.cbtns.push(b);
      cohortWrap.append(b);
    });

    parent.append(cwBox, xpBox, this.objEl, this.lessonEl, pill, beta, help, cohortWrap);
    state.on('change', () => this.update());
    this.update();
  }

  update() {
    const cw = Math.round(this.state.cw);
    this.cwEl.textContent = String(cw);
    this.xpEl.textContent = String(this.state.xp);
    this.lvlEl.textContent = 'Lv ' + this.state.level;
    this.comboEl.textContent = this.state.combo > 0 ? 'x' + this.state.comboMult().toFixed(1) : '';
    this.tideEl.textContent = this.state.tide > 0 ? ' · ' + '⟢'.repeat(this.state.tide) : '';
    this.tideEl.style.color = this.state.tide === 3 ? '#fbbf24' : '#34d399';
    // CW color: green > 60, amber 30-60, red < 30
    const cwScore = this.cwEl.parentElement;
    if (cwScore) {
      if (cw > 60) cwScore.style.color = '#34d399';
      else if (cw > 30) cwScore.style.color = '#f59e0b';
      else cwScore.style.color = '#e23a8e';
    }
  }

  setObjective(t: string) {
    this.objEl.textContent = t;
  }
  setLesson(current: number, total: number) {
    this.lessonEl.textContent = current >= 0 ? 'Lesson ' + (current + 1) + ' / ' + total : '';
  }
}
