# Kimi Code Instructions

## Project: TWENDE

This is a React 18 + TypeScript + Vite frontend for a 5-pillar fintech platform.

## Quick Commands

- `npm run dev` — Start dev server
- `npm run build` — Production build (must pass with zero errors)
- `npm run preview` — Preview production build

## Rules

1. **Always read `docs/PROJECT_CONTEXT.md` before writing code.**
2. **Follow the design system** in `src/index.css` — do not introduce new colors.
3. **Use existing component patterns** — follow `Layout.tsx`, `mockData.ts` conventions.
4. **Maintain cross-product awareness** — a change in one product affects the Trust Engine.
5. **Phone number = primary key everywhere.**
6. **M-Pesa is the only payment rail.**
7. **All routes** (`/`, `/chama`, `/biashara`, `/kazi`, `/linda`, `/soko`) must remain functional.
8. **Build must pass** before considering any task complete.

## Tech Stack

- React 18 + TypeScript + Tailwind CSS v4 + Vite
- React Router v6 (HashRouter)
- Lucide React icons
- All data currently mocked in `src/data/mockData.ts`
