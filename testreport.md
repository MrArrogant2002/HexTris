# Module 1: Thematic UI/UX Design

## Theme Palette Matrix

| Theme | Base Palette | Generated Shade Strategy | UI Concept |
|---|---|---|---|
| Retro | `#F26076 #FF9760 #FFD150 #458B73` | Per color: `tint(+20%)`, `soft(+10%)`, `shade(-18%)` | Warm arcade nostalgia, high readability |
| Neon | `#FF204E #A0153E #5D0E41 #00224D` | Per color: `tint(+20%)`, `soft(+10%)`, `shade(-18%)` | Electric magenta neon over dark depth |
| Sea | `#0F2854 #1C4D8D #4988C4 #BDE8F5` | Per color: `tint(+20%)`, `soft(+10%)`, `shade(-18%)` | Oceanic gradient with cool contrast |
| Sky | `#FFF100 #006BFF #08C2FF #BCF2F6` | Per color: `tint(+20%)`, `soft(+10%)`, `shade(-18%)` | Bright, airy, high-energy sky identity |
| Halloween | `#2A004E #500073 #C62300 #F14A00` | Per color: `tint(+20%)`, `soft(+10%)`, `shade(-18%)` | Spooky purple-orange seasonal contrast |
| Pink | `#3A0519 #670D2F #A53860 #EF88AD` | Per color: `tint(+20%)`, `soft(+10%)`, `shade(-18%)` | Deep romantic berry with punch accents |
| Wow-Pink | `#FFEDFA #FFB8E0 #EC7FA9 #BE5985` | Per color: `tint(+20%)`, `soft(+10%)`, `shade(-18%)` | Candy-pastel glam palette |
| Nature | `#F6F0D7 #C5D89D #9CAB84 #89986D` | Per color: `tint(+20%)`, `soft(+10%)`, `shade(-18%)` | Organic earth and moss progression |
| Forest | `#040D12 #183D3D #5C8374 #93B1A6` | Per color: `tint(+20%)`, `soft(+10%)`, `shade(-18%)` | Dense woodland with cool depth |
| Dark | `#000000 #3D0000 #950101 #FF0000` | Per color: `tint(+20%)`, `soft(+10%)`, `shade(-18%)` | Maximum-dark tactical red focus |

Theme runtime IDs remain backward compatible (e.g., `classic`) while displayed names now match requested labels (e.g., `Retro`).

## CSS `:root` Theme Blocks (Implemented)

```css
:root[data-theme='classic'] { --theme-block-1:#f26076; --theme-block-2:#ff9760; --theme-block-3:#ffd150; --theme-block-4:#458b73; }
:root[data-theme='neon'] { --theme-block-1:#ff204e; --theme-block-2:#a0153e; --theme-block-3:#5d0e41; --theme-block-4:#00224d; }
:root[data-theme='web-hero'] { --theme-block-1:#0f2854; --theme-block-2:#1c4d8d; --theme-block-3:#4988c4; --theme-block-4:#bde8f5; }
:root[data-theme='light'] { --theme-block-1:#fff100; --theme-block-2:#006bff; --theme-block-3:#08c2ff; --theme-block-4:#bcf2f6; }
:root[data-theme='retro-arcade'] { --theme-block-1:#2a004e; --theme-block-2:#500073; --theme-block-3:#c62300; --theme-block-4:#f14a00; }
:root[data-theme='fashion-pink'] { --theme-block-1:#3a0519; --theme-block-2:#670d2f; --theme-block-3:#a53860; --theme-block-4:#ef88ad; }
:root[data-theme='arena-neon'] { --theme-block-1:#ffedfa; --theme-block-2:#ffb8e0; --theme-block-3:#ec7fa9; --theme-block-4:#be5985; }
:root[data-theme='starbloom'] { --theme-block-1:#f6f0d7; --theme-block-2:#c5d89d; --theme-block-3:#9cab84; --theme-block-4:#89986d; }
:root[data-theme='turbo-forge'] { --theme-block-1:#040d12; --theme-block-2:#183d3d; --theme-block-3:#5c8374; --theme-block-4:#93b1a6; }
:root[data-theme='dark'] { --theme-block-1:#000000; --theme-block-2:#3d0000; --theme-block-3:#950101; --theme-block-4:#ff0000; }
```

Implemented global depth variables:
- `--theme-block-N-tint`
- `--theme-block-N-soft`
- `--theme-block-N-shade`

# Module 2: Physics Implementation & Power-Ups

Implemented refinements:
1. **Orbit Shift** now uses eased orbital radius blending (`easeOrbitDistance`) when lane-shifting settled stacks to avoid hard radial snapping.
2. **Tempo Break** now clamps dilation input (`0.4 <= multiplier <= 1.0`) and duration (`>=250ms`) to preserve simulation stability under extreme values.
3. **Collision Safety** in `PhysicsSystem` now includes:
   - fixed max substep integration (`MAX_PHYSICS_STEP = 1.25` frame-units in the normalized 60 FPS `dt` domain)
   - per-step velocity clamp (`min(iter*dt*scale, block.height*0.9)`)

These changes preserve collision-before-move ordering and reduce tunneling risk during high-speed spikes or time-dilation transitions.

# Module 3: Database & Integration Audit

## Mapping Audit

| Data Domain | Existing Collection Field(s) | Status | Notes |
|---|---|---|---|
| Theme ownership | `themesUnlocked` | ✅ Mapped | Synced via `ThemeManager.syncToAppwrite()` and `AppwriteClient.updateThemes()` |
| Theme selection | `selectedTheme` | ✅ Mapped | Synced via Settings + ThemeManager |
| Physics power inventory | `inventory_tempo`, `inventory_shift` | ✅ Mapped | Existing power-up inventory schema supports both required powers |
| Runtime physics transient state | N/A persisted by design | ⚠️ Ephemeral | Current architecture treats active physics effects as runtime-only state |

## Indexing/Integrity Recommendations

| Recommendation | Reason |
|---|---|
| Keep index on `userId` (unique/query) | Prevent duplicate user records and sync lookup lag |
| Keep index on `selectedTheme` | Fast profile/theme filtering and analytics |
| Preserve atomic update usage on themes payload | Prevent write collision between unlock/select operations |

# Module 4: QA & Stress Testing (Edge Case Analysis)

| Area | Edge Case | Risk | Recommended Fix |
|---|---|---|---|
| Theme Contrast | Neon text over bright accents | Medium (accessibility) | Add contrast gates in visual QA pass for buttons/labels |
| Theme Depth | Rapid block-spam with same hue | Medium | Use generated tint/soft/shade vars for layered block rendering |
| Orbit Shift | Dense lanes with mixed stack heights | Medium | Eased radius re-targeting + `checked=1` scan prioritization (implemented) |
| Tempo Break | Large `dt` spikes under CPU load | High | Substep integration + velocity clamp in physics update (implemented) |
| Collision | High-speed crossing floor in one frame | High | Preserve collision-before-move with capped per-substep movement (implemented) |
| DB Sync | Theme unlock + select race | Medium | Continue single payload writes via `updateThemes()` to avoid split writes |
| DB Writes | Frequent updates during unstable network | Medium | Keep local state as source-of-truth and retry async sync non-blocking |
