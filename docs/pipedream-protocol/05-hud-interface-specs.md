# Pipedream Protocol — GDD
### Section 5 · HUD & Interface Specifications

---

## 5.1 Two-Layer Composition

The screen is always composed of two layers:

1. **Foreground — Hands + Phone (first-person):** bottom ~45% on portrait mobile, bottom-right panel on desktop. The player’s stylized hands hold a simulated smartphone. All *interaction* happens here.
2. **Background — Classroom Whiteboard (the world):** the living visualization canvas. All *consequence* appears here. Brick stands stage-left of the board.

The magic rule: **act on the phone, watch the world respond.** A subtle parallax (gyro on mobile, mouse on desktop) sells depth between layers.

## 5.2 Layout Mockups

**Mobile portrait:**
```
┌───────────────────────────┐
│  WHITEBOARD CANVAS        │ ← viz (tap = inspect, pinch = zoom)
│  ┌─────────┐              │
│  │ score   │   [map/viz]  │
│  │ cluster │              │
│  └─────────┘              │
│                 ╭──────╮  │
│   [Brick]       │ obj- │  │ ← objective ticker (1 line)
│   (stage L)     │ective│  │
│                 ╰──────╯  │
├───────────────────────────┤ ← bezel seam w/ soft glow
│      ▂▂▂▂▂▂▂▂▂▂           │
│    ▂ HANDS + PHONE ▂      │ ← interaction zone (~45%)
│   ┌───────────────────┐   │
│   │  PHONE SCREEN UI  │   │
│   │                   │   │
│   └───────────────────┘   │
└───────────────────────────┘
```

**Desktop (16:9):** whiteboard fills background full-bleed; phone docked bottom-right at fixed 380×760 logical px; Brick stage bottom-left; score cluster top-right; objective ticker top-center.

## 5.3 Phone Specification

Frame: rounded rect, 9:19.5, case cosmetics visible (§09). Status bar shows simulated signal type (Wi-Fi / TowerNet / SkyLink), battery (pure flavor), and a tiny **water-drop signal icon whose clarity mirrors Clean Water score** — ambient feedback.

Simulated apps (home grid, 4×5):

| App | Unlocks | Function in game |
|-----|---------|------------------|
| **MailDrop** | L1 | Email client: compose, inbox, attachments (metadata demo) |
| **Streamly** | L1 | Video player: adaptive-stream visualization trigger |
| **Chirp** | L1 | Social feed: posting, overshare meter, follower sim |
| **Browser** | L1–2 | Mock web: cookie banners, pixel pages, forms |
| **Settings / Privacy Panel** | L1 | Permissions, trackers, connection switcher, theme |
| **VaultBank** | L6 | Banking sim: card/ACH/wire, statements, fraud events |
| **KeyCase** | L8 | Wallet sim: keys, seed backup, signing, gas est. |
| **AppGate Studio** | L7 | Creator dashboard: listings, payouts, cut comparisons |
| **Lens Lab** | L9 | AI image gen: prompt → render, data-flow demo |
| **NFT Workbench** | L9 | Mint flow: metadata, royalty, list for sale |
| **Piper ID** | Always | Profile: badges, cosmetics, cohort, save slots |

Phone UI conventions: 44 px minimum touch targets; every destructive action requires a long-press confirm; every data-sharing choice shows a **live bucket-preview chip** (“this sends: name ✓, birthday ✓, location ✗”).

## 5.4 Whiteboard Zones

| Zone | Position | Content |
|------|----------|---------|
| Main Canvas | Center | Active visualization (map / fly-through / buckets / route editor). Long-press any packet = **X-Ray Inspect** (freeze + contents card). |
| Brick Stage | Bottom-left | Brick puppet, speech bubbles, gesture anchoring. Collapses to corner avatar during dense viz. |
| Objective Ticker | Top-center | One line: current task + progress pips. Never more than one objective at a time. |
| Score Cluster | Top-right | XP bar, Clean Water droplet gauge, Data Clarity lens gauge. All animated on change. |
| Badge Tray | Left edge (collapsed) | Recent badge pops slide out; full tray in Piper ID. |
| Viz Mode Chips | Bottom edge of canvas | Auto-set by lesson; player can manually switch among unlocked views (Map / Buckets / Compare / Fly-through / Editor). |

## 5.5 Controls

- **Phone targets:** tap / long-press confirm / drag-to-sign (transaction signature is literally drawn).
- **Whiteboard:** pinch-zoom & pan (mobile); wheel-drag (desktop); tap node = info card; two-finger tap = reset camera.
- **Global:** persistent ⏸ pause freezes sim and dims non-essential UI; ⟲ Replay last trace; 🐢 X-ray slow-mo toggle (0.25×).

## 5.6 Accessibility & Comfort

- Colorblind-safe core palette: clean = cyan `#22D3EE`, contaminated = magenta `#E23A8E`, sediment = amber `#F59E0B`, money = green `#34D399`, consensus = gold `#FBBF24` (never red/green-only encoding; states also carry shape codes: clear=smooth, murky=bumpy outline, toxic=spiked outline).
- Subtitles always on by default, adjustable size; full TTS narration option per cohort voice.
- Reduced-motion mode replaces particle swarms with trail-lines and disables camera shakes.
- All lessons completable with switch-access tabbing; quiz timers optional (off for Cohort M by default).
