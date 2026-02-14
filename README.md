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

### Sync Link (Multiplayer)
- **Rule**: Every clear charges Sync Link; 100% triggers a Sync Burst that calms waves.
- **Rule**: Sync slowly drains between clears.
- **Strategy**: Coordinate clears to maintain Harmonic tiers and time burst windows.

### Pulse Relay (Timer)
- **Rule**: Relay nodes spawn after strong clears; collect four to extend time.
- **Rule**: Each Relay stage increases overall speed and scoring bonuses.
- **Strategy**: Use Tempo Break before Relay completions to stay safe.

### Hexforge Trials (Challenge)
- **Rule**: Daily objectives track rotations, clears, and power usage.
- **Rule**: Complete the objective to earn bonus diamonds and streak perks.
- **Strategy**: Read objectives first; tailor power usage to the requirement.

## ⚡ Powers System

| Power | Effect | Cooldown |
| --- | --- | --- |
| **Pulse Wave** | Clears the outermost ring of blocks across every lane. | 8s |
| **Tempo Break** | Slows block fall and spawn rhythm briefly. | 10s |
| **Aegis Field** | Grants invulnerability while the field is active. | 12s |
| **Orbit Shift** | Rotates all settled stacks one lane clockwise. | 11s |
| **Nova Spark** | Boosts scoring output for the next clears. | 14s |

## ⌨️ Keyboard Shortcuts

Arrow keys always rotate the hexagon. Secondary keys can be remapped in **Settings → Controls**.

| Action | Default |
| --- | --- |
| Rotate Left | Arrow Left / Arrow Up / Q |
| Rotate Right | Arrow Right / Arrow Down / E |
| Glide Boost | Shift / S |
| Pause | P / Space / Esc |
| Use Power Slot 1-3 | 1 / 2 / 3 |

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
