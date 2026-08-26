# Pipedream Protocol — GDD
### Section 3 · Age-Cohort Dialogue Style Guides

All cohorts receive **identical learning content and mechanics**. Only tone, examples, humor, and guardrail emphasis change. Brick’s lines, tooltips, quiz framing, and celebration copy are all authored per-cohort via content JSON (see §11).

---

## 3.1 Cohort T — Teens (12–17) · “Guardian Mode”

- **Profile:** Digital natives, low formal knowledge, high oversharing risk.
- **Voice:** Protective older sibling — warm, direct, zero condescension, light meme energy (never forced).
- **Sentence rules:** ≤ 14 words average. One idea per line. Concrete objects over abstractions (“your photo” not “user-generated media assets”).
- **Humor:** Playful absurdity, gentle irony.
- **Guardrail emphasis:** Parental consent language, what NOT to sign up for, oversharing consequences, stranger danger reframed as “data strangers,” never share location/school/full name.
- **Never:** Slang that ages badly; scare tactics; implying the guardian is spying.

**Five example lines:**
1. “That free game skin isn’t free. It costs your birthday, your school, and your mom’s email.”
2. “A password is like a toothbrush: yours alone, replaced when it gets gross, never shared. Ever.”
3. “This app wants your location all the time. Hard pass. Tap ‘only while using.’”
4. “See those little crumbs following your bucket? Those are cookies. You get to say no.”
5. “Posting once = forever. The internet has a photographic memory and zero chill.”

## 3.2 Cohort Y — Young Adults (18–30)

- **Profile:** Creators, students, gig workers; fluent but exploited by platforms.
- **Voice:** Hype friend who knows the receipts — fast, funny, numbers-forward.
- **Sentence rules:** Punchy. Stats allowed. Rhetorical questions welcome.
- **Humor:** Self-aware internet culture, dry takes on gatekeepers.
- **Guardrail emphasis:** Creator economics (30% cuts), rights-reserving defaults, burnout-free pacing, “read before you sign” habits.
- **Never:** Cringe corporate relatability; moralizing about hustle culture either way.

**Five example lines:**
1. “You made it. They took 30%. Same energy as a landlord for your pixels.”
2. “Two-factor auth: because ‘hunter2’ is doing a lot of heavy lifting right now.”
3. “Every free app is a trade. You’re the currency. Let’s read the exchange rate.”
4. “Your data sold for $0.00 — to you. Everyone else paid. Wild system, right?”
5. “Congrats, that transaction cleared in 12 seconds. Your bank’s wire took 3 days. We have questions.”

## 3.3 Cohort P — Professionals (31–45)

- **Profile:** Career- and family-oriented; values time, security, ROI.
- **Voice:** Trusted colleague — efficient, practical, respectful of intelligence.
- **Sentence rules:** Business-clear. Lead with stakes, follow with the fix.
- **Humor:** Dry workplace wit, sparing.
- **Guardrail emphasis:** Family privacy, fraud exposure, account recovery hygiene, separating work/personal data, understanding fees.
- **Never:** Baby-talk; hype; wasting their time.

**Five example lines:**
1. “One leaked password can unlock your email, your bank, and your kids’ school portal. Here’s the 90-second fix.”
2. “Fraud costs customers an estimated $80B+ a year. Today you’ll watch exactly where that money leaks.”
3. “Your bank is careful. Careful also means slow and expensive. Both facts matter.”
4. “This permission lets the app read contacts even when closed. Revoke takes one tap. Take the tap.”
5. “You wouldn’t hand a stranger your house key because they rang politely. Same rule online.”

## 3.4 Cohort M — Mature (45+)

- **Profile:** Often new-ish to deep tech concepts; highest scam-targeting risk.
- **Voice:** Patient expert with grandchild-energy warmth — never slow-witted, never rushed.
- **Sentence rules:** Clear and complete; define terms inline the first time; generous pauses.
- **Humor:** Gentle, situational; the joke is on scammers, never on the player.
- **Guardrail emphasis:** Scam pattern recognition (urgency, gift cards, “bank official” calls), verification habits, “it’s okay to hang up,” slow money vs fast money.
- **Never:** Implying they’re old or behind; time pressure in UI copy.

**Five example lines:**
1. “Banks are careful with your money. Careful also means slow — today we’ll see why, and when faster is safe.”
2. “Real banks never rush you. Urgency is the scammer’s uniform. Spot it, and it loses its power.”
3. “Take your time. I’ll keep this bucket right here until you’re ready.”
4. “That message looks like your bank — but look closer: the address is one letter off. Nicely spotted.”
5. “You’ve just done something most people never see: watched your payment cross the ocean. Well done.”

## 3.5 Adaptation Matrix (same beat, four voices)

| Beat | Teen | Young Adult | Professional | Mature |
|---|---|---|---|---|
| Cookie consent moment | “Crumbs! Say no to the crumb army.” | “Accept-all = 47 trackers. Bold choice.” | “47 third parties now hold context. Decline.” | “Those were tracking cookies. Not food — spies. Let’s decline them together.” |
| Weak password warning | “‘12345’? Even my goldfish guesses that.” | “Brute-forced in 0.004s. Brutal.” | “That password falls in under a second. Upgrade path below.” | “Simple passwords are easy for thief-programs. Let’s build a strong one — I’ll help.” |
| First blockchain signature | “You signed it with a secret key. Basically a magic wand only you hold.” | “Signed. On-chain. No middleman took a bite.” | “You authorized it with your own key. No intermediary, no fee skimming.” | “Your secret key made your signature — like a wax seal only you own. Beautifully done.” |

**Implementation note:** Store as `content/dialogue/{beatId}.{t|y|p|m}.json`; fallback order m → p → y → t if a line is missing.
