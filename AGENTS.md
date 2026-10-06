# Horizon — Scolarité Contribution Tracker

This project uses Next.js App Router, React, TypeScript, Tailwind CSS v4, shadcn/ui, and Lucide React.

## Structure

- `app/` contains the App Router pages and layouts.
- `app/(portal)/parent/` and `app/(portal)/admin/` contain one route per portal screen.
- `components/marketing/` and `components/auth/` contain the public landing and login screens.
- `components/parent/` and `components/admin/` contain role-specific screen components.
- `components/portal/` contains the shared authenticated shell, navigation context, and modal.
- `components/shared/` contains application-level shared UI; `components/ui/` contains shadcn/ui primitives.
- `lib/` contains shared utilities.

Keep route-level composition in `app/` and reusable presentation in `components/`. Use the portal context for navigation and modal actions inside portal screens. Keep the parent and administration areas under `/parent` and `/admin`.

## Commands

- `pnpm dev` — start the Next.js development server.
- `pnpm build` — create a production build.
- `pnpm start` — serve the production build.
- `pnpm format` — format files with oxfmt.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
