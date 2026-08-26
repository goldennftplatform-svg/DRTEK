# Pipedream Protocol — GDD
### Section 8 · Real-Time Data-Flow Visualization Blueprint

The signature system. Reference implementation target: **PixiJS v8 particle/graphics layers** (see §11). Everything below describes the canonical “Sign Transaction” trace; simpler traces reuse subsets of hops.

---

## 8.1 Hop Table (Phone → Blockchain → Phone)

| # | Hop | Visual | Duration | Camera |
|---|-----|--------|----------|--------|
| 0 | Finger press | Ripple rings from touch point; phone haptic tick (if supported) | 0.3 s | Macro: phone |
| 1 | Secure enclave | Golden key glyph spins inside phone bezel; tx-bucket assembles: fields fly in as glowing labels (`to`, `amount`, `gas`, `nonce`) and pour in as liquid | 1.0 s | Macro |
| 2 | Radio egress | Branch animation by connection type: **TowerNet** (arc to mast), **SkyLink** (beam up to satellite, delay beat), **CableCo** (bucket drops into floor pipe). Chosen type reflects player’s Settings switch | 0.8 s | Zoom out 1→2 |
| 3 | ISP exchange | Hut icon; packet stamped with tiny ISP tag (visible in X-ray) | 0.7 s | Pan |
| 4 | Backbone transit | Fiber pulse streaks across ocean path; other ambient traffic flows around (world-alive feel) | 1.2 s | Wide map |
| 5 | RPC data center | Fly-through: rack aisles, load-balancer splits 1→N, chosen rack lights chase the bucket; server fans spin up (audio swell) | 2.5 s | Interior cam |
| 6 | Mempool | Waiting room: buckets queue on benches; gas gauge above each; paying more bubbles you forward (teachable!) | 1.0 s | Interior |
| 7 | Consensus ring | Validators ring the block; lanterns ignite sequentially around globe; quorum glow converges; block seals with wax-stamp thunk | 2.5 s | Orbit ring |
| 8 | Confirmation | Receipt ripple expands from sealed block; confirmation counter `1…2…` ticks on phone card | 1.5 s | Split focus |
| 9 | Return path | Receipt bucket retraces reverse route (fast-forward ghosting) | 1.5 s | Reverse pan |
| 10 | Success | Phone chime + explorer card slides up: hash, fee paid (Toll Booth splash recap), confirmations | 0.5 s | Macro |

**Total ≈ 13.5 s.** Skippable after first view; replayable at 0.25× “X-ray speed” with hop captions.

## 8.2 Particle & Style Spec

| Element | Spec |
|---|---|
| Bucket capsule | 24×32 px rounded rect; liquid fill % = payload; outline shape codes per water state (§07) |
| Trail | 12-point fading ribbon; additive blend; alpha 0.35→0 |
| Contaminant dots | 4 px, magenta/amber, jitter ±1 px, detach on Filter pass |
| Pipe glow | 6 px stroke, outer glow 14 px @ 20% alpha; pulse on transit |
| Ambient traffic | 60–120 concurrent micro-packets mobile / ≤400 desktop; pooled objects |
| Palette | cyan clean, magenta toxic, amber sediment, green money, gold consensus, navy `#0B1220` bg |

## 8.3 Side-by-Side Compare Mode (“Mirror Worlds”)

Split canvas down the middle; same action runs twice simultaneously:
- **Left (Centralized):** bucket → Gate (dam) → Toll Booth skims visible splash → slow Settlement Clock spins → reservoir behind permission wall (X-ray shows stored plaintext fields tagged “retained”).
- **Right (Decentralized):** signed bucket → open node mesh → consensus lanterns → public ledger tank (X-ray shows encrypted blob + public metadata only).
Sync points force dramatic beats: both start together; left stalls at settlement while right seals — timing IS the lesson.

## 8.4 Event Schema (deterministic replay)

Every trace is an ordered command list; renderer is pure function of commands + clock:

```json
{ "traceId": "tx-sign-v1", "speed": 1,
  "cmds": [
    { "t": 0,    "op": "ripple",   "at": "phone.touch" },
    { "t": 300,  "op": "assemble", "bucket": "b1", "fields": ["to","amount","gas"] },
    { "t": 1300, "op": "hop",      "from": "phone", "via": "skylink", "to": "isp" },
    { "t": 6500, "op": "flythrough", "scene": "dc-rack", "target": "rpc-3" },
    { "t": 7500, "op": "consensus", "validators": 12 },
    { "t": 11500,"op": "return",   "receipt": true }
  ] }
```

Benefits: pause/scrub/replay for free; network-replayable in classroom co-op; trivially testable.

## 8.5 Implementation Notes

- Layer stack (bottom→top): static map SVG/raster → pipe graphics (Graphics) → ambient particles (ParticleContainer) → hero buckets (sprites) → FX overlays (glow/mask) → UI chips.
- Fixed-timestep sim (60 Hz accumulator) decoupled from render; traces interpolate by `t`.
- Object pooling mandatory; cap devicePixelRatio at 2; offscreen-canvas cache for static layers.
- Reduced-motion mode swaps swarms for trail-lines, disables camera shake, keeps all information channels intact.
