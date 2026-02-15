# Hextris - TypeScript Rewrite

Modern hexagonal falling block puzzle game built with TypeScript, Tailwind CSS, and Vite. Redesigned with new
mode strategies, powers, and controls.

## 🎮 Features

- **Modern Architecture**: Clean TypeScript codebase with proper type safety
- **Glassmorphic UI**: Polished gradients, soft blur layers, and bold typography
- **Responsive Design**: Works seamlessly on mobile, tablet, and desktop
- **Hash-based SPA**: Fast page transitions without reloads
- **Component Library**: Reusable UI components (Button, Modal, Card, Input)
- **State Management**: Centralized state with event system
- **Game Modes**: Resonance Drift, Sync Link, Pulse Relay, Hexforge Trials
- **Special Points System**: In-game currency for power-ups and continues
- **Life System**: 3 lives with bonus lives at milestones
- **Powers**: Pulse Wave, Tempo Break, Aegis Field, Orbit Shift, Nova Spark
- **Cloud Saves**: Appwrite integration for persistent data
- **Multiplayer**: Group-based leaderboards synced via Appwrite

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm

### Installation

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview

# Type check
pnpm type-check
```

## 📁 Project Structure

```
hextris/
├── src/
│   ├── main.ts              # Entry point
│   ├── router.ts            # Hash-based router
│   ├── tailwind.css         # Tailwind imports + custom styles
│   ├── core/                # Core game architecture
│   │   ├── StateManager.ts  # Centralized state
│   │   ├── GameLoop.ts      # Render/update cycle
│   │   ├── Canvas.ts        # Canvas utilities
│   │   └── constants.ts     # Game constants
│   ├── pages/               # Page components
│   │   ├── BasePage.ts      # Abstract base class
│   │   ├── EntryPage.ts     # Name entry
│   │   ├── MenuPage.ts      # Main menu
│   │   └── ...
│   ├── ui/                  # UI components
│   │   ├── components/      # Reusable components
│   │   ├── modals/          # Modal dialogs
│   │   └── hud/             # In-game HUD elements
│   ├── entities/            # Game entities
│   ├── systems/             # Game systems
│   ├── network/             # API clients
│   ├── config/              # Configuration files
│   ├── types/               # TypeScript definitions
│   └── utils/               # Utility functions
├── public/
│   └── index.html           # HTML template
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── vite.config.ts
```

## 🎮 Game Modes

### Resonance Drift (Single)
- **Rule**: Clearing 4+ blocks builds Resonance; switching colors accelerates charge.
- **Rule**: Full Resonance triggers a slow-tempo surge and bonus scoring window.
- **Strategy**: Rotate often to diversify colors and ignite Resonance before danger builds.
- **Workflow**: Build Resonance with big clears → trigger Resonance Surge → enjoy slowed tempo + boosted scoring → meter resets.
- **Power Flow**: Drops arrive on a score + timed cadence; Pulse clears outer stacks, Tempo extends safety, Aegis covers critical stacks.

### Sync Link (Multiplayer)
- **Rule**: Every clear charges Sync Link; 100% triggers a Sync Burst that calms waves.
- **Rule**: Sync slowly drains between clears.
- **Strategy**: Coordinate clears to maintain Harmonic tiers and time burst windows.
- **Workflow**: Clear blocks to fill Sync → trigger Sync Burst → reduced pressure for the crew → Sync resets.
- **Power Flow**: Powers spawn at the same cadence; Nova is best during Harmonic tiers, Aegis protects when Sync drains.

### Pulse Relay (Timer)
- **Rule**: Relay nodes spawn after strong clears; collect four to extend time.
- **Rule**: Each Relay stage increases overall speed and scoring bonuses.
- **Strategy**: Use Tempo Break before Relay completions to stay safe.
- **Workflow**: Chain 4+ clears to spawn nodes → collect 4 nodes → time extension + stage bump → pace increases.
- **Power Flow**: Tempo before node pickups, Pulse to reset outer lanes, Nova to amplify Relay bonuses.

### Hexforge Trials (Challenge)
- **Rule**: Daily objectives track rotations, clears, and power usage.
- **Rule**: Complete the objective to earn bonus diamonds and streak perks.
- **Strategy**: Read objectives first; tailor power usage to the requirement.
- **Workflow**: Review the daily objective → complete tracked targets → earn streak rewards at game over.
- **Power Flow**: Some trials disable powers; otherwise powers follow standard cadence to help meet objectives.

## ⚡ Powers System

| Power | Effect | Cooldown |
| --- | --- | --- |
| **Pulse Wave** | Clears the outermost ring of blocks across every lane. | 8s |
| **Tempo Break** | Slows block fall and spawn rhythm briefly. | 10s |
| **Aegis Field** | Grants invulnerability while the field is active. | 12s |
| **Orbit Shift** | Rotates all settled stacks one lane clockwise. | 11s |
| **Nova Spark** | Boosts scoring output for the next clears. | 14s |

### Orbit Shift physics note

- Orbit Shift remaps only settled lane stacks; it does not rotate the outer hex container.
- After remap, each shifted block is snapped back to lane spacing with:
  `distFromHex = hexRadius + (block.height * laneIndex)` to prevent overlaps and micro-gaps.
- Collision remains collision-before-move, so new falling blocks always test against the shifted stack tops first.

## ⌨️ Keyboard Shortcuts

Arrow keys always rotate the hexagon. Secondary keys can be remapped in **Settings → Controls**.

| Action | Default |
| --- | --- |
| Rotate Left | Arrow Left / Arrow Up / Q |
| Rotate Right | Arrow Right / Arrow Down / E |
| Glide Boost | Shift / S |
| Pause | P / Space / Esc |
| Use Power Slot 1-3 | 1 / 2 / 3 |

## 📱 Mobile Controls

- Swipe left/right to rotate or tap the mobile action dock buttons.
- Hold **Boost** in the dock to glide blocks faster.
- Tap **P1–P3** in the dock (or the inventory slots) to trigger powers.
- Use the **Pause** button in the dock to open the pause menu.

## 🎨 UI/UX Guidelines

- Glassmorphism cards with subtle blur, glow, and high-contrast accents.
- Layered gradients to keep focus on the hexagon without visual clutter.
- Responsive stacks that switch from vertical to grid layouts across breakpoints.
- Motion-first feedback on buttons, meters, and power activations.

### Typography

- Font: Exo 2 (Google Fonts)
- Scales: text-sm to text-6xl
- Weights: 300-900

### Components

- **Button**: 4 variants (primary, secondary, outline, ghost)
- **Modal**: Glassmorphic backdrop with centered content
- **Card**: 3 variants (default, glassmorphic, dark)
- **Input**: Validation with error states

## 🔧 Development

### Tech Stack

- **TypeScript**: Type-safe JavaScript
- **Vite**: Fast build tool and dev server
- **Tailwind CSS**: Utility-first CSS framework
- **Appwrite**: Backend as a Service
- **pnpm**: Fast, disk-efficient package manager

### Code Style

- Strict TypeScript mode enabled
- ESLint for code quality
- Path aliases (`@core`, `@ui`, `@systems`, etc.)
- Modular architecture with clear separation of concerns

### Environment Variables

Create a `.env` file in the root:

```env
VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=your_project_id
```

## 🗄️ Appwrite Database Schema (Theme Sync Redesign)

### Users collection (19 columns + optional inventory map)
1. userId (string)
2. name (string)
3. email (string)
4. singlePlayerHighScore (number)
5. totalDiamonds (number)
6. gamesPlayed (number)
7. totalPlayTime (number)
8. themesUnlocked (string[])
9. selectedTheme (string)
10. timerAttackBest (number)
11. inventory_continue (number)
12. inventory_extraLife (number)
13. inventory_pulse (number)
14. inventory_tempo (number)
15. inventory_aegis (number)
16. inventory_shift (number)
17. inventory_nova (number)
18. themePaletteVersion (string, e.g. `2026.02`)
19. themeSyncAt (string / ISO date)

Optional: inventory (JSON map) if you store all inventory counts in one field.
Example: `{"pulse": 2, "tempo": 1, "aegis": 0, "shift": 1, "nova": 0, "continue": 0, "extraLife": 1}`

### ThemeProfiles collection (7 columns)
1. themeId (string, matches `ThemeName`)
2. themeName (string)
3. blockColors (string[] of 4 hex colors)
4. accentColor (string hex)
5. buttonGradient (string[] start/end hex colors)
6. uiPrimary (string hex)
7. background (string CSS/hex)

### ThemeScores collection (6 columns)
1. userId (string)
2. themeId (string)
3. bestScore (number)
4. gamesPlayed (number)
5. updatedAt (string / ISO date)
6. mode (string)

### Groups collection (6 columns)
1. roomCode (string)
2. groupName (string)
3. createdBy (string)
4. memberIds (string[])
5. memberCount (number)
6. isActive (boolean)

### GroupScores collection (7 columns)
1. userId (string)
2. groupId (string)
3. userName (string)
4. bestScore (number)
5. gamesPlayed (number)
6. lastPlayedAt (string / ISO date)
7. difficulty (string)

## 📱 Responsive Design

- **Mobile**: < 640px - Fullscreen canvas, minimal HUD
- **Tablet**: 640px-1024px - Scaled canvas, adapted HUD
- **Desktop**: > 1024px - Centered canvas, full HUD

## 🌐 Browser Support

- Chrome/Edge (Chromium) 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Android)

## 📄 License

MIT License - see LICENSE.md

## 🤝 Contributing

This is a rewrite project converting vanilla JS to TypeScript. Contributions welcome!

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 🎮 Original Credits

Based on the original Hextris game, modernized with TypeScript and Tailwind CSS.

---

**Current Status**: Resonance redesign shipped ✅ - new modes, powers, and control remapping are live.

## 🎨 Theme extension guide

Current catalog includes 10 branded themes:
Spiderman, Cinderella, Barbie, Avengers, Batman, Galaxy, Cyberpunk, Jungle, Ocean, Retro.

To add a new theme:
1. Add a new `ThemeName` enum key in `/src/config/themes.ts`.
2. Add its `colors.blocks`, `ui.accent`, and `colors.background` values in the `themes` map.
3. Ensure `applyThemeToDocument` writes required CSS variables for UI (`--theme-ui-primary`) and blocks (`--theme-block-1..4`).
4. Add unlock pricing in `themePrices` and (if needed) migration support for stored `selectedTheme`.
