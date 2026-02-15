# Hextris Physics & Matching Reference

## 1. Timing, Scaling, and Coordinate System
- The main loop in [src/core/GameLoop.ts](src/core/GameLoop.ts) converts the real-time gap between frames into a Hextris-friendly delta time: $dt = \frac{t_{now}-t_{last}}{16.666}$. Every system treats `dt` as "frames at 60 FPS" rather than absolute milliseconds, which keeps the legacy physics math intact.
- `GamePage` multiplies that base $dt$ by rush and power-up multipliers before handing it to gameplay systems, ensuring slow-motion or surge effects propagate in one place ([src/pages/GamePage.ts](src/pages/GamePage.ts)).
- All radial positions use `distFromHex`, a scalar distance from the hex center measured along the lane normal. Angular placement is stored as degrees in `Block.angle`, with lanes spaced at 60° increments (flat-top hexagon orientation). The helper `rotatePoint` converts trapezoid corners from local to screen space when blocks render.
- Screen scaling is normalized with `scale = min(canvasWidth, canvasHeight) / 800`. Spawn distances (`startDist`), block heights, line widths, and shake magnitudes multiply by this scalar so identical physics math works on phones and desktops without per-device tuning.
- Converting back to milliseconds is still possible when needed: actual time per frame step is $\Delta t_{ms} = dt \times 16.666$. Systems that express cooldowns in milliseconds (e.g., surges, time orbs) multiply by this factor to stay in sync with frame-based motion.

## 2. Core Entities and State Holders
### Hex Hub
- The `Hex` entity ([src/entities/Hex.ts](src/entities/Hex.ts)) owns six lane arrays (`blocks[0..5]`), keeps the current rotation offset (`position`), and tracks global timers like `ct` for combo UI.
- Its `radius = (sideLength/2) * \sqrt{3}` sets the first stable ring; every additional block adds exactly `block.height` to `distFromHex`, maintaining a perfect trapezoid stack.
- `Hex` is also the source of several global events (`blockLand`, combo timers, shake envelopes) and exposes `gdx/gdy` offsets so every renderer can inherit the current hit reaction without recomputing sine waves.

### Blocks
- `Block` objects ([src/entities/Block.ts](src/entities/Block.ts)) store both falling (`fallingLane`) and attached (`attachedLane`) indices, a per-piece speed scalar `iter`, and state flags (`settled`, `deleted`, `checked`).
- During rendering, only attached blocks chase `targetAngle`; falling blocks keep their spawn angle so they do not visually rotate with the hex. This mirrors the original game and prevents lane drift.
- Spawn animation timing uses `initLen = settings.creationDt`, typically 9 desktop frames or 60 mobile frames. While `initializing === true`, trapezoid points lerp radially from the center to avoid harsh pops when the wave generator produces dense bursts.

## 3. Block Lifecycle
1. **Spawn Patterns** – `WaveSystem` ([src/systems/WaveSystem.ts](src/systems/WaveSystem.ts)) decides when and where to create blocks. It increases difficulty over elapsed play time and in reaction to clears, mutating:
   - Spawn cadence `nextGen` (minimum ≈600 frame units).
   - Fall speed via `speedModifier` and surge scalars.
   - Lane patterns (random, double, spiral, crosswise, half/full circle).
2. **Instantiation** – `GamePage.spawnBlock` creates a `Block` with laptop/mobile-specific `startDist`, block height, and creation tween length. `Block.iter` is the per-piece fall speed delivered by the wave system.
3. **Falling Physics** – `PhysicsSystem.update` ([src/systems/PhysicsSystem.ts](src/systems/PhysicsSystem.ts)) iterates tracked blocks each frame:
   - Collision is always checked *before* movement to see if the upcoming step would cross a surface.
   - If still airborne, distance shrinks by `block.distFromHex -= block.iter * dt * scale`. Once `settled` becomes true, the block is removed from the falling list.
4. **Collision Resolution** – `Hex.doesBlockCollide` handles both falling and re-settling blocks. The landing lane is derived from the current rotation offset:
   - $lane = (sides - fallingLane + position) \bmod sides$.
   - If the lane has blocks, the top piece’s `distFromHex + height` is the new floor; otherwise the hex radius is used.
   - On impact, `Hex.addBlock` fixes the block’s `attachedLane`, pushes it into the lane array, and adds a shake entry for visual feedback.
