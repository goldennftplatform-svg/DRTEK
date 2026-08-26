# Pipedream Protocol — GDD
### Section 14 · Ready-to-Use Developer Prompt Snippets

Feed these back to a model (or me) to generate assets, dialogue, or code section-by-section. Each is self-contained; paste the referenced GDD section alongside.

---

## Dialogue & Writing

**D1 — Cohort dialogue batch**
> Using §03 style guides and §10 beat structure, write Brick’s dialogue for Level 6 Scene “International Wire Relay” in all four cohorts. Constraints: ≤22 words/line, one idea per line, per-cohort dials from §06.3, fraud gravity rule applies (no jokes during Concerned-Serious beats). Output as four JSON files matching the content DSL in §11.3 with keys `l6.wire.*`.

**D2 — Quiz generation**
> Generate 12 comprehension checks for Level 3 (metadata, inferred attributes, brokers) using §03 voices: 3 per cohort, multiple-choice, one distractor that reveals a common misconception, wrong-answer feedback that spawns a visualization (name which, per §07 entities).

**D3 — Localization-ready rewrite**
> Take §10 script and produce locale-neutral template IDs + en-US strings for all four cohorts, flagging any idiom that won’t translate and proposing neutral alternatives.

## Code Generation

**C1 — Vertical slice**
> Implement §08 hops 0–4 (“First Launch Ripple”) as a PixiJS v8 scene per §11: typed TS module, fixed-timestep sim reading a trace JSON (schema in §8.4), pooled bucket sprites, ParticleContainer trails, reduced-motion fallback. Include Vitest tests asserting trace completes at 1× within stated durations ±5%.

**C2 — Score engine**
> Build `ScoreEngine` per §07.3/§09: CW updates from event stream, XP ledger, badge triggers B01–B22, Zustand store selectors for the HUD cluster. Pure functions + unit tests for edge cases (floor at 0, double-badge prevention).

**C3 — Phone UI**
> Implement MailDrop signup form per §05.3/§10 Scenes 2–4: live bucket-preview chips bound to field necessity tags (`required|useful|optional|creepy`), pressure-gauge password meter driven by an entropy estimator, long-press confirm pattern, 44px targets, keyboard-safe mobile layout.

**C4 — Replay system**
> Extend C1: TraceRecorder persists command logs to localStorage; implement scrub UI (play/pause/speed 0.25–2×), deterministic re-render from log, and export/import code string.

## Art & Audio

**A1 — Brick sheet spec**
> Produce a sprite/rig production brief for Brick per §06: layer list for Rive puppet, 9 expression keyframe descriptions, per-cohort dial→animation parameter mapping table, palette hexes, and a do/don’t reference board description.

**A2 — Viz style kit**
> Create the visual style guide for §07/§08: bucket states (clear/murky/toxic/cleaned) as shape+color specs, pipe glow shader notes, contaminant/virus/antibody iconography, on navy #0B1220. Deliver as CSS-variable tokens + SVG symbol descriptions.

**A3 — Audio pass**
> Design the SFX map for §08 trace: per-hop cue names, character (material, pitch contour), duration caps, and Howler sprite layout; include the consensus “sunrise” chord progression and success chime motif used across all traces.

## Systems & QA

**S1 — Content pipeline**
> Write the Zod schemas + build-time validator for lesson/dialogue/trace/badge JSON (§11.3), including cohort fallback resolution (m→p→y→t) and a CLI report listing missing variants per beat.

**S2 — Balance pass**
> Given §09 tables, simulate two player archetypes (completionist, speedrunner) through the XP curve; output time-to-level predictions and proposed threshold adjustments if any level exceeds ±15% of target session counts.

**S3 — A11y audit checklist**
> From §05.6 and WCAG 2.2 AA, generate the QA checklist for one lesson end-to-end: color-independence of water states, focus order across phone↔whiteboard layers, subtitle/TTS coverage of all Brick lines, reduced-motion equivalence of moments #4/#5/#8.
