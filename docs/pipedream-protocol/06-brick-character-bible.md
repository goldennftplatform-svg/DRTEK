# Pipedream Protocol — GDD
### Section 6 · Brick — Character Bible

---

## 6.1 Concept

**Brick** is the player’s instructor and constant companion: a gender-neutral, Lego-inspired minifig teacher who lives beside the whiteboard. Warm nerd energy — part favorite teacher, part lab partner. Brick is never a lecturer; Brick is a co-experimenter who says “look at this” more than “you should.”

**Lore blurb (one line):** Brick built the classroom’s whiteboard from salvaged server racks and refuses to explain where the water comes from. “Piper secret.”

## 6.2 Appearance

- **Proportions:** classic minifig — cylindrical head (~0.9 units), trapezoid torso, stubby legs; slightly oversized hands for readable gestures. Total height ~2.2 head-units.
- **Head:** stud on top; printed face; **no hair by default**, optional cosmetic hair/hat later.
- **Skin tones (player-selectable at boot):** 6 matte tones — Classic Yellow `#F7C948`, Warm Sand `#E0AC69`, Cocoa `#8D5524`, Ivory `#F1D3B2`, Umber `#5C3A21`, Mint (fun option) `#9AE6B4`.
- **Default outfit:** slate lab coat over teal hoodie, clipboard in left hand, stylus-pointer in right. Outfits are cosmetics (§09): Raincoat, Astronaut, Hazmat, Wizard, Denim, Graduation Gown, Neon Rave, Founder Blazer.
- **Palette rule:** Brick never uses contaminated magenta/amber in their design — Brick reads visually as “clean.”

## 6.3 Personality Dials (per cohort)

| Dial (0–100) | Teen T | Young Adult Y | Professional P | Mature M |
|---|---|---|---|---|
| Energy | 75 | 90 | 55 | 35 |
| Sarcasm | 25 | 55 | 30 | 5 |
| Patience (pause lengths) | 60 | 40 | 50 | 90 |
| Stats-forwardness | 20 | 80 | 70 | 30 |
| Guardrail nagging | 85 | 35 | 45 | 70 |
| Celebration scale | big | huge | measured | warm |

Same knowledge, same beats — different delivery. Implementation: dialogue JSON carries per-cohort variants; animation controller reads dial values to scale gesture speed and idle bounce amplitude.

## 6.4 Expression Set (9 core)

1. **Neutral-Warm** (resting) — slight smile, soft blink every 3–5 s.
2. **Excited** — brows up, double-bounce, confetti-ready pose.
3. **Pointer** — stylus raised toward board; head tracks referenced viz element.
4. **Curious** — head tilt 12°, hand to chin.
5. **Gentle-Correct** — slow head shake, palms-up “interesting!” (used for ALL wrong answers; never frowning).
6. **Celebrating** — arms up, jump cycle, clean-water droplets burst.
7. **Thinking** — look up-left, tapping stylus.
8. **Concerned-Serious** (fraud/security moments) — lowered brows, still posture, slower gestures. Used sparingly for gravity.
9. **Graduating Pride** — hand on heart, slow nod.

## 6.5 Animation Notes

- **Rig:** 2D layered puppet (Rive recommended; Spine acceptable) or low-poly 3D (~1.5k tris) if the team prefers shared renderer with fly-throughs.
- **States/idles:** Idle-Bounce (loop, amplitude = Energy dial), Listen (when player interacts), Board-Point, Walk-On (enters from stage-left with slide-whistle on level-up), Celebrate, Concerned-Hold.
- **Gesture grammar:** points AT whatever the viz highlights (anchored to world-space target, not screen-space); claps once when a comprehension check is answered; offers clipboard during forms.
- **Micro-magic:** when a bucket passes behind Brick, they turn to track it — sells that Brick lives in the same space as the simulation.
- **Voice policy:** short TTS-friendly lines (≤ 22 words) OR silent-with-subtitles mode; both always available. Cohort M defaults to slower speech rate (0.9×).

## 6.6 Character Rules (hard constraints)

1. Never shames, never scolds; mistakes get Curious/Gentle-Correct only.
2. Never recommends real products, exchanges, coins, or brands — categories only, always simulated.
3. Never touches the phone — the player’s hands are sovereign. Brick teaches; the player does.
4. Breaks the fourth wall sparingly: max one wink-equivalent per level.
5. In fraud scenes, Brick drops all humor (Concerned-Serious) — tonal contrast teaches gravity without preaching.
