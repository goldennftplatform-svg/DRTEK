import type { CohortId } from '../engine/state';

export type LineKey = 'open' | 'send' | 'xray' | 'lvl' | 'mission' | 'combo' | 'wrong' | 'roast' | 'deadApp';

// Cohort-adaptive Brick lines (GDD 3 + 6). One set of facts, four voices.
export const LINES: Record<CohortId, Record<LineKey, string>> = {
  t: {
    open: "Tap MailDrop! That free stuff isn't free - watch what you send.",
    send: "BOOM. First bucket!! okay I'm calm. That's your email crossing town.",
    xray: "Freeze! Tap a packet to see what's inside. Spies hate this.",
    lvl: "Level up! New pipe skin unlocked. You're officially a cleaner.",
    mission: "Nice. Next mission's on the top bar - go get it.",
    combo: 'COMBO x{n}! You\'re on fire - keep the clean chain going!',
    wrong: 'Not quite - take another look, you got this.',
    roast: "bro really typed '123456' in 2026 💀",
    deadApp: "That app's locked for now. MailDrop's the one."
  },
  y: {
    open: 'Open MailDrop. Pro tip: your email is your internet passport. Boring lasts.',
    send: 'That was your email crossing town. Later, we follow one across the ocean.',
    xray: 'X-Ray on. Inspect the bucket - see exactly what is riding along.',
    lvl: 'Pipe skin unlocked. The board levels up with you. Keep the chain.',
    mission: "Mission cleared. Streak's building. Don't break it.",
    combo: "COMBO x{n}! That's the energy. Gatekeepers hate this.",
    wrong: 'Close. The receipt was the tell. Try again.',
    roast: 'That password has the energy of a default Gmail 💀',
    deadApp: 'Not that one. Open MailDrop for this mission.'
  },
  p: {
    open: 'Open MailDrop. Fifteen minutes here saves hours of cleanup later.',
    send: 'Noted. That took four seconds. The visualizations get interesting from here.',
    xray: 'X-Ray pause. Reviewing packet contents is a core habit - use it often.',
    lvl: 'Promotion earned: new pipe skin. Hygiene compounds over time.',
    mission: 'Task complete. The next one is queued above.',
    combo: 'COMBO x{n}. Efficient and clean - exactly the habit.',
    wrong: 'Almost - review the hint and retry.',
    roast: "I've seen stronger passwords on sticky notes at the office.",
    deadApp: 'That module is inactive today. MailDrop is the active one.'
  },
  m: {
    open: 'Hello, and welcome. Tap MailDrop when you are ready - no rush at all.',
    send: 'There it goes. Beautifully done. That little bucket was yours, traveling safely.',
    xray: 'Take your time. The pause lets us look closely at what is inside a packet.',
    lvl: 'Well done - a new pipe skin. The board grows as you learn.',
    mission: 'Nicely done. Your next small task is shown at the top.',
    combo: 'COMBO x{n}. Lovely rhythm - one clean step after another.',
    wrong: 'Not quite - look again, there is no rush.',
    roast: 'Oh dear. That password would not survive five seconds out there.',
    deadApp: 'That one is not part of this lesson. Back to MailDrop, gently.'
  }
};

export function cohortLine(c: CohortId, key: LineKey, replace?: Record<string, string | number>): string {
  let s = LINES[c][key];
  if (replace) for (const k in replace) s = s.replace(`{${k}}`, String(replace[k]));
  return s;
}
