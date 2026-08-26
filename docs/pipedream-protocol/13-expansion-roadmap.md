# Pipedream Protocol — GDD
### Section 13 · Expansion Roadmap

Effort: **S** ≤ 1 wk · **M** ≤ 3 wk · **L** ≥ 6 wk (2-dev team baseline)

---

## v1.0 — Launch (baseline scope of this GDD)
Campaign L1–L10, badges, cosmetics, local save, PWA install, offline lessons. *(Sections 01–12)*

## v1.1 — Classroom & Community
- **Classroom co-op (L):** shared whiteboard sessions; teacher casts a trace, students each control one hop; TraceRecorder log syncs via WebRTC/WebSocket.
- **Teacher dashboard (M):** room codes, cohort presets, per-student progress (only what students opt to share), lesson assignment.
- **Share cards + badge showcase links (S).**
- **Teach-back mode (M):** player explains a hop aloud/text; simple rubric scoring; feeds B22.

## v1.2 — Real-World Bridge (opt-in “Advanced Mode”)
- **Testnet adapter (L):** behind an age-gated toggle: read-only explorer views first, then optional Sepolia-style testnet faucet + real signature flow using the same §08 cinematic. NetAdapter interface already isolates this (§11).
- **Hardware wallet awareness module (M):** simulate the ceremony; zero device I/O in edu mode.
- **Fee/reality sandbox (M):** live-ish network condition presets so gas/latency games reflect reality.

## v1.3 — Creator Layer
- **Route-puzzle editor & sharing (L):** players author pipe puzzles; community gallery with curation tags; remix chains.
- **Seasonal events (M):** e.g., “Fraud Awareness Month” wave-defense ladder, creator-cut comparison tournaments.
- **Cohort meme-pack drops (S):** rotating sticker packs per cohort culture.

## v2.0 — Institutional & Platform
- **Localization pass (L):** full i18n of dialogue DSL; regional fraud patterns (smishing variants) per locale.
- **LMS integrations (M):** xAPI/SCORM statements for schools and corporate training.
- **Accessibility certification pass (M):** external audit vs WCAG 2.2 AA.
- **VR whiteboard room (exploration S/M):** optional standalone mode reusing trace logs; not on critical path.

## Standing Principles for All Expansions
1. Edu mode stays 100% simulated; money-touching features are separate toggles, clearly labeled.
2. Nothing auto-shares, ever; all social features opt-in and handle-only.
3. Every new mechanic must produce a visualization within 500 ms (Pillar #1) — if it can’t be drawn as water, redesign it.
