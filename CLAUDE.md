# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

When reading large files, run wc -l first to check the line count. If the file is over 2,000 lines, use the offset and limit parameters on the Read tool to read in chunks rather than attempting to read the entire file at once.

## Project Overview

Ganka Flow is a clinic management system (HIS) for Ganka28, a Vietnamese ophthalmology clinic. The project is in early stages — currently a frontend shell with sidebar navigation.

**Read `PROJECT.md` at the start of every session** for full project context: modules, business rules, phase roadmap, decisions log, and current status. Raw requirements are in `docs/requirements/` (Vietnamese) and team discussions in `docs/chats/`.

## Commands

- `npm run dev` — Start dev server on port 3000
- `npm run build` — Type-check then build (`tsc -b && vite build`)
- `npm run typecheck` — Type-check only (`tsc --noEmit`)
- `npm run lint` — ESLint
- `npm run format` — Prettier (ts/tsx files)

## Tech Stack

- **React 19** + **TypeScript 5.9** + **Vite 7**
- **Tailwind CSS v4** (via `@tailwindcss/vite` plugin, configured in `src/index.css` not `tailwind.config`)
- **shadcn/ui** (radix-vega style, hugeicons icon library) — add components with `npx shadcn@latest add <name>`
- **Radix UI** primitives via the `radix-ui` package
- **Inter Variable** font

## UI Rules

- All user-facing labels, text, and messages must be in Vietnamese with proper diacritics (e.g. "Tiếp nhận", "Lịch hẹn", not "Tiep nhan", "Lich hen")
- Never use emoji in the UI. Use monochrome icons (Hugeicons) or simple shapes (dots, lines) for status indicators and visual cues

## Code Conventions

- Path alias: `@/` maps to `src/` (configured in vite.config.ts and tsconfig.json)
- shadcn components go in `src/components/ui/`, app components in `src/components/`
- Hooks in `src/hooks/`, utilities in `src/lib/`
- `cn()` helper from `@/lib/utils` for merging Tailwind classes
- Prettier: no semicolons, double quotes, 2-space indent, trailing commas (es5), Tailwind class sorting enabled
- Dark mode via class strategy (ThemeProvider wraps the app)

## Architecture

- Entry: `src/main.tsx` → `ThemeProvider` → `App`
- App shell: `SidebarProvider` + `AppSidebar` + `SiteHeader` + content area
- shadcn config in `components.json` (radix-vega style, CSS variables for theming, neutral base color)

## Design Context

Full design context is in `.impeccable.md` at the project root. Key points:

- **Users**: Clinic staff (doctors, technicians, nurses, cashier, optical, manager) on desktops, laptops, and tablets
- **Brand**: Professional, efficient, precise. Clinical and calm — not cold or institutional
- **Aesthetic**: Minimal, spacious, clean. Teal/blue-green primary for medical trust. Semantic colors only for status (amber=waiting, emerald=success, red=urgent, sky=in-progress)
- **References**: Untitled UI (whitespace, clean sidebar). Anti-reference: government health systems, dense EHR like Epic
- **Principles**:
  1. Clarity over cleverness — explicit labels, clear hierarchy
  2. Calm density — data-rich without overwhelming, strategic whitespace
  3. Status at a glance — color-coded workflow states, KPI cards
  4. Speed of interaction — minimal clicks, keyboard nav, smart defaults
  5. Medical-grade trust — precise alignment, consistent spacing, no visual bugs
