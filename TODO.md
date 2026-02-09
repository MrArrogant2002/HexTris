## 🎨 Theme Implementation Plan (Phase: Premium Themes)

**Goal:** Add premium themes (Spider/Barbie/Esports-style) with safe naming, consistent UI treatment, and persistent unlock/equip flows.

**Naming & IP safety (recommended):**
- Use non-IP names (e.g., `web-hero`, `fashion-pink`, `arena-neon`) while keeping the intended vibe
- Avoid brand logos, direct references, or copyrighted iconography

**Theme scope checklist:**
- [ ] Palette: 4 block colors, hex fill/stroke, UI text, background, accent
- [ ] UI surfaces: menus/modals/cards reflect the theme (optional toggle for "theme UI")
- [ ] HUD visibility: ensure timer, lives, score, and points remain readable
- [ ] Audio/particles (optional): map to theme config only if assets exist
- [ ] Shop cards: add preview swatches + price
- [ ] Settings grid: show lock state + equip state
- [ ] Persistence: unlock + select stored in Appwrite and restored on session load

**Theme packs (initial set):**
- [ ] Web Hero (Spider-inspired): red/blue/white with web-like accent
- [ ] Fashion Pink (Barbie-inspired): hot pink + blush + white + gold
- [ ] Esports Neon: dark slate + cyan + magenta + acid green
- [ ] Retro Arcade: deep navy + electric orange + mint + neon yellow

**Implementation order:**
1) Add theme entries to `themes.ts` + pricing
2) Wire lock/equip logic in Settings + Shop
3) Apply global theme tokens (background/text) to core pages
4) Add optional VFX (particles/sfx) per theme
5) QA: readability + contrast on mobile/desktop

---

## 🧭 UI/UX Layout Structure (Responsive, Clean)

**App shell:**
- [ ] Single-column layout with max width (menu/settings/modals)
- [ ] Sticky top system for HUD overlays inside game screen
- [ ] Consistent padding scale: 12/16/24/32 for mobile/desktop

**Page layout patterns:**
- [ ] Menu: hero title + stats row + mode grid + utility actions row
- [ ] Difficulty: back button + header + 3-card grid + primary CTA
- [ ] Multiplayer: header + tabs + card list + consistent action rows
- [ ] Settings: section cards with 2/3/4 column responsive grids
- [ ] Shop modal: two-column cards, collapses to single column on mobile

**Component behavior:**
- [ ] Buttons: primary/secondary/outline/ghost; size ladder (small/medium/large)
- [ ] Cards: consistent border radius + shadow; hover scale only on desktop
- [ ] Modals: max width per content size; scrollable body; safe-top/bottom
- [ ] HUD: pointer-events rules; z-index layering: HUD > modals > canvas

**Responsive rules:**
- [ ] Mobile-first: single column, 48px touch targets, safe-area padding
- [ ] Tablet: 2-column grids where possible; reduced motion on low-end devices
- [ ] Desktop: 2-3 column grids, larger typography, controlled max width

**Accessibility polish:**
- [ ] Color contrast check for all themes (minimum 4.5:1 for text)
- [ ] Focus states for interactive elements
- [ ] Reduced motion option respects animations

---

## 🧪 COMPREHENSIVE TESTING CHECKLIST

### Authentication Flow Tests

- [ ] **Sign Up Flow:**
  - [ ] Open app -> see LoginPage
  - [ ] Click "Sign Up" tab
  - [ ] Enter name, email, password
  - [ ] Click "Sign Up" button
  - [ ] Verify account created in Appwrite
  - [ ] Verify user document created in database
  - [ ] Verify navigation to MenuPage
  - [ ] Verify user state loaded

- [ ] **Login Flow:**
  - [ ] Open app -> see LoginPage
  - [ ] Enter existing email/password
  - [ ] Click "Login" button
  - [ ] Verify session created
  - [ ] Verify user data loaded
  - [ ] Verify navigation to MenuPage
  - [ ] Verify stats displayed correctly

- [ ] **Password Recovery Flow:**
  - [ ] Click "Forgot password?" link
  - [ ] Enter email -> submit
  - [ ] Check email inbox
  - [ ] Click recovery link
  - [ ] Open ResetPasswordPage
  - [ ] Enter new password
  - [ ] Submit -> verify success
  - [ ] Redirect to LoginPage
  - [ ] Login with new password

- [ ] **Session Restoration:**
  - [ ] Login to app
  - [ ] Close browser tab
  - [ ] Reopen app
  - [ ] Verify auto-login to MenuPage
  - [ ] Verify user data restored

- [ ] **Logout:**
  - [ ] From MenuPage, click "Logout"
  - [ ] Verify confirmation modal
  - [ ] Confirm logout
  - [ ] Verify redirect to LoginPage
  - [ ] Verify session cleared
  - [ ] Try accessing /menu directly
  - [ ] Verify redirect to login

