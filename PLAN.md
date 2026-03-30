# Woolwork — Deployment Plan

## Phase 1: Vite Project Setup
- [ ] Scaffold a new Vite + React project (`npm create vite@latest`)
- [ ] Move `Knitting app.jsx` into the Vite project as `src/App.jsx`
- [ ] Install dependencies and confirm the app runs locally (`npm run dev`)
- [ ] Clean up Vite boilerplate (default CSS, placeholder components)

## Phase 2: localStorage Persistence
- [ ] Persist knitting projects to localStorage on every state change
- [ ] Persist spinning projects to localStorage on every state change
- [ ] Load from localStorage as the initial state (so data survives page refresh)
- [ ] Test: add a project, refresh, confirm it's still there

## Phase 3: Supabase Project Setup
- [ ] Create a Supabase project at supabase.com
- [ ] Install the Supabase JS client (`npm install @supabase/supabase-js`)
- [ ] Add Supabase URL and anon key to a `.env` file
- [ ] Confirm `.env` is in `.gitignore` before any commits

## Phase 4: Auth
- [ ] Enable email/password auth in the Supabase dashboard
- [ ] Build a simple login/signup screen in the app
- [ ] Gate the main app behind authentication (redirect to login if no session)
- [ ] Add a sign-out button
- [ ] Test: sign up, sign in, sign out

## Phase 4.5: AI Import (deferred)
- [ ] Create a Supabase Edge Function to proxy requests to the Anthropic API (keeps the API key server-side)
- [ ] Update the app's fetch call to point at the Edge Function URL
- [ ] Test: paste a pattern text or upload a pattern image and confirm the grid populates
- [ ] Add the Anthropic API key to Supabase secrets (not in `.env`)

## Phase 5: Database Migration
- [ ] Create `knitting_projects` table in Supabase with row-level security (each user sees only their own rows)
- [ ] Create `spinning_projects` table with the same RLS policy
- [ ] Replace localStorage reads/writes with Supabase queries (`select`, `insert`, `update`, `delete`)
- [ ] Migrate any existing localStorage data to the database on first login
- [ ] Test: create projects on one device, confirm they appear on another

## Phase 6: Photo Storage (optional upgrade)
- [ ] Create a Supabase Storage bucket for project photos
- [ ] Replace base64 photo storage with uploaded files — store the URL instead
- [ ] Update the export functions to use the stored URLs

## Phase 7: Deploy
- [ ] Push the project to a GitHub repository
- [ ] Connect the repo to Netlify or Vercel
- [ ] Add Supabase environment variables to the hosting platform
- [ ] Confirm production build works end-to-end
- [ ] Set a custom domain if desired
