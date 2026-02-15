# Crew Battle Multiplayer Design

## Core Match Flow
1. **Leader creates room**
   - Leader taps **Create Crew Battle**.
   - Server generates a unique 6-character room code.
   - Leader shares room code with crew members.

2. **Members join with room code**
   - Players enter room code in **Join Crew Battle**.
   - Room constraints:
     - Minimum: **5 players**
     - Maximum: **30 players**
   - Lobby shows live member count, ready state, and leader controls.

3. **Leader starts the match**
   - Start button becomes active only when member count is 5–30.
   - Match level plan is auto-generated from player count.
   - All players receive the same seed, spawn cadence, and difficulty multipliers.

4. **Everyone plays individually (synchronized difficulty)**
   - Gameplay is individual score-based (no shared board).
   - Every player gets the same challenge objectives per level.
   - Completing challenge objectives grants tactical powers.
   - Tactical power: **Score Sabotage** (single-use) reduces target opponent score by **100 points**.

5. **End of match + ranked winners**
   - Match ends after final level or timer expiry.
   - Players ranked by final score.
   - Reward brackets based on player count:
     - 5–7 players → Top **1**
     - 8–12 players → Top **3**
     - 13–18 players → Top **5**
     - 19–24 players → Top **10**
     - 25–30 players → Top **15**
   - Top players earn diamonds by rank tier.

## Level Scaling by Crew Size
- 5–10 players: 3 levels
- 11–20 players: 4 levels
- 21–30 players: 5 levels

Each higher level increases:
- wave speed multiplier
- spawn frequency
- challenge target thresholds

## Challenge & Power Loop
- Global level challenges (same for everyone), examples:
  - Clear 20 blocks of one color family
  - Reach combo x3
  - Survive 90 seconds without life loss
- On completion, player gains one tactical power charge.
- Tactical powers can be used during match windows with cooldown lock.

## Reward Structure (Diamonds)
- Base reward pool scales with room size.
- Example payout split:
  - Rank #1: 30%
  - Rank #2: 20%
  - Rank #3: 12%
  - Remaining top slots: evenly split 38%

## Suggested Additional Game Plans
1. **Fair-Play Start Shield**
   - First 20 seconds: no sabotage allowed.
2. **Revenge Protection**
   - A player cannot be sabotaged twice within 15 seconds.
3. **Spectator + Rejoin**
   - Disconnected players can reconnect within 60 seconds.
4. **Crew Seasons**
   - Weekly leaderboard with cosmetic + diamond rewards.
5. **Role Bonuses**
   - Leader aura: +5% diamond bonus to crew if at least 70% of players finish the match.

## Recommended Backend Events
- `room_created`
- `room_joined`
- `room_member_ready`
- `match_started`
- `challenge_completed`
- `power_used`
- `score_updated`
- `match_finished`
- `reward_distributed`

## Anti-Abuse Notes
- Validate room code server-side only.
- Sign score submissions with per-match session token.
- Apply server-authoritative score reduction for sabotage events.
- Reject duplicate `power_used` events using event-id deduplication.