5. **Post-Attachment State** – Newly landed blocks start with `tint = 0.6` to create the white flash, `checked = 1` so the matcher can prioritize them, and `settled = true`. When `blockLand` fires, HUD widgets and haptics can respond immediately without waiting for the next physics tick.

## 4. Matching, Popping, and Scoring
- After physics runs, `MatchingSystem.checkAllMatches` ([src/systems/MatchingSystem.ts](src/systems/MatchingSystem.ts)) performs a flood-fill across the radial/adjacent grid. Matches require ≥3 contiguous blocks of the same color.
- Clearing a cluster sets `block.deleted = 1`, emits score text at the polar centroid computed via averaged `distFromHex` and `angle`, and updates combo state:
  - Combos stay alive while successive clears happen inside `comboTime`, which stretches when the spawn rate rises. Score per clear is $points = n^2 \times comboMultiplier$.
  - Diamonds (special points) accrue from combo tiers; timer-attack spawns `TimeOrb`s when clears are dense enough.
- Flood-fill adjacency ignores diagonals: only `(side±1, index)` and `(side, index±1)` are eligible neighbors. Side indices wrap modulo six so horizontal scans can walk across the hex seam without special cases.
- `comboTime` defaults to 240 frames but recalculates to $(2700 / 16.667) * 3 * (1 / creationSpeedModifier)$ during hot streaks, giving players roughly three spawn cycles to continue the chain even if block generation accelerates.
- `block.deleted` progresses through `0 → 1 → 2`, where state 1 triggers `incrementOpacity()` fade-out and state 2 marks the slot as free. Any mechanic that teleports or vaporizes blocks should still respect this flow so gravity cleanup knows which indices to re-run.

## 5. Post-Clear Gravity and Lane Integrity
- `GamePage.update` removes fully faded blocks (`deleted === 2`) from each lane, remembers the lowest removed index, and marks every block above it as `settled = false`.
- A second pass calls `Hex.doesBlockCollide(block, index, lane)` for each attached block. This branch reuses the same collision math but references neighbor blocks instead of the falling list.
- Any piece that is still airborne after the collision check advances inward by the same kinematic equation used for falling blocks. This keeps stacks compact and guarantees there are no sub-pixel gaps because every block distance is quantized to `hexRadius + k * height`.
- Because gravity runs lane-by-lane, simultaneous gaps on different sides cannot interfere, and each lane conserves column order. This deterministic order is important for power-ups such as Hammer that delete an entire row index across all lanes.
- If the lowest deletion index is zero (gap at the base), the collision test clamps distance to the hex radius. That makes stacks shrink equally across lanes after a large clear, which is the signature Hextris "pop" effect.

## 6. Rotation Dynamics
- Player input rotates the hex via `Hex.rotate(direction)`. The function throttles desktop spins to one every 75 ms and shifts `position` modulo 6.
- Each attached block’s `targetAngle` shifts by ±60°. The `Block.draw` easing keeps motion smooth by accelerating angular velocity toward the target with an `angularVelocityConst` of 4, snapping precisely when the overshoot would flip sign.
- Falling blocks deliberately ignore these rotations—the lane they will land in is computed through the rotated coordinate system instead.

## 7. Auxiliary Falling Actors
- **Power-ups** – Managed by [src/systems/PowerUpSystem.ts](src/systems/PowerUpSystem.ts). `PowerUp.update` mirrors block physics: it subtracts `speed * dt * scale` from `distFromHex` and flags `collected` once it intersects the hex radius buffer. Upon collection, inventory UI events fire and hammer/slowmo/shield effects manipulate either the block grid (hammer) or speed multipliers.
- **Time Orbs** – [src/systems/TimeOrbSystem.ts](src/systems/TimeOrbSystem.ts) spawns orbs on a cooldown with probabilistic gating. They share the same radial fall logic; reaching the center awards extra time in timer-attack mode.
- Both entity types respect shake offsets (`hex.gdx/gdy`) so they visually align with hex jiggle effects.

## 8. Difficulty, Surges, and External Multipliers
- `WaveSystem` maintains `difficulty` (capped at 35) and recalculates speeds using a base of 1.6 plus a difficulty ratio. Surges temporarily scale both spawn cadence and fall speed according to config, and `setExternalMultipliers` lets power-ups (e.g., slowmo) clamp the values down to 40% speed safely.
- Destroying blocks feeds back into the system through `onBlocksDestroyed`, shaving frames off `nextGen` so harder phases naturally emerge from aggressive play.
- Difficulty increments use three slopes (sub-8, 8–15, >15) to keep early play approachable while still honoring marathon sessions. Each slope integrates `dt` deltas divided by million-scale constants, so surface-level tweaks (changing `speedModifier`) dramatically change progression speed.
- Surges provide two independent scalars: `spawnScalar` alters `creationSpeedModifier` (frequency) and `speedScalar` alters `speedModifier` (velocity). When a surge ends, the system reverts to stored base modifiers and schedules the next surge via `cadence` seconds. External multipliers (slowmo, rush) multiply *after* surge math so power-ups always remain authoritative.

