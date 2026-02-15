# Crew Battle Mode Design

## 1) Match Flow
1. **Lobby Creation**: Leader creates room and receives a 6-character room code.
2. **Join Phase**: Players join with code (`min=5`, `max=30`).
3. **Validation + Countdown**: Server validates roster, seed, and readiness, then starts a 5s countdown.
4. **Match Start**: All clients receive shared match seed and level schedule.
5. **Level Progression**: Players run identical solo simulations (same spawn logic, difficulty, and physics).
6. **Results Phase**: Rankings calculated, sabotage audit applied, rewards granted, rematch vote opens.

## 2) Room Lifecycle & Failure Handling
- **States**: `CREATED -> OPEN -> LOCKED -> IN_MATCH -> RESULTS -> CLOSED`.
- **Leader disconnect in OPEN**: leadership migrates to oldest connected player.
- **Leader disconnect in LOCKED/IN_MATCH**: no migration required for authority; server continues deterministic simulation authority.
- **Join failures**:
  - invalid code -> reject with reason.
  - full room -> reject with current count.
  - match already started -> reject and suggest spectate (if enabled).
- **Reconnect window**: 30s grace during match; player can resume with same session token.
- **Hard desync detection**: checksum mismatch triggers soft-resync; repeated mismatch flags score as provisional.

## 3) Level Scaling Logic
- Levels scale with player count to keep match length fair:

| Players | Levels |
|---:|---:|
| 5-8 | 5 |
| 9-12 | 6 |
| 13-16 | 7 |
| 17-22 | 8 |
| 23-30 | 9 |

- Each level uses increased wave pressure but identical deterministic tuning for all players.

## 4) Tasks & Challenges
- Every level issues 2 rotating tasks from a shared seeded task pool.
- Task examples:
  - Clear 12 blocks of one color
  - Finish 2 combos of 4+
  - Survive 20 seconds without life loss
  - Collect 1 time orb
- Completing a task grants one temporary **Sabotage Charge**.
- Charge duration: 20 seconds to use; expires if unused.

## 5) Power-Based Score Sabotage Rules
- Spending one Sabotage Charge applies `-100` score to one target opponent.
- Constraints:
  - 2 second global cooldown between sabotage casts.
  - Cannot target same opponent more than once within 10 seconds.
  - Cannot reduce target score below zero.
  - Max 5 successful sabotages received per player per match.
- Server-authoritative application time and ordering prevent race-condition abuse.

## 6) Anti-Griefing Protections
- Rate-limit sabotage and target repeat windows.
- AFK detection: no input for 25s marks player inactive and ineligible for top rewards.
- Disconnect abuse protection: repeated reconnect drops sabotage capability for current level.
- Reportable events: toxic spam pings and coordinated grief patterns logged for moderation.

## 7) Ranking & Tie-Breakers
- Primary rank: **highest final score**.
- Tie-breakers (in order):
  1. Fewer life losses
  2. Higher max combo
  3. Faster level completion timestamp
  4. Lower total sabotage penalties received
  5. Shared rank if all above equal

## 8) Top Player Cutoff by Lobby Size
- Rewarded top set is selected from `{1, 3, 5, 10, 15}`:

| Players | Rewarded Top |
|---:|---:|
| 5-6 | 1 |
| 7-10 | 3 |
| 11-16 | 5 |
| 17-24 | 10 |
| 25-30 | 15 |

## 9) Reward Distribution (Diamonds)
- Diamond pool scales by lobby size and rank.
- Baseline pool: `players * 20`.
- Distribution model:
  - Rank 1: `22%` of pool
  - Rank 2-3: `13%` each
  - Rank 4-5: `8%` each
  - Remaining rewarded slots: descending from `6%` to `1%`
- Minimum floor: every rewarded player receives at least 10 diamonds.

## 10) Latency & Fairness
- Inputs are client-side immediate but validated server-side with frame IDs.
- Match seed, physics order, and spawn schedule are fixed at lock time.
- Score/sabotage events are server-authoritative and replayable from event log.
- Late packets are accepted inside a small grace window; out-of-window packets are dropped deterministically.

## 11) Additional Competitive Features
- **Crew Synergy Bonus**: pre-made crew that all finish objectives gets +5% diamonds.
- **Spectator Mode**: eliminated/inactive players can watch top 3 live boards.
- **Instant Rematch**: 60% lobby vote starts rematch with same room and fresh seed.
- **Season Ladder**: Crew Battle MMR, seasonal rewards, anti-smurf placement calibration.
- **League Rulesets**: weekly modifiers (no sabotage week, high-speed week, objective-heavy week).