---

### Game Mechanics Tests

- [ ] **Single Player Game:**
  - [ ] From MenuPage, click "SINGLE PLAYER"
  - [ ] Select difficulty
  - [ ] Game starts with 3 lives
  - [ ] HUD displays: score, lives, diamonds
  - [ ] Blocks fall and rotate
  - [ ] Matching system works
  - [ ] Score increases on matches
  - [ ] Combo system works
  - [ ] Life lost when blocks reach top
  - [ ] Game over when lives = 0
  - [ ] Score saved to Appwrite
  - [ ] High score updated if beaten

- [ ] **Life System:**
  - [ ] Start game with 3 lives
  - [ ] Let blocks reach top -> lose 1 life
  - [ ] Verify blocks clear (not full restart)
  - [ ] Verify score retained
  - [ ] Earn 5000 points -> gain 1 life
  - [ ] Verify max 5 lives cap
  - [ ] Lose all lives -> game over

- [ ] **Daily Challenge:**
  - [ ] Click "DAILY CHALLENGE"
  - [ ] See modal with attempts (3/3)
  - [ ] Play challenge
  - [ ] Verify difficulty preset
  - [ ] Complete -> submit score
  - [ ] Verify attempts decrease (2/3)
  - [ ] Play 2 more times
  - [ ] Verify no attempts left
  - [ ] Next day -> verify reset to 3/3

- [ ] **Timer Attack:**
  - [ ] Click "TIMER ATTACK"
  - [ ] Select duration (60s/120s/180s)
  - [ ] Game starts with timer
  - [ ] Timer counts down in HUD
  - [ ] Timer reaches 0 -> game over
  - [ ] Score submitted
  - [ ] Best time saved

---

### Multiplayer/Group Tests

- [ ] **Create Group:**
  - [ ] Navigate to "MULTIPLAYER"
  - [ ] Click "Create" tab
  - [ ] Enter group name
  - [ ] Click "Create"
  - [ ] Verify room code generated (6 chars)
  - [ ] Verify group appears in "My Groups"
  - [ ] Copy room code

- [ ] **Join Group:**
  - [ ] Open app in second browser/incognito
  - [ ] Login with different account
  - [ ] Navigate to "MULTIPLAYER"
  - [ ] Click "Join" tab
  - [ ] Enter room code
  - [ ] Click "Join"
  - [ ] Verify success message
  - [ ] Verify group appears in "My Groups"

- [ ] **Play in Group:**
  - [ ] From "My Groups", click "Play"
  - [ ] Select difficulty
  - [ ] Play game
  - [ ] Complete game
  - [ ] Verify score saved to both:
    - Single player leaderboard
    - Group leaderboard

- [ ] **Group Leaderboard:**
  - [ ] View group leaderboard
  - [ ] Verify all members shown
  - [ ] Verify sorted by score
  - [ ] Verify current user highlighted
  - [ ] Verify top 3 have special styling

- [ ] **Multiple Groups:**
  - [ ] Join 3 different groups
  - [ ] Verify all shown in "My Groups"
  - [ ] Play in Group 1 -> score saved to Group 1 only
  - [ ] Play in Group 2 -> score saved to Group 2 only
  - [ ] Verify independent leaderboards

- [ ] **Leave Group:**
  - [ ] Open group leaderboard
  - [ ] Click "Leave Group"
  - [ ] Confirm
  - [ ] Verify removed from group members
  - [ ] Verify group removed from "My Groups"

---

### Settings & Data Tests

- [ ] **Theme Selection:**
  - [ ] Open Settings
  - [ ] Click theme selector
  - [ ] Select different theme
  - [ ] Verify game colors change
  - [ ] Close and reopen app
  - [ ] Verify theme persisted

- [ ] **Audio Settings:**
  - [ ] Toggle music on/off
  - [ ] Toggle SFX on/off
  - [ ] Adjust volume sliders
  - [ ] Play game -> verify settings applied

- [ ] **Clear Data:**
  - [ ] Click "Clear Local Data"
  - [ ] Verify scary confirmation modal
  - [ ] Cancel -> nothing happens
  - [ ] Click again, confirm
  - [ ] Verify user deleted from Appwrite
  - [ ] Verify state cleared
  - [ ] Verify redirect to LoginPage
  - [ ] Try to login with old credentials -> fail

---

### Shop Tests (After Implementation)

- [ ] **Browse Shop:**
  - [ ] Open shop
  - [ ] See all available themes
  - [ ] See preview of each theme
  - [ ] See price in diamonds
  - [ ] See "Locked" or "Unlocked" status

