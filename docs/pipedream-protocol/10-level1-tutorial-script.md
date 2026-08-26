# Pipedream Protocol — GDD
### Section 10 · Level 1 Tutorial Script — “Your First Email”

Full script for **Cohort Y (18–30)**. Adaptation tables for T / P / M follow. Format: `beat` = state machine checkpoint; every beat autosaves.

---

## SCENE 1 — Welcome (whiteboard focus)

**[BRICK]** *(slides in stage-left, Neutral-Warm → Excited)*
“Welcome to the lab. I’m Brick. You’re a Piper now.”

*(Brick taps whiteboard; a single cyan bucket drops into a pipe and rolls across the board behind them.)*

**[BRICK]** “Everything you do on that phone *(points down at player’s hands)* becomes water moving through pipes somewhere. Today we make your first bucket.”

> **UI:** Objective ticker: *“Open MailDrop”* · Phone home screen glows on MailDrop icon.
> Skip affordance for experienced users after first prompt: “Been here before? → Fast-track.”

## SCENE 2 — Address anatomy

**[BRICK]** “Pick a name. Pro tip: your email is your internet passport. Boring lasts longer than spicy.”
*(Player types handle; domain picker shows @pipedream.mail only in L1.)*

Live preview chip appears under field:
`This address will receive: mail ✓ · password resets ✓ · spam, eventually ✗`

**[BRICK]** “user@domain. You’re the user. The domain is the neighborhood. Write that on your hand… metaphorically.”

✅ **Check 1 (tap-to-match):** match `you`, `@`, `site.com` to labels **who / where / what neighborhood**. Wrong answers: bucket wobbles + Brick re-explains with visual (no penalty).

## SCENE 3 — The form & the first data lesson

Signup form appears: name, birthday, recovery email (optional), terms link.

Every field shows its **bucket-preview chip** live (§05):
- Name → `sends: display name`
- Birthday → `sends: full date — they asked for ALL of it` *(amber tint)*
- Recovery → `optional. skip = fine`

**[BRICK]** “See amber? That’s them asking for more water than the ride needs. Your call. I just show the receipts.”

*(If player fills optional fields:)* **[BRICK]** “Bold. Watch what rides along.” — extra sediment dots visibly load into the bucket preview. No scolding; pure X-ray.

## SCENE 4 — Password moment

Strength meter is a **pipe pressure gauge**. As password strengthens, gauge water turns from murky to crystalline; weak choices make the gauge glass fog up.

**[BRICK]** “‘123456’ gets guessed faster than you can type it. Mix length + weirdness. Length wins fights.”

✅ **Check 2:** build a passphrase hitting 3 of 4 rules (12+ chars, no dictionary word alone, number/symbol, not reused). Pass grants badge progress toward B17 chain.

## SCENE 5 — LAUNCH (the magic)

Submit button pulses. Camera pulls back to whiteboard automatically.

**[BRICK]** *(Pointer pose)* “Eyes on the board. Three… two…”

**First Launch Ripple:** bucket assembles from typed fields (labels pour in as liquid), rolls out of phone silhouette → router → ISP hut → reservoir. 4-second trace. Chime. Confetti of clean droplets over Brick’s head (Celebrate anim).

**[BRICK]** “That was your email crossing town. Later, we’ll follow one across the ocean.”

## SCENE 6 — Comprehension close-out

✅ **Check 3 (2 questions):**
1. “What does the domain in `sam@pipedream.mail` tell you?” → *which service holds the mailbox* ✔
2. “You skipped an optional field. What happened?” → *less data left with the bucket* ✔

Rewards cascade: +100 lesson XP · Badge **B01 First Drop** · cosmetic drop: **Clear Case**.

**[BRICK]** “One account down, whole internet to go. Next: video night.” *(Idle-Bounce)*

---

## Cohort Adaptation Notes (same beats, different voices)

| Beat | Teen (T) | Professional (P) | Mature (M) |
|---|---|---|---|
| S1 welcome | “Hey! I’m Brick. We’re gonna break stuff — safely.” | “Welcome. Fifteen minutes here saves hours later.” | “Hello, and welcome. There’s no rush today — we go at your pace.” |
| S2 handle advice | “Skip the school name and birth year. Seriously.” | “Keep it professional-adjacent; recruiters read handles.” | “Something simple and easy to remember works best. No birthdays in it, though.” |
| S3 optional fields | “Amber = they want extra. Extra isn’t free.” | “Optional fields are data liability. Decline by default.” | “Those boxes aren’t needed. Leaving them empty is perfectly fine — and safer.” |
| S4 password | “Longer > weirder. A weird sentence beats a short symbol soup.” | “Length dominates entropy at this layer; use four random words.” | “Think of four small words together, like ‘blue otter rainy lamp.’ Long and strong.” |
| S5 launch | Same cinematic all cohorts — Brick’s line differs: “FIRST BUCKET!! okay I’m calm.” | “Noted. That took four seconds.” | “There it goes. Beautifully done. That was yours, traveling safely.” |
| S7 reward | +confetti scale per Energy dial | measured nod | warm handshake animation |

**Localization/authoring rule:** each beat stores four variants keyed `t|y|p|m`; missing variant falls back m→p→y→t. Never mix registers within one cohort track.
