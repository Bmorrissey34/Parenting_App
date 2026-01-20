# Copilot Instructions for Parenting App

Purpose: Help AI coding agents work productively in this Next.js + Tailwind project by capturing real project patterns, workflows, and conventions.

## Overview
- Stack: Next.js App Router, React 19, TypeScript, Tailwind CSS v4, shadcn-style UI (Radix under the hood), lucide-react icons, Recharts, next-themes (available), @vercel/analytics.
- Entry points: `app/layout.tsx` (global HTML, dark theme default, analytics) and `app/page.tsx` (single interactive page built from domain components). No API routes or server actions yet.
- Aliases: Use `@/*` for imports (see `tsconfig.json`).

## Architecture & Patterns
- App shell: [app/layout.tsx](app/layout.tsx) wraps with `AuthProvider` → `LogsProvider` + includes `./globals.css` and `@vercel/analytics`.
- Page composition: [app/page.tsx](app/page.tsx) renders `LoginForm` if unauthenticated, else manages `activeTab` and conditionally renders domain components (e.g., `ParentingRings`, `DailyTimeline`, `GrowthChart`, `DiaryJournal`, `AgesStages`, `PresenceMode`). Most are client components (`"use client"`).
- Domain vs UI:
  - Domain components live in `components/*.tsx` and compose UI primitives.
  - UI primitives in `components/ui/*` mirror shadcn patterns (e.g., `button`, `card`, `drawer`, `switch`), built on Radix and Tailwind tokens.
- Styling tokens: Tailwind v4 with CSS variables in `app/globals.css` (OKLCH palette, design tokens like `--ring-sleep`, `--chart-*`). Use semantic classes (`bg-card`, `border-border`, `text-muted-foreground`).
- Utilities: `lib/utils.ts` exposes `cn()` (clsx + tailwind-merge). Use it for variant/style merging.

## Theming
- Current mode is forced dark via `<html class="dark">`. `components/theme-provider.tsx` exposes a `ThemeProvider` (next-themes) but is not wired in.
- If you add theme switching, wrap the body with `ThemeProvider` and use `attribute="class"` + `defaultTheme="dark"`. Keep Tailwind `@custom-variant dark` and CSS tokens intact.

## Data & State
- **Firebase Auth + Firestore**: User authentication via `lib/auth-context.tsx` (email/password). Logs stored in Firestore collection `logs` with document structure: `{ userId, type, data, timestamp }`.
- **LogsContext** (`lib/logs-context.tsx`): Real-time listener on Firestore logs; exposes hooks `useAuth()` and `useLogs()` for managing user state and log entries.
- **Client-side writes**: LogDrawer writes directly to Firestore via `addLog(type, data)` → context updates → components re-render with new data.
- Logs are transformed into typed props for components (TimelineEntry, DiaryEntry, GrowthDataPoint).
- Schema: Each log type (feeding, sleep, play, growth, diary) maps to data shape; discriminated union via `LogType`.

## Authentication & Providers
- **AuthProvider** wraps the app in [app/layout.tsx](app/layout.tsx). Tracks `user`, `loading`, and auth methods (`signup`, `login`, `logout`).
- **LogsProvider** wraps children to provide context. Real-time Firestore listener auto-syncs logs when user changes.
- Unauthenticated users see LoginForm component; authenticated users see main app.

## Firebase Setup
- Config keys stored in `.env.local` (template in repo). Reads `NEXT_PUBLIC_FIREBASE_*` for client initialization in [lib/firebase.ts](lib/firebase.ts).
- Admin SDK available for future server-side operations (see [app/api/logs/route.ts](app/api/logs/route.ts) for placeholder).
- Firestore Rules: Set read/write access to `request.auth.uid == resource.data.userId` to limit users to their own logs.

## Charts
- `components/growth-chart.tsx` uses Recharts `ComposedChart` inside `ResponsiveContainer` with OKLCH stroke/fill for theme consistency. Preserve the responsive wrapper and custom gradient when extending.

## UI Conventions
- Buttons: `components/ui/button.tsx` uses `cva` variants (`variant`, `size`). Reuse `buttonVariants` when rendering as links or custom elements.
- Cards: `components/ui/card.tsx` provide `Card`, `CardHeader`, `CardContent`, etc., with `data-slot` markers. Compose these rather than re-styling from scratch.
- Drawers/Switches: Use `components/ui/drawer` and `components/ui/switch` (Radix-based) for overlays and toggles. Keep focus-visible styles and a11y attributes.

## Build & Dev Workflow
- Package manager: pnpm (lockfile present).
- Commands:
  - Install: `pnpm install`
  - Dev: `pnpm dev`
  - Build: `pnpm build` (note: `next.config.mjs` has `typescript.ignoreBuildErrors = true`)
  - Start: `pnpm start`
  - Lint: `pnpm lint`
- Node: Use a modern LTS (18+ recommended for Next/React).

## Notable Config
- `next.config.mjs`: `images.unoptimized = true`; `typescript.ignoreBuildErrors = true` (CI won’t fail on TS errors—fix locally where possible).
- `tsconfig.json`: path alias `@/*` and `moduleResolution: bundler` for Next 13+ conventions.
- `postcss.config.mjs`: Tailwind v4 via `@tailwindcss/postcss`.
- CSS: Active theme tokens live in `app/globals.css`. A second file `styles/globals.css` exists but isn’t imported.

## Integration Points
- Analytics: `@vercel/analytics/next` included in layout. Avoid rendering it multiple times.
- Icons: `lucide-react` throughout. Import only used icons to keep bundle lean.
- Forms: Project includes `react-hook-form`, `zod`, and `@hookform/resolvers`; prefer that stack for new forms, aligning with shadcn patterns (`components/ui/form.tsx` is available).

## Examples
- Importing a UI primitive:
  - `import { Button } from "@/components/ui/button"`
  - `<Button variant="secondary" size="sm">Save</Button>`
- Adding a new tab to bottom nav: extend `tabs` in `components/bottom-nav.tsx` with `{ id, label, icon }` and handle it in `renderContent()` switch in `app/page.tsx`.
- Adding a new log type: extend `LogType`, `logOptions`, and add a case in `renderLogForm()` + `handleSave()` in `components/log-drawer.tsx`.

## Gotchas & Tips
- Keep imports using the `@/*` alias; don’t use deep relative paths.
- Maintain semantic Tailwind tokens (`bg-card`, `text-foreground`) to stay on-brand with the design system.
- When creating new primitives, colocate under `components/ui/*` and follow existing variant patterns (cva + `cn`).
- If you introduce server features, prefer App Router conventions (e.g., `app/api/*/route.ts`) and keep client components with `"use client"` minimal.
