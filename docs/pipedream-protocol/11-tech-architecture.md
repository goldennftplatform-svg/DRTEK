# Pipedream Protocol — GDD
### Section 11 · Technical Architecture Recommendations

---

## 11.1 Stack Summary (opinionated)

| Concern | Recommendation | Why |
|---|---|---|
| Build | **Vite + TypeScript** | Instant HMR, tiny output, PWA plugin |
| UI framework | **Preact or React** (phone/HUD only) | Small widget surface; viz stays outside React |
| Whiteboard renderer | **PixiJS v8 (WebGL/WebGPU)** | Best-in-class 2D particles on mobile; simpler than Three.js for the core |
| 3D fly-throughs | **Three.js** in isolated scenes, lazy-loaded | Only L5+ data-center/GPU-farm interiors need it |
| Brick | **Rive** runtime | Tiny files, state-machine puppets, per-cohort dial support |
| Audio | **Howler.js** | Cross-browser, sprite sheets |
| State | **Zustand** + typed **EventBus** | Phone-state vs sim-state separation |
| Content | JSON + **Zod** validation at build | Dialogue/viz DSL is pure data (see §08/§10) |
| i18n | i18next | Cohort × locale matrix |
| Save | localStorage (+ export/import code) | Privacy-first; cloud optional later |
| Leaderboards (optional) | Supabase/Firebase, handle-only | §09 policy |
| Tests | Vitest (sim/scoring) + Playwright (smoke) | Deterministic traces are trivially testable |

## 11.2 Process Architecture

```
Input (tap/drag) ──▶ PhoneStore ──▶ CommandBus ──┬─▶ SimCore (fixed 60Hz tick)
                                                 │     ├─ ScoreEngine (CW/DC/XP)
                                                 │     ├─ TraceRecorder (command log)
                                                 │     └─ WorldState (nodes/pipes/buckets)
                                                 └─▶ LessonFSM (beats, checks, rewards)
WorldState ──▶ PixiRenderer (pure draw of state)   BrickController ◀── dialogue events
```

**Key decisions:**
1. **Renderer reads state; never owns it.** Enables replay, slow-mo (time-scale), and headless tests.
2. **TraceRecorder** persists every command (`{t, op, ...}`) → free replay/scrub/classroom sync.
3. **Lesson content = data.** Engineers ship the engine once; authors ship JSON.

## 11.3 Content DSL Example (lesson beat)

```json
{
  "lessonId": "L1-email", "cohort": "y", "beats": [
    { "id": "s2-address",
      "brick": { "key": "l1.s2.welcome" },
      "ui": { "focus": "phone.MailDrop.handleField" },
      "viz": { "trace": "ambient-drip", "speed": 0.5 },
      "advance": { "on": "input.valid", "then": "check:match-anatomy" } }
  ],
  "checks": [ { "id": "match-anatomy", "type": "tap-match", "xp": 50,
                "retry": { "xp": 20, "spawnViz": "bucket-wobble" } } ]
}
```

## 11.4 Performance Budgets (mid-tier Android target)

| Metric | Budget |
|---|---|
| Frame time | ≤ 16.6 ms (60 fps); reduced-motion ≤ 8 ms |
| Concurrent hero buckets / ambient packets | 24 / 120 (mobile), 64 / 400 (desktop) |
| Heap | < 200 MB |
| Initial bundle | ≤ 900 KB gz (engine+L1); levels lazy-load |
| Texture memory | < 80 MB via atlas packing; DPR cap 2 |
| Battery | No rAF loop when idle > 10 s (auto-sleep to static frame) |

Tactics: object pooling everywhere, ParticleContainer for dots, offscreen-canvas cache for static map layers, trace interpolation instead of per-frame logic, audio sprites.

## 11.5 Safety & Privacy Guarantees (product-level)

- Zero third-party network calls in educational mode; the “internet” is an in-process simulation module with a mockable interface (`NetAdapter`) so a future testnet adapter plugs in without touching game code.
- No accounts required. Saves are local; leaderboard opt-in creates a random handle.
- COPPA/GDPR-K posture by architecture: nothing collected → nothing to leak. The game demonstrates the values it teaches.

## 11.6 Repo Layout

```
/src
  /engine        (sim tick, TraceRecorder, ScoreEngine)
  /render-pixi   (layers, pools, shaders-lite)
  /scenes-3d     (lazy fly-throughs)
  /phone         (UI components, apps)
  /content       (/lessons /dialogue /traces /badges  ← all JSON+Zod)
  /brick         (Rive controller, cohort dials)
  /audio
/tests
```

## 11.7 Delivery Phasing (build order)

1. Engine + Local Loop trace + MailDrop L1 (vertical slice = §10 script playable)
2. X-Ray Inspect + score cluster + badges
3. Immune layer + Phishing Range
4. Global map + rails overlay (Three.js intro optional here)
5. Wallet/signature cinematic (§08 full spec)
6. Route Editor + Mirror Worlds
7. Capstone, cosmetics shop, leaderboards, PWA polish
