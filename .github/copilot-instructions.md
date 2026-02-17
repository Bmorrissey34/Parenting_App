# Copilot Instructions for Parenting App

Purpose: Help AI coding agents work productively in this Next.js + Firebase project by capturing real patterns, workflows, and data flow conventions.

## Overview
- Stack: Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4, shadcn/radix UI, lucide-react, Recharts, Firebase (Auth + Firestore).
- Architecture: Single-page dashboard (`app/page.tsx`) with three interconnected React Context providers managing auth, children data (profiles), and activity logs.
- Entry: `app/layout.tsx` wraps providers (`AuthProvider` → `ChildrenProvider` → `LogsProvider`) and renders with dark theme forced via `<html class="dark">`.
- Data: Real-time Firestore collections (users auto-created by Firebase Auth, `children` collection, `logs` subcollections per child) synced via `onSnapshot` listeners.
- Aliases: Use `@/*` imports (see `tsconfig.json`); all paths relative to workspace root.

## Provider Architecture & Data Flow
1. **AuthProvider** (`lib/auth-context.tsx`): Firebase Auth state (login/signup/logout/Google OAuth). Wraps entire app; triggers auth listener on init.
2. **ChildrenProvider** (`lib/children-context.tsx`): Loads Firestore `children` collection (scoped by `userId == auth.user.uid`). Real-time `onSnapshot` listener. Exposes `children[]`, `activeChild`, `addChild()`, `deleteChild()`.
3. **LogsProvider** (`lib/logs-context.tsx`): Loads Firestore `logs` subcollection for active child (scoped by userId + childId). Derives `TimelineEntry[]`, `DiaryEntry[]`, `GrowthDataPoint[]`, and progress metrics (sleep/feeding/presence counts & goals). Exposes `addLog(type, data)`.

**Critical**: Providers must wrap in order (`AuthProvider` → `ChildrenProvider` → `LogsProvider` in `layout.tsx`). Auth initializes first; children queries depend on user; logs queries depend on activeChild.

**Data flow**: User logs in → Auth context updates → Children load → activeChild auto-set → Logs stream starts → Domain components re-render from context hooks.

## Firestore Data Model
- **Collections**: 
  - `users`: Implicit, created by Firebase Auth per login.
  - `children`: User-scoped documents with `{ userId, name, birthDate?, createdAt }`.
  - `logs`: Subcollection under each child with `{ userId, childId, type, createdAt, data }`.
- **Log types & shapes**: `type` is discriminated union (`"feeding" | "sleep" | "play" | "growth" | "diary"`). Each has type-specific fields in nested `data` object (e.g., sleep: `{ startTime, endTime }`).
- **Multi-child isolation**: ChildrenProvider sets `activeChild` on first load; LogsProvider filters by userId + childId, ensuring no cross-child data leakage.

## UI Architecture
- **Domain components** (`components/*.tsx`): ParentingRings, DailyTimeline, GrowthChart, DiaryJournal, AgesStages, PresenceMode. Consume context hooks, compose UI primitives, render business logic.
- **UI primitives** (`components/ui/*`): button, card, drawer, switch, etc. Follow shadcn/radix patterns. Use `cva` for variants, `cn()` (from `lib/utils.ts`) for class merging.
- **Page orchestration** (`app/page.tsx`): Conditional render—LoginForm (if no user) or main dashboard with bottom nav tabs + LogDrawer overlay. Manages `activeTab` state locally.
- **Styling**: Tailwind v4 CSS tokens in `app/globals.css` (OKLCH palette). Design tokens: `--ring-sleep`, `--ring-feeding`, `--ring-presence`, `--chart-*`. Always use semantic Tailwind classes (`text-foreground`, `bg-card`, `border-border`) for theme consistency.

