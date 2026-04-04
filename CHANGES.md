# Gym Tracker — Improvement Log

---

## Session 1 (2026-04-03)

### New Features

#### Rest Timer (`src/components/RestTimer.tsx`) — NEW FILE
- Full-screen overlay that appears automatically after marking a set complete
- Animated circular ring countdown with color shift: green → amber → red as time runs out
- Beep sounds at 3 seconds remaining and a triple-beep on completion (WebAudio API)
- Parses rest strings like `"90 sec"`, `"2 min"`, `"60-90 sec"` — takes the higher of ranges
- "Skip Rest" button + tap-outside-to-skip
- Integrates with `GymTracker.tsx`: fires when any set is marked done

#### Elapsed Workout Clock (`GymTracker.tsx`)
- Live `M:SS` timer showing how long the current session has been running
- Displayed in the top persistent stats strip (Session card)
- Also shown inline in the active workout header alongside Week/Day info

#### Weight Pre-Fill from Last Performance (`GymTracker.tsx`)
- When starting a workout, each set's reps and weight inputs are now pre-filled with values from the previous time that exercise was performed
- Saves time — no need to manually recall last session's numbers
- Still fully editable; last-performance hint remains visible too

#### Streak Counter (`GymTracker.tsx`)
- Calculates consecutive-day workout streak from Supabase history
- Shown in the persistent top stats strip with 🔥 emoji when active
- Loads on app init alongside progression data

#### Next Workout Preview (dashboard tab — `GymTracker.tsx`)
- Card on the dashboard showing what the next scheduled workout is
- Displays workout name, week/day, and first 4 exercises with sets × reps
- Shows "+N more exercises" if there are more than 4

#### Estimated 1RM (`Progress.tsx`)
- Added 4th stat card in the Strength tab: **Est. 1RM**
- Calculated using the Epley formula: `1RM = weight × (1 + reps / 30)`
- Uses the heaviest logged set for the selected exercise
- Shows `0` when no data yet; updates as you log sessions

### Bug Fixes / UX Polish
- Top stats strip reorganized: Streak | Week N (days done) | Session (timer or idle)
- Removed redundant dashboard mini-strip (info now in top strip)
- Active workout header now shows `Week X · Day Y` plus the live elapsed timer inline

---

---

## Session 2 (2026-04-03)

### New Features

#### Personal Records Board — new "PRs" tab in Progress (`Progress.tsx`)
- Full ranked list of all-time best weights per exercise (🥇🥈🥉 + numeric rank)
- Each row shows: exercise name, PR weight, date, reps, sessions logged, est. 1RM
- "NEW PR" badge when the most recent session matches the all-time best
- Top Lifts summary grid (top 4 exercises in 2×2 cards)

#### Activity Heatmap + Weekly Volume — new "Volume" tab in Progress (`Progress.tsx`)
- GitHub-style 16-week activity grid (S M T W T F S columns, one square per day)
- Color intensity based on volume lifted that day (4 levels + today ring in amber)
- Legend at bottom
- Horizontal bar chart of weekly volume (k lbs) for the last 12 weeks
- Totals card: all-time volume, session count, avg volume per session

#### RPE Selector Buttons (`GymTracker.tsx`)
- Replaced static "RPE X" text with clickable 6 / 7 / 8 / 9 / 10 buttons per set
- Color-coded: green (6) → amber (7–8) → red (9–10)
- Toggle: tap again to deselect
- Logged RPE shown as `@N` badge when set is completed
- `rpe` field added to `ExerciseSet` interface and pre-initialized to 0

### Fixes / Polish
- `.claude/launch.json` created for Vite dev server (port 5173) and preview (port 4173)

---

---

## Session 3 (2026-04-03)

### New Features

#### Workout Completion Summary Modal (`GymTracker.tsx`)
- Full-screen summary card appears after every completed workout
- Shows: Duration, Total Volume (k lbs), Sets Done, XP Earned
- Highlights Personal Records set in that session (exercise name badges)
- "Keep Going 💪" CTA dismisses to level-up / achievement flow

