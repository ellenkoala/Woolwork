# Woolwork

A knitting and spinning project tracker. Track knitting patterns on a stitch grid, log spinning projects, and keep a library of yarn, fibre, needles, and tools — synced to the cloud via Supabase, with a guest mode for local-only use.

## Setup

Install dependencies:

```
npm install
```

Create a `.env` file in the project root with:

```
# Supabase (required for login/sync — the app also works in guest mode without these)
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# Anthropic (only needed for the AI pattern-import feature, local dev only)
ANTHROPIC_KEY=your-anthropic-api-key
```

`.env` is already listed in `.gitignore` — never commit it.

Run the app locally:

```
npm run dev
```

## Scripts

- `npm run dev` — start the local dev server
- `npm run build` — build for production (output in `dist/`)
- `npm run preview` — preview the production build locally

## Project status

See [PLAN.md](PLAN.md) for the deployment roadmap and what's currently done.
