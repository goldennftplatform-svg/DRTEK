# Pipedream Protocol — GDD
### Section 7 · Data-Water Metaphor System + Privacy-as-Virus Mechanics

---

## 7.1 Metaphor Dictionary

| Game entity | Real-world concept | Visual form |
|---|---|---|
| **Bucket** | A packet / message / API call | Rounded capsule, 24 px, liquid fill % = payload size |
| **Pipe** | A network link/hop | Glowing tube; width ∝ bandwidth |
| **Reservoir** | Server / database | Glass tank with fill level |
| **Cistern** | Your device storage | Small personal tank inside phone silhouette on map |
| **Faucet** | API endpoint | Valve that opens when called |
| **Filter** | Encryption, VPN, permission gate | Mesh screen; murky in → clear out |
| **Contaminant** | Trackers, pixels, excess PII fields | Colored sediment/dye dots (magenta/amber) |
| **Virus** | Malware / phishing payload | Spiky hexagonal blob, jitter motion |
| **Antibody** | Password manager, 2FA, cert check | Smooth torus that intercepts viruses, seals with membrane flash |
| **Toll Booth** | Fees / gas | Turnstile that skims a visible splash off the bucket |
| **Gate / Dam** | Platform intermediary | Sluice splitting rivers (30% pour-away) |
| **Consensus Ring** | Validators agreeing | Circle of lanterns lighting in sequence |

## 7.2 Water States

| State | Color / shape code | Meaning | Trigger examples |
|---|---|---|---|
| **Clear** | Cyan `#22D3EE`, smooth outline | Minimal, encrypted, necessary data only | Encrypted send, least-permission grant |
| **Murky** | Olive-brown sediment swirl | Overshared / unnecessary fields attached | Accept-all cookies, EXIF-laden photo upload |
| **Toxic** | Magenta `#E23A8E`, spiked outline | Credentials/exposed sensitive data | Phish click, plaintext password reuse |
| **Cleaned** | White flash → Clear | Post-remediation | Revoke, delete, rotate, flush action |

Shape codes (smooth/bumpy/spiked outlines) guarantee readability without color (accessibility, §05).

## 7.3 Clean Water Score Mechanics

`CW` (0–100, starts 100) updates on discrete events:

```
CW += Σ(grant_clean × w+)   e.g., deny unneeded permission +3,
                             enable 2FA +8, decline cookies +2
CW −= Σ(exposure × w−)      e.g., accept-all cookies −4 per tracker,
                             overshare field −2 each, phish click −15
CW floor per lesson: 0 (never negative-shame below zero)
```

- CW renders everywhere subtly: the phone status-bar droplet clarity, the cistern liquid color.
- **Decay-free by design** between lessons (hygiene persists — matches real life: settings stay set).
- Contamination is **visible spread**: murky buckets dye shared pipes; dye diffuses along connected edges at 2%/tick until flushed. Flush = Settings → Privacy → Clean Pipes (satisfying drain-gurgle SFX).

## 7.4 Virus / Immune System Layer (unlocks L4)

- **Attack surface model:** every exposure adds a **spore** to the map. More spores = higher ambient attack spawn rate (`spawnRate = base × spores^0.7`). Oversharing literally breeds pathogens.
- **Virus lifecycle:** Spawn → drift toward highest-value pipe → attempt latch → if no antibody covers that vector: **Infection** (bucket turns toxic mid-transit, alarm pulse) → player runs Remediation drill (rotate password sim, revoke session) → CW penalty + immune memory gained.
- **Immune memory:** each defeated vector is remembered; identical future attacks are auto-intercepted with a satisfying *ping*-seal animation. This mirrors learned immunity AND makes progress feel permanent.
- **Phish range (mini-game):** 12 inbound message-buckets; inspect sender address, link hover-preview, tone markers; classify Real / Phish. Wrong classifications spawn the corresponding infection visualization as teaching feedback.

## 7.5 What Counts as Necessary vs. Oversharing (designer reference)

Every form/permission in content JSON tags each field:

```json
{ "field": "birthday", "necessity": "optional",
  "why": "age-gate could use year only", "cw": -2 }
```

`necessity: required | useful | optional | creepy` — the UI surfaces this honestly (bucket-preview chips, §05), teaching players that *the game never lies about data* — modeling what good services should do.

## 7.6 Tone Guardrails

Contamination visuals are playful (sediment, grumpy fish), never gore/disgust. Infection states are recoverable within the lesson. The emotional target for a mistake is “fascinated,” then “empowered to fix.”