#### Confetti Burst (`src/components/Confetti.tsx`) — NEW FILE
- Canvas-based particle animation — no external library
- 120 particles in random shapes (rects + circles), 8 colours, physics-based fall
- Double burst (t=0 and t=400ms), particles fade out by ~3.5s
- Fires automatically on workout completion alongside summary modal

#### Plate Calculator (`src/components/PlateCalculator.tsx`) — NEW FILE
- Barbell loading calculator — enter target weight, select bar (45/35/15 lbs)
- Shows exact plates per side with a colour-coded visual barbell diagram
- Breakdown list: plate size → count per side + total
- Closest-loadable warning when target can't be hit exactly with standard plates
- Access via 🏋️ button in the workout header (available during and outside sessions)

#### localStorage Workout History Fallback (`workoutService.ts`)
- Every completed session is now written to `workout_history_{userId}` in localStorage
- `getWorkoutHistory` falls back to localStorage when Supabase is null or errors
- `getLastExercisePerformance` also searches localStorage cache when offline
- Remote data from Supabase syncs back into localStorage on every successful fetch
- Fixes: streak counter, Progress charts, and weight pre-fill all work without Supabase

---

---

## Session 4 (2026-04-03)

### New Features

#### Weight Increment Buttons (`GymTracker.tsx`)
- Each set row now has a quick-tap button strip between the main row and the RPE row
- Reps column: `−1` / `+1` buttons to nudge rep count without touching the keyboard
- Weight column: `+2.5` / `+5` / `+10` buttons (lbs) or `+1.25` / `+2.5` / `+5` (kg) when unit toggle is active
- All buttons call `updateSet` directly — instant, no modal required

#### Skip Exercise (`GymTracker.tsx`)
- Every exercise card in an active workout now has a **Skip** button (top-right corner)
- Tapping Skip: marks the exercise as completed (counts toward "End Workout" unlock), dims the card to 60% opacity, hides the set rows, shows a "Skipped" label
- An **Undo** button replaces Skip when skipped, fully restoring the exercise
- Skipped exercises are excluded from PR detection and volume calculations naturally (no sets logged)

#### lbs / kg Unit Toggle (`src/contexts/UnitContext.tsx` — NEW FILE)
- Global `UnitContext` backed by `localStorage` — preference persists across sessions
- Toggle in **Settings → Profile tab** (previously wired to local state only, now persists)
- `display(lbs)` converts stored-lbs values for display; `toLbs(val)` converts user input back for storage
- kg display rounds to nearest 0.25 kg for cleaner numbers
- **GymTracker**: weight input placeholder, "Last performance" hint, increment button labels, and input parsing all respect the unit
- **Progress**: strength stat cards (Current / PR / Gain / Est. 1RM), recent sessions list, PR board weights, and Top Lifts grid all display in the selected unit

### Files Changed
- `src/pages/GymTracker.tsx` — increment buttons, skip exercise, unit context integration
- `src/pages/Progress.tsx` — unit context integration for all weight displays
- `src/pages/Settings.tsx` — wired local weightUnit state to global UnitContext
- `src/contexts/UnitContext.tsx` — new file, provides `useUnit()` hook
- `src/App.tsx` — wrapped app in `<UnitProvider>`

---

## Session 5 (2026-04-03)

### New Features

#### Muscle Group Recovery Tracker — new "Muscles" tab in Progress (`Progress.tsx`)
- Keyword-based classifier maps exercise names → 8 muscle groups (Chest, Back, Shoulders, Biceps, Triceps, Legs, Glutes, Core)
- Compound movements count toward multiple groups (e.g. rows → Back + Biceps)
- Per-group status based on days since last session:
  - **Trained today** (blue) → Rest
  - **Fresh 1–2d** (blue) → Still recovering
  - **Recovered 3–4d** (green) → Ready to train
  - **Due 5d+** (amber) → Prioritize this group