- [ ] **Purchase Theme:**
  - [ ] Select locked theme
  - [ ] Verify price shown
  - [ ] Click "Unlock"
  - [ ] Verify diamonds deducted
  - [ ] Verify theme unlocked
  - [ ] Verify theme available in settings
  - [ ] Close and reopen app
  - [ ] Verify purchase persisted

- [ ] **Insufficient Funds:**
  - [ ] Have less diamonds than theme costs
  - [ ] Try to unlock theme
  - [ ] Verify "Unlock" button disabled
  - [ ] Verify error message

---

### Power-Up Tests (After Implementation)

- [x] **Power-Up Spawning:**
  - [x] Play game
  - [x] Reach score milestones (+100)
  - [x] Verify power-up spawns
  - [x] Verify power-up falls like block

- [x] **Power-Up Collection:**
  - [x] Move to collect power-up
  - [x] Verify added to inventory (HUD)
  - [x] Verify max 3 power-ups

- [x] **Power-Up Usage:**
  - [x] Click power-up in inventory
  - [x] Verify effect applied
  - [x] Verify power-up removed from inventory

- [x] **Power-Up Types:**
  - [x] Test each power-up type
  - [x] Verify effects work as expected

---

### Mobile/Responsive Tests

- [ ] **Mobile Layout:**
  - [ ] Test on phone screen size
  - [ ] Verify all pages responsive
  - [ ] Verify HUD readable
  - [ ] Verify buttons clickable

- [ ] **Touch Controls:**
  - [ ] Swipe to rotate hexagon
  - [ ] Tap to speed up
  - [ ] Verify touch events work

- [ ] **Mobile Performance:**
  - [ ] Game runs smoothly (30+ fps)
  - [ ] No lag during gameplay
  - [ ] Canvas renders correctly

---

### Edge Cases & Error Handling

- [ ] **Network Errors:**
  - [ ] Disconnect internet
  - [ ] Try to login -> show error
  - [ ] Try to save score -> show error
  - [ ] Reconnect -> retry works

- [ ] **Invalid Input:**
  - [ ] Sign up with invalid email
  - [ ] Sign up with short password
  - [ ] Join group with invalid code
  - [ ] Verify proper error messages

- [ ] **Session Expiry:**
  - [ ] Wait for session to expire (or simulate)
  - [ ] Try to access protected page
  - [ ] Verify redirect to login

- [ ] **Browser Compatibility:**
  - [ ] Test on Chrome
  - [ ] Test on Firefox
  - [ ] Test on Safari
  - [ ] Test on Edge

---

## 📝 APPWRITE SETUP CHECKLIST

### Project Setup

- [ ] Create Appwrite project
  - [ ] Project ID: _______________
  - [ ] Project name: "Hextris"

### Authentication Setup

- [ ] Enable Email/Password authentication
- [ ] Configure session duration (default: 365 days recommended)
- [ ] Set password requirements:
  - [ ] Minimum 8 characters
  - [ ] (Optional) Require uppercase
  - [ ] (Optional) Require numbers
- [ ] Configure email service:
  - [ ] Option 1: Use Appwrite Cloud email
  - [ ] Option 2: SMTP setup (host, port, username, password)
- [ ] Customize email templates:
  - [ ] Welcome email (optional)
  - [ ] Password recovery email
  - [ ] Verification email (if enabled)

### Database Setup

- [ ] Create database
  - [ ] Database ID: _______________
  - [ ] Database name: "HextrisGame"

### Collection: `users`

- [ ] Create collection
  - [ ] Collection ID: _______________
  - [ ] Collection name: "users"

- [ ] Add attributes:
  - [ ] `userId` - String, required (links to Auth user ID)
  - [ ] `name` - String, required, min:2, max:50
  - [ ] `email` - String, required
  - [ ] `singlePlayerHighScore` - Integer, default: 0
  - [ ] `totalDiamonds` - Integer, default: 0
  - [ ] `gamesPlayed` - Integer, default: 0
  - [ ] `totalPlayTime` - Integer, default: 0
  - [ ] `themesUnlocked` - Array, default: ['classic']
  - [ ] `selectedTheme` - String, default: 'classic'
  - [ ] `timerAttackBest` - Integer, default: 0

- [ ] Create indexes:
  - [ ] `userId` - unique, ascending
  - [ ] `email` - unique, ascending
  - [ ] `singlePlayerHighScore` - descending (for leaderboard)

- [ ] Set permissions:
  - [ ] Any authenticated user can CREATE
  - [ ] Users can READ their own document
  - [ ] Users can UPDATE their own document
  - [ ] Users can DELETE their own document

### Collection: `groups`

- [ ] Create collection
  - [ ] Collection ID: _______________
  - [ ] Collection name: "groups"

