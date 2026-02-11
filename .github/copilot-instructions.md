# Copilot Instructions for Parenting App

Purpose: Help AI coding agents work productively in this Next.js + Tailwind project by capturing real project patterns, workflows, and conventions.

## Overview
- Stack: Next.js App Router, React 19, TypeScript, Tailwind CSS v4, shadcn-style UI (Radix under the hood), lucide-react icons, Recharts, next-themes (available), @vercel/analytics.
- Entry points: `app/layout.tsx` (global HTML, dark theme default, analytics) and `app/page.tsx` (single interactive page built from domain components). No API routes or server actions yet.
- Aliases: Use `@/*` for imports (see `tsconfig.json`).

## Architecture & Patterns
- App shell: `app/layout.tsx` sets `<html class="dark">` and includes `./globals.css` plus `@vercel/analytics`.
- Page composition: `app/page.tsx` manages a local `activeTab` and conditionally renders domain components (e.g., `ParentingRings`, `DailyTimeline`, `GrowthChart`, `DiaryJournal`, `AgesStages`, `PresenceMode`). Most are client components (`"use client"`).
- Domain vs UI:
  - Domain components live in `components/*.tsx` and compose UI primitives.
  - UI primitives in `components/ui/*` mirror shadcn patterns (e.g., `button`, `card`, `drawer`, `switch`), built on Radix and Tailwind tokens.
- Styling tokens: Tailwind v4 with CSS variables in `app/globals.css` (OKLCH palette, design tokens like `--ring-sleep`, `--chart-*`). Use semantic classes (`bg-card`, `border-border`, `text-muted-foreground`).
- Utilities: `lib/utils.ts` exposes `cn()` (clsx + tailwind-merge). Use it for variant/style merging.

## Theming
- Current mode is forced dark via `<html class="dark">`. `components/theme-provider.tsx` exposes a `ThemeProvider` (next-themes) but is not wired in.
- If you add theme switching, wrap the body with `ThemeProvider` and use `attribute="class"` + `defaultTheme="dark"`. Keep Tailwind `@custom-variant dark` and CSS tokens intact.

## Data & State
- Sample data is inline in `app/page.tsx`. There’s no global store or backend.
- Favor local state + typed props (`DailyTimeline` and `GrowthChart` export prop types). When adding persistence, prefer server routes under `app/api/*` and pass data through props.
- Pattern reference: `components/log-drawer.tsx` uses a discriminated `LogType` and a `logOptions` map for icon/colors and a single `handleSave()` to normalize payloads.

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
