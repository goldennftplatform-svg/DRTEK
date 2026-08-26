# Pipedream Protocol — Vite + PixiJS app

The real, buildable game from the GDD (`docs/pipedream-protocol/`), scaffolded so the
10-level campaign can be extended one piece at a time (GDD §11).

## Run
```
npm install
npm run dev        # http://localhost:5173
npm run build      # typecheck (tsc --noEmit) + vite build -> dist/
npm run preview
npm run test:beta  # headless Playwright: boots the built game and plays a full
                   # lesson loop, asserting zero console/page errors (saves beta-smoke.png)
```
The Beta smoke test is the QA gate, so you don't have to alpha-test by hand: it boots
Chromium, enters Beta, sends a clean password, answers the quiz, handles the cookie
banner on lesson 2, and exercises X-Ray + zap input — failing on any runtime error.

## Architecture (GDD §11.2)
```
src/
  engine/      game rules, NO rendering
    state.ts     GameState + event emitter (XP / CW / level / combo)
    trace.ts     deterministic bucket journey along waypoints (replay-friendly)
  content/     pure data
    cohorts.ts  4-voice Brick lines (open/send/xray/lvl/mission/combo/wrong)
    lessons.ts  LESSONS[] — extend this array to add levels 4-10
  render/      PixiJS v8 (the whiteboard)
    Whiteboard.ts  nodes, pipes, buckets, leaks, particles, floaters, flash
  ui/          DOM overlay (phone + HUD) — crisp text + a11y
    dom.ts hud.ts phone.ts
  game/        orchestrator: wires state <-> whiteboard <-> ui <-> input
    Game.ts
  main.ts      bootstrap
```

## Where to extend
All 10 levels are complete. To extend further:
- **New level:** add an entry to `LESSONS` in `content/lessons.ts` (teach lines + quiz).
- **New concept viz:** add a draw layer in `render/Whiteboard.ts` (e.g. money rails, consensus ring).
- **New mechanic:** add state + events in `engine/state.ts`, surface it in `ui/hud.ts`.
- **Cohort tone:** edit `content/cohorts.ts` — gameplay is identical, only voice changes.
- **Difficulty / adaptive:** change `LEVEL_XP` thresholds or CW decay rates in `state.ts`.

## Status
**Full 10-level campaign complete and automated Beta-tested.**

| Lvl | Name            | Concept Viz                               |
|-----|-----------------|-------------------------------------------|
|  1  | Email           | send + trace + packet cards               |
|  2  | Cookies         | tracker banner + cookie choice            |
|  3  | Passwords       | weak/strong bucket comparison             |
|  4  | Phishing        | network-map decoys (ADS / IMPOSTOR)       |
|  5  | Encryption      | green lock on bucket in transit           |
|  6  | Privacy         | privacy mask dimming non-reservoir nodes  |
|  7  | Metadata        | floating ts / device / loc labels         |
|  8  | Digital Footprint | ghost paths of previous bucket routes  |
|  9  | Two-Factor Auth | dual lock overlay (password + 2FA badge)  |
| 10  | Safe Browsing   | node traffic-lights (green / amber / gray)|

Plus: CW decay, XP + combo multiplier, level-up pipe skins, tappable leaks,
X-Ray inspect, tap-to-boost, cohort-adapted voices (T/Y/P/M). Run `npm run test:beta`
to play all 10 levels headlessly.