- [ ] Add attributes:
  - [ ] `roomCode` - String, required, unique, 6 chars
  - [ ] `groupName` - String, required
  - [ ] `createdBy` - String, required (userId)
  - [ ] `memberIds` - Array, required
  - [ ] `memberCount` - Integer, required
  - [ ] `isActive` - Boolean, default: true

- [ ] Create indexes:
  - [ ] `roomCode` - unique, ascending
  - [ ] `createdBy` - ascending

- [ ] Set permissions:
  - [ ] Any authenticated user can CREATE
  - [ ] Any authenticated user can READ
  - [ ] Creator can UPDATE
  - [ ] Creator can DELETE

### Collection: `groupScores`

- [ ] Create collection
  - [ ] Collection ID: _______________
  - [ ] Collection name: "groupScores"

- [ ] Add attributes:
  - [ ] `userId` - String, required
  - [ ] `groupId` - String, required
  - [ ] `userName` - String, required
  - [ ] `bestScore` - Integer, default: 0
  - [ ] `gamesPlayed` - Integer, default: 0
  - [ ] `lastPlayedAt` - DateTime
  - [ ] `difficulty` - String

- [ ] Create indexes:
  - [ ] `groupId` + `bestScore` - compound, descending (for leaderboard)
  - [ ] `userId` - ascending
  - [ ] Unique constraint: `userId` + `groupId`

- [ ] Set permissions:
  - [ ] Any authenticated user can CREATE
  - [ ] Any authenticated user can READ
  - [ ] User can UPDATE their own scores
  - [ ] User can DELETE their own scores

### CORS Settings

- [ ] Add allowed origins:
  - [ ] `http://localhost:5173` (development)
  - [ ] `http://localhost:4173` (preview)
  - [ ] Your production URL (when deployed)

---

## 🚀 DEPLOYMENT CHECKLIST

### Pre-Deployment

- [ ] All critical blockers resolved
- [ ] All tests passing
- [ ] No console errors
- [ ] Build succeeds: `pnpm build`
- [ ] Preview works: `pnpm preview`

### Environment Setup

- [ ] Update `.env` with production Appwrite endpoint
- [ ] Verify all environment variables set
- [ ] Do NOT commit `.env` file

### Build & Deploy

- [ ] Run production build: `pnpm build`
- [ ] Deploy to hosting (choose one):
  - [ ] Option 1: Vercel
  - [ ] Option 2: Netlify
  - [ ] Option 3: Render
  - [ ] Option 4: GitHub Pages

### Post-Deployment

- [ ] Update Appwrite CORS with production URL
- [ ] Test authentication on production
- [ ] Test game functionality on production
- [ ] Test on mobile devices
- [ ] Monitor for errors (Sentry, LogRocket, etc.)

---

## 📊 PROGRESS TRACKING

### Sprint 1: Critical Blockers (Est. 2-3 days)
- [ ] Fix Power-Up & Special Points TypeScript conversion
- [ ] Create .env file and configure Appwrite
- [x] Remove Socket.io infrastructure
- [ ] Test authentication flow end-to-end

### Sprint 2: Missing Features (Est. 2-3 days)
- [ ] Implement Shop System
- [ ] Implement Audio System
- [x] Create GroupLeaderboardModal
- [x] Verify and fix life system bonuses
- [ ] Test all game modes

### Sprint 3: Polish & Testing (Est. 2-3 days)
- [ ] Run comprehensive test checklist
- [ ] Fix bugs found during testing
- [ ] Performance optimization
- [ ] Mobile responsive fixes
- [ ] Cross-browser testing

### Sprint 4: Deployment (Est. 1 day)
- [ ] Final build and testing
- [ ] Deploy to production
- [ ] Monitor and fix production issues

---

## 🎯 SUCCESS CRITERIA

**MVP Complete When:**
- ✅ All authentication flows work
- ✅ Single player game fully functional
- ✅ Multiplayer groups working
- ✅ Power-ups working
- ✅ Shop system working
- ✅ Audio/sound effects working
- ✅ All game modes working
- ✅ Mobile responsive
- ✅ No critical bugs
- ✅ Deployed to production

---

## 📞 NOTES & QUESTIONS

### Known Issues
- Power-Up systems excluded from TypeScript build (critical)
- No .env file (blocks authentication)
- EntryPage.ts redundant with LoginPage.ts

### Open Questions
- [ ] Which hosting platform to use for deployment?
- [ ] Should shop be a full page or a modal?
- [ ] Audio files: where to source/create them?
- [ ] Privacy policy & terms of service needed?

### Future Enhancements (Post-MVP)
- Tournament system
- Season rewards
- Social features (friend system)
- Achievements system
- Player profiles
- Custom skins/effects
- Twitch integration
- Discord bot

---

**Last Updated:** February 8, 2026  
**Next Review:** After completing Sprint 1 (Critical Blockers)
