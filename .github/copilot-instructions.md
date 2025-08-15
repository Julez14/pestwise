## PestWise – AI Coding Agent Guide

Focused, project-specific facts to make you productive fast. Keep responses concise and align with existing patterns. Don’t introduce heavy abstractions, auth systems, or server code unless explicitly requested.

### 1. Project Shape & Intent

- Tech stack: Next.js 15 (App Router), React 19, TypeScript, TailwindCSS v4, Radix UI, shadcn-style UI primitives (in `components/ui`).
- Purpose: Front‑end prototype for a pest control ops dashboard (reports, locations, materials, comments). Real persistence is NOT implemented; UI uses in‑memory mock arrays & `localStorage` for a demo auth flag.
- Directory highlights:
  - `app/` – route segments (`/`, `/dashboard`, `/reports`, `/reports/add`, `/locations`, `/materials`, `/comments`). Each protected page repeats the same client auth gate logic.
  - `components/` – Feature folders (auth, dashboard, reports, locations, materials, comments, layout) + atomic UI primitives in `ui/`.
  - `lib/` – Type definitions (`database.ts`), `mock-data.ts` with typed mock entities, small `utils.ts` for `cn()`.
  - `scripts/` – SQL schema + seeds + views; defines the future backend data model (keep TS interfaces aligned if changed).
  - `styles/` & root `globals.css` – Tailwind utilities (Tailwind 4 config implied via `postcss.config.mjs` + deps).

### 2. Architectural Conventions

- Pure front-end demo: All “fetching” is local state. Do NOT add server actions or DB calls unless user explicitly asks to wire backend.
- Data model source of truth: Interfaces in `lib/database.ts`. When adding fields to mock front-end data, update both the interface and any mock arrays / components that assume counts (e.g., stats cards).
- Page protection: Each dashboard page duplicates pattern: `useEffect` checks `localStorage.isAuthenticated`; redirects to `/` if missing; shows spinner while checking. If you DRY this, create a tiny hook `useAuthGate()` returning `{ready, authed}` and refactor pages gradually only if requested.
- UI pattern: Feature “Overview” components render: header (optional hidden on mobile), three stat `Card`s, search/filter controls, list/detail sections, and optional add-dialog component.
- Styling: Consistent Tailwind utility classes; color semantics: action buttons use `bg-orange-500 hover:bg-orange-600`; status badges use pastel background + contrasting text (see mapping functions inside components).
- Forms: Local `useState` only; submission currently console.logs or navigates. Keep additions symmetrical: derive new entity arrays in component local state.

### 3. Reusable Utilities & Patterns

- `cn()` merges conditional classNames; always use for dynamic class concatenation instead of manual string joins.
- Badge/status color logic lives inline via small helper functions (e.g., `getStatusColor`, `getStatusLabel`). Follow this pattern for new status types.
- ID generation: Current pattern uses `Date.now().toString()`. Stay consistent unless asked to change.
- Dialog components (e.g., `AddLocationDialog`, `AddMaterialDialog`, `AddCommentDialog`) accept `isOpen`, `onClose`, and mutation callbacks; mimic that shape for new “add” dialogs.

### 4. Mock Data & Future Backend Alignment

- SQL schema in `scripts/01_create_tables.sql` and views in `08_create_views.sql` reflect intended production entities (users, locations, materials, reports, pest_findings, comments, junction tables). Keep TypeScript interfaces synchronized with schema names & nullable semantics.
- When introducing a new field (e.g., `severity` on reports):
  1. Update SQL (if relevant) under `scripts/` (new migration file; don’t edit old ones unless instructed).
  2. Update TS interface in `lib/database.ts`.
  3. Adjust any mock collections / UI badges & filters.

### 5. Adding Features Safely

- Maintain the mobile/desktop responsive layout: desktop sidebar (`lg:` classes), mobile bottom nav, consistent padding: `px-4 sm:px-6 lg:px-8 py-6`.
- Prefer extending existing overview components rather than creating entirely new pages if conceptually similar (e.g., adding “Teams” would clone Reports pattern: stats + filters + list).
- For new entity screens: replicate pattern: local filter state, summary stats derived via simple array reduces, list items with badges, optional collapsible detail.
- Keep auth gate minimal—no external libs.

### 6. Performance & Quality

- No heavy data sets yet; keep components client-side. Avoid premature memoization unless a list exceeds a few hundred rows.
- Lint & type errors are ignored in build via `next.config.mjs` (eslint & typescript ignore). Still aim for correct types; don’t rely on `any` unless necessary.

### 7. Build / Run Workflow

- Install & dev: `pnpm install` then `pnpm dev` (scripts: `dev`, `build`, `start`, `lint`).
- Tailwind v4: Class usage is on-demand; unused class purging handled automatically; do not manually curate safelists without need.
- Images are `unoptimized` per config (no need to add `next/image` optimizations now).

### 8. When Updating UI Primitives

- Add new primitives under `components/ui/` with minimal props mirroring existing style (e.g., follow `button.tsx` pattern: variant logic + `cn`).
- Ensure consistent export style: named exports matching component filename in PascalCase.

### 9. Avoid / Do Not

- Don’t introduce server actions, database drivers, or auth providers without explicit instruction.
- Don’t refactor wide swaths (e.g., converting all pages to a HOC) unless requested—incremental, minimally invasive changes.
- Don’t rename existing directories; new features should slot into existing structure.

### 10. Good Example References

- Status & filtering patterns: `components/reports/reports-overview.tsx`.
- Collapsible detail sections: `components/locations/locations-overview.tsx`.
- Multi-tab form pattern: `components/reports/add-report-form.tsx` (Tabs for add/list views).
- Dialog-driven creation: `components/materials/add-material-dialog.tsx` (similar shape across others).

### 11. Extension Ideas (Only if Asked)

- Extract shared auth gate hook.
- Centralize mock data in `lib/mock-data.ts` consumption instead of per-component duplicates.
- Introduce a lightweight data context to avoid prop drilling when state needs sharing.

Respond to user prompts using these conventions; cite concrete file paths when describing or changing patterns.
