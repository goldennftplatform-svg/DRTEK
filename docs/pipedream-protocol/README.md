# Pipedream Protocol — Game Design Document

**Tagline:** *“Follow the data. Clean the water. Own the future.”*

Browser-based educational simulation (desktop + mobile). Players are **Pipers**: every action on a simulated smartphone materializes as water-buckets traveling living network visualizations on a classroom whiteboard, taught by **Brick**, a Lego-style instructor who adapts to four age cohorts.

## Document Index

| # | File | Section |
|---|------|---------|
| 01 | `01-pitch-core-fantasy.md` | Elevator pitch + core fantasy + pillars |
| 02 | `02-player-journey.md` | Full journey: first login → Grandmaster |
| 03 | `03-cohort-style-guides.md` | Four age-cohort voice guides + examples |
| 04 | `04-levels.md` | 10 levels: objectives, actions, viz unlocks |
| 05 | `05-hud-interface-specs.md` | Hands+phone HUD & whiteboard specs |
| 06 | `06-brick-character-bible.md` | Brick: appearance, personality dials, animation |
| 07 | `07-data-water-metaphor.md` | Data-water metaphor + privacy-as-virus mechanics |
| 08 | `08-viz-blueprint.md` | Transaction trace blueprint (phone→chain→phone) |
| 09 | `09-gamification-tables.md` | XP, badges, cosmetics, leaderboards |
| 10 | `10-level1-tutorial-script.md` | Full L1 script (Cohort Y) + adaptation tables |
| 11 | `11-tech-architecture.md` | Stack, state/replay architecture, budgets |
| 12 | `12-magical-moments.md` | Ten signature moments |
| 13 | `13-expansion-roadmap.md` | v1.1 → v2.0 roadmap |
| 14 | `14-dev-prompt-snippets.md` | Ready-to-use generation prompts |

## How to Iterate

1. **Build order** lives in §11.7; start with the vertical slice prompt **C1** in §14.
2. Each numbered file is standalone — regenerate or revise any single section without touching the others.
3. Cross-references use §NN notation (e.g., “§08” = file 08).
4. Canonical constants: palette and shape codes in §05.6/§07.2; XP curve in §09.2; content DSL schema in §11.3.
