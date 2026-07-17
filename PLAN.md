# Woolwork — Deployment Plan

## Phase 1: Vite Project Setup
- [x] Scaffold a new Vite + React project (`npm create vite@latest`)
- [x] Move `Knitting app.jsx` into the Vite project as `src/App.jsx`
- [x] Install dependencies and confirm the app runs locally (`npm run dev`)
- [x] Clean up Vite boilerplate (default CSS, placeholder components)

## Phase 2: localStorage Persistence
- [x] Persist knitting projects to localStorage on every state change
- [x] Persist spinning projects to localStorage on every state change
- [x] Load from localStorage as the initial state (so data survives page refresh)
- [x] Test: add a project, refresh, confirm it's still there

## Phase 3: Supabase Project Setup
- [x] Create a Supabase project at supabase.com
- [x] Install the Supabase JS client (`npm install @supabase/supabase-js`)
- [x] Add Supabase URL and anon key to a `.env` file
- [x] Confirm `.env` is in `.gitignore` before any commits

## Phase 4: Auth
- [x] Enable email/password auth in the Supabase dashboard
- [x] Build a simple login/signup screen in the app
- [x] Gate the main app behind authentication (redirect to login if no session)
- [x] Add a sign-out button
- [x] Test: sign up, sign in, sign out

## Phase 4.5: AI Import (deferred)
- [ ] Create a Supabase Edge Function to proxy requests to the Anthropic API (keeps the API key server-side)
- [x] Update the app's fetch call to point at the Edge Function URL — currently points at the local Vite dev proxy (`vite.config.js`), which only works in `npm run dev`; needs to be swapped to the Edge Function URL once that exists
- [x] Test: paste a pattern text or upload a pattern image and confirm the grid populates — works in local dev
- [ ] Add the Anthropic API key to Supabase secrets (not in `.env`)

## Phase 5: Database Migration
- [x] Create `knitting_projects` table in Supabase with row-level security (each user sees only their own rows)
- [x] Create `spinning_projects` table with the same RLS policy
- [x] Replace localStorage reads/writes with Supabase queries (`select`, `insert`, `update`, `delete`)
- [x] Migrate any existing localStorage data to the database on first login
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

## Phase 8: Multi-User Readiness (before opening signups to real users)
Currently only one account (mine) exists — not urgent yet, but must be checked before inviting other users.
- [ ] Verify RLS policies on `knitting_projects`, `spinning_projects`, and `user_library` actually restrict rows to `auth.uid()` — confirm in Database → Policies, not just assumed from app code
- [ ] Turn on "Confirm email" under Authentication → Sign In/Providers
- [ ] Raise minimum password length from 6 to 8+ (Authentication → Sign In/Providers → Email)
- [ ] Decide on upgrading off the Supabase Free plan — Free-tier projects auto-pause after a week of inactivity, which would break login for real users; Pro also unlocks "Leaked Password Protection" (flagged by Security Advisor)
- [ ] Customize auth emails (confirmation, password reset) under Authentication → Emails — defaults are plain/Supabase-branded
- [ ] Finish Phase 4.5 (AI import Edge Function) — the local dev proxy won't work once deployed, and without it strangers could abuse the Anthropic API key
- [ ] Finish Phase 6 (photo storage) — base64-in-database photos won't scale past one user
- [ ] Add a short note on the signup screen about how user data is stored/used