## Log Drawer Pattern
- **Location**: `components/log-drawer.tsx`
- **Icon/color mapping**: Define in `logOptions[]` array; each entry has `type`, `label`, `icon`, `color` (text), `bgColor` (background).
- **Form state**: Separate local state per log type (e.g., `feedingAmount`, `sleepStart`/`sleepEnd`, `weight`/`height`).
- **Normalization**: `handleSave()` switch statement normalizes form state to flat `data: Record<string, unknown>` payload, calls `addLog(type, data)`.
- **Extension**: To add new log type, extend `LogType`, add to `logOptions[]`, add form UI section, add case in switch.

## Charts & Transforms
- **GrowthChart** (`components/growth-chart.tsx`): Uses Recharts `ComposedChart` inside `ResponsiveContainer`. Expects `GrowthDataPoint[]` (date, weight?, height?, percentile?). Preserve responsive wrapper and custom gradients.
- **DailyTimeline** (`components/daily-timeline.tsx`): Expects `TimelineEntry[]` (id, type, timestamp, label, icon, color, data). Sorted by timestamp descending. LogsProvider derives this from raw Firestore logs.
- **ParentingRings** (`components/parenting-rings.tsx`): Displays progress rings using `sleepProgress`, `feedingProgress`, `presenceProgress` (0–100) and goals from LogsProvider.

## Build & Dev Workflow
- **Package manager**: pnpm (lockfile: `pnpm-lock.yaml`).
- **Commands**:
  - `pnpm dev`: Start Next.js dev server (http://localhost:3000).
  - `pnpm build`: Compile (ignores TS errors, see config).
  - `pnpm lint`: Run ESLint.
  - `pnpm start`: Run production build.
- **Node version**: LTS 18+ recommended.
- **Environment**: Set `.env.local` with Firebase credentials (config object for `initializeApp`).

## Config & Notable Behaviors
- **TypeScript**: `tsconfig.json` has path alias `@/*` and `moduleResolution: bundler` (Next 13+ style).
- **Next.js**: `next.config.mjs` sets `typescript.ignoreBuildErrors = true` and `eslint.ignoreDuringBuilds = true` (fix locally, not in CI).
- **CSS**: Tailwind v4 via `postcss.config.mjs` (`@tailwindcss/postcss`). Theme tokens in `app/globals.css` (active). A second `styles/globals.css` exists but is not imported.
- **Metadata**: Set in `app/layout.tsx` (title: "Nurture - Parenting Tracker", icons, viewport settings).

## Common Patterns & Examples
- **Consuming context**:
  ```tsx
  const { user } = useAuth()
  const { children, activeChild, addChild } = useChildren()
  const { timelineEntries, growthData, addLog } = useLogs()
  ```
- **Adding a new log type**:
  1. Extend `LogType` in context.
  2. Add entry to `logOptions[]` in LogDrawer.
  3. Add form UI section (inputs, state) in LogDrawer.
  4. Add case in `handleSave()` switch to normalize data.
- **Creating a UI primitive**:
  1. Create file in `components/ui/*`.
  2. Use `cva` for variants; export interface for props.
  3. Use `cn()` to merge classes.
  4. Compose into domain component and pass props.
- **Styling with tokens**:
  ```tsx
  <div className="bg-card text-foreground border border-border">
    <Moon className="text-ring-sleep" />
  </div>
  ```

## Gotchas & Critical Assumptions
- **Context hooks require `"use client"`**: Any file using `useAuth()`, `useChildren()`, `useLogs()` must have `"use client"` at top.
- **Provider ordering matters**: Auth → Children → Logs. Children queries fail if auth not ready; Logs queries fail if activeChild not set.
- **Real-time listeners persist**: `onSnapshot` unsubscribes in useEffect cleanup. Don't manually refetch logs; rely on listener updates.
- **activeChild is central**: Always check `activeChild !== null` before rendering logs. Null means no child selected (e.g., first load, or all children deleted).
- **Semantic over raw classes**: Never hardcode colors like `#ff0000`; use `--ring-sleep` tokens or Tailwind semantic classes for light/dark compatibility.
- **Firebase auth state matters**: Some UI (LogDrawer, AddChildDialog) checks `user` and `user?.email`. Form actions require authenticated context.
