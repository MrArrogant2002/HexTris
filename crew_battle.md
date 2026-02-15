# Crew Battle Multiplayer Design

## 1) Room Creation & Join Flow
- Leader creates a Crew Battle room and receives a shareable room code.
- Members join by room code.
- Room size: **minimum 5 players**, **maximum 30 players**.
- Minimum-5 gate keeps challenge pacing and reward economy healthy; for QA/beta, allow an optional `testRoom` flag with 2–4 players.
- Leader can only start once minimum player count is met.

## 2) Match Start Rules
- Leader starts the match for all joined members at once.
- Every player receives the **same map seed, same difficulty, same timers**, and same task schedule.
- Gameplay is individual (no shared board), but all players are in one synchronized session timeline.

## 3) Level Scaling by Member Count
- Match levels scale by player count to keep sessions fair and exciting (inclusive ranges):
  - **5–9 players:** 3 stages
  - **10–14 players:** 4 stages
  - **15–20 players:** 5 stages
  - **21–30 players:** 6 stages
- Each next stage increases wave pressure and challenge frequency equally for everyone.

## 4) Challenge Tasks & Power Rewards
- All players receive periodic shared tasks (example: clear X blocks in Y seconds, perform combo streak, clear multi-color set).
- Completing a task grants one tactical battle power.
- Battle power effect: **reduce one opponent’s score by 100 points**.
- Balance note: keep this value server-configurable (`scoreAttackValue`) so live-ops can tune by mode/season if score inflation changes.
- Recommended anti-abuse limits:
  - Cannot target the same opponent more than 2 times in a row.
  - Optional 8–12 second cooldown between attacks.
  - Last 15 seconds can be “no-attack” lock for final ranking integrity.

## 5) Ranking & Rewards
- At match completion, winners are selected by room size:
  - Small lobby: **Top 1**
  - Medium lobby: **Top 3**
  - Large lobby: **Top 5**
  - Very large lobby: **Top 10**
  - Full-scale lobby: **Top 15**
- Reward model (diamonds) should scale with both placement and room size.
- Suggested reward logic:
  - Base reward by placement tier
  - Multiplicative bonus by lobby bracket
  - Participation diamonds for non-top players to keep retention high

## 6) Additional Game Plans
- **Rematch Vote:** 70%+ players voting rematch reopens same room quickly.
- **Crew Streak Bonus:** consecutive top placements grant streak diamonds.
- **Task Variety Rotation:** daily rotating task pools to avoid repetition.
- **Fair Matchmaking Guardrails:** optional rank-band checks before room start.
- **Post-Match Highlights:** show biggest combo, best comeback, and most tactical attacks.
- **Spectator Mode (late join):** allow non-participants to watch until next round.

## 7) State Sync & Technical Notes
- Use authoritative room state (leader actions validated server-side).
- Broadcast checkpoints: room_created, member_joined, member_left, match_started, stage_changed, task_spawned, task_completed, score_attack_applied, match_finished.
- Keep deterministic gameplay by sharing seed + synchronized stage timeline.
- Persist results for leaderboard, rewards, and anti-cheat review.