## 9. Frame-Level Execution Order
Each animation frame during active play follows this strict order (see [src/pages/GamePage.ts](src/pages/GamePage.ts)):
1. Compute $dt$ with rush/power-up multipliers; sync `Hex.dt` and `Hex.playThrough` with difficulty.
2. Update `WaveSystem` (which may schedule new `Block`s) and auxiliary timers.
3. Step `PhysicsSystem` so falling blocks collide/advance.
4. Update power-ups and time orbs.
5. Run `MatchingSystem` to flag clears, emit score/combos, and notify diamond + timer subsystems.
6. Purge faded blocks, mark upper pieces as unsettled, and run the attached-block gravity pass.
7. Update floating texts, combo heat, and momentum meters.
8. Check `Hex.isGameOver` by counting active rows; trigger life loss/invulnerability if necessary.
9. Render: background → hex → attached stacks → falling blocks → collectibles → HUD overlays.

## 10. Key Takeaways for Contributors
- Respect the collision-before-move rule—reversing it introduces tunneling because distances are decremented in fairly large chunks at high difficulty.
- Keep falling blocks out of any rotation math. Only manipulate `targetAngle` for pieces that already attached; that prevents drift between visual and logical lanes.
- Use `distFromHex` + `block.height` quantization whenever adding new mechanics that place geometry around the hex. It guarantees that matching logic, which assumes equal radial spacing, stays exact.
- When introducing new clear mechanics, ensure they set `deleted = 1` (not immediately 2) so `Block.incrementOpacity` can finish the fade and the gravity pass knows which indices to free up.
- If you add additional falling actor types, consider routing them through `PhysicsSystem` if they interact with the stack, otherwise mirror the `PowerUp`/`TimeOrb` pattern so they coexist nicely with shakes and scaling.

## 11. Block State Machine & Event Hooks
- **Falling** – `settled = false`, `deleted = 0`, tracked by `PhysicsSystem`. Movement uses `iter` and `scale`, and `initializing` gates the spawn animation.
- **Landed / Pending Match** – `settled = true`, `checked = 1`, `Hex.addBlock` already pushed it into a lane. The matching pass clears `checked` after scanning to avoid duplicate work.
- **Clearing** – `deleted = 1`, `opacity` decays by `0.075 * dt`. When it crosses 0, `deleted = 2` and gravity cleanup can reclaim the index.
- **Removed** – `deleted = 2` and the block instance is spliced from the lane. At this point you may recycle the object or let GC reclaim it.
- Event timeline: `blockLand` (landing), `scoreUpdate` (after scoring), `comboAchieved`, `powerUpEffect`, and `powerUpCollected` all rely on the above transitions, so any new mechanic should dispatch similar hooks if it bypasses the usual code paths.

## 12. Collision Edge Cases & Tuning Notes
- **High-Speed Safety** – The inequality `block.distFromHex - (block.iter * dt * scale) - floor <= 0` is intentionally `<=` so even if `dt` spikes, the block clamps exactly to the surface rather than oscillating past it. Keep this pattern when adding new colliders.
- **Lane Underflow/Overflow** – Lane math always normalizes with `(lane + sides) % sides`, so feeding negative rotations or custom lane counts still yields a safe index. If you experiment with different polygon counts, ensure the rotation throttle (±60°) and block geometry (trapezoid width formulas) are updated to `360 / sides` equivalents.
- **Game-Over Checks** – `Hex.isGameOver(maxRows)` counts only `deleted === 0` blocks. If you introduce long-lived animations or shields that pause deletion, remember they still occupy a slot and can trigger life loss, which is consistent with legacy Hextris.
- **Power-Up Interactions** – Slow-motion multiplies `dt` downstream, so `PhysicsSystem`, `MatchingSystem`, and `WaveSystem` all automatically inherit the slowdown. Hammer, however, manually toggles `deleted = 1` across a row, so it still needs the gravity pass to finish the cleanup.