- Horizontal colored volume bar — width proportional to relative volume in last 14 days
- Recovery legend card explaining each status
- Empty state when no workout history yet

#### Technique Cues Expandable (`GymTracker.tsx`)
- Exercise notes (which were previously shown as tiny italic text) are now hidden behind a **▸ Technique cues** toggle button
- Tapping expands an amber-tinted card with the full notes text
- Tapping again collapses — state stored per exercise ID in a `Set`
- Reduces card clutter while keeping cues one tap away during the workout

### Files Changed
- `src/pages/Progress.tsx` — Muscles tab, `MUSCLE_KEYWORDS` lookup, `classifyExercise()`, `muscleData` useMemo
- `src/pages/GymTracker.tsx` — expandable technique cue panel, `expandedNotes` state

---

## Session 6 (2026-04-03)

### New Features

#### Workout Session Notes (`GymTracker.tsx`, `workoutService.ts`, `Progress.tsx`)
- Free-text textarea at the bottom of an active workout ("How's the session feeling? Any PRs, form notes, injuries...")
- Saved alongside the session in localStorage (and Supabase when connected)
- Displayed in the History tab under each session as an amber-tinted card
- `WorkoutHistory` interface now includes `notes?: string` and `dayName?: string`
- History tab also shows the workout day name (e.g. "Upper (Strength Focus)") above the exercise list

#### Rest Timer On/Off Toggle (`Settings.tsx`, `GymTracker.tsx`)
- Toggle switch in Settings → Account → Preferences (below Weight Unit)
- Persists to `localStorage` key `restTimerEnabled` (default: on)
- GymTracker checks this flag on every set completion — timer simply skips if disabled
- iOS-style pill toggle UI (amber when on, dim when off)

#### Plate Calculator kg Support (`PlateCalculator.tsx`)
- Full rewrite to respect the global unit from `UnitContext`
- kg mode: plate sizes `20 / 15 / 10 / 5 / 2.5 / 1.25 kg`, bar options `20 / 15 / 10 kg`
- lbs mode: unchanged (`45 / 35 / 25 / 10 / 5 / 2.5 lbs`, bars `45 / 35 / 15 lbs`)
- All labels (target input, plate list, exact/closest total) show the current unit
- Floating-point correction tightened to 2 decimal places (was 1)

### Files Changed
- `src/services/workoutService.ts` — `WorkoutHistory` extended with `notes`/`dayName`, `saveWorkoutSession` accepts optional `notes` param
- `src/pages/GymTracker.tsx` — `sessionNotes` state, textarea UI, passes notes to save, rest timer flag check
- `src/pages/Progress.tsx` — History tab shows `dayName` and `notes`
- `src/pages/Settings.tsx` — rest timer toggle in Preferences
- `src/components/PlateCalculator.tsx` — full kg/lbs dual-mode rewrite

---

#### Session Effort Rating (`GymTracker.tsx`, `workoutService.ts`, `Progress.tsx`)
- 5-button emoji picker at bottom of active workout: 😴 Easy / 🙂 Good / 💪 Solid / 🔥 Great / ⚡ PR Day
- Tap to select, tap again to deselect
- Saved as `rating: 1–5` in `WorkoutHistory` (localStorage + Supabase)
- Shown as emoji in History tab next to the volume number

#### Personal Exercise Cues (`GymTracker.tsx`)
- "+ Add your cue" link under each exercise (below technique cues toggle)
- Inline textarea edit mode — save/cancel buttons
- Persists per exercise name to `localStorage` key `personalExerciseNotes`
- Shows saved cue as a blue `📝 cue text` link that re-opens edit mode on tap
- Separate from program notes — user's own reminders that carry across all workouts

---

## Next Session — Ideas
- Better landing page (feature screenshots, testimonials)
- PWA install prompt
- Notification/reminder to work out if no session in 2 days
- Graph for muscle group training frequency over time
