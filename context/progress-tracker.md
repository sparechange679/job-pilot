# Progress Tracker

Update this file after every completed feature. Any AI agent reading this should immediately know what is done, what is in progress, and what is next.

---

## Current Status

**Phase:** Phase 3 — Find Jobs Page
**Last completed:** 11 Filter + Sort + Pagination
**Next:** 12 Job Details Page — Full UI

---

## Progress

### Phase 1 — Foundation

- [x] 01 Homepage
- [x] 02 Auth
- [x] 03 PostHog Initialization
- [x] 04 Database Schema
- [x] 04.1 PostHog Event Tracking (Pageviews & Basic Auth Events)

### Phase 2 — Profile Page

- [x] 05 Profile Page — Full UI (Implementation Complete)
- [x] 06 Profile Save Logic (Implementation Complete)
    - [x] Build Spec created ✓
    - [x] Implementation ✓
    - [x] Fix SDK Auth/DB integration errors ✓
- [x] 07 AI Profile Extraction from Resume
- [x] 08 Resume PDF Generation from Profile

### Phase 3 — Find Jobs Page

- [x] 09 Find Jobs Page — Full UI
- [x] 10 Adzuna Job Discovery
- [x] 11 Filter + Sort + Pagination

### Phase 4 — Job Details Page

- [ ] 12 Job Details Page — Full UI
- [ ] 13 Company Research Agent

### Phase 5 — Dashboard

- [ ] 14 Dashboard Page — Full UI
- [ ] 15 Stats Bar — Real Data
- [ ] 16 Recent Activity — Real Data
- [ ] 17 Analytics Charts — PostHog Data

---

## Decisions Made During Build

_Add decisions here as they are made during implementation._

---

## Notes

- **Logo Update:** Simplified Navbar and Footer logos by removing the blue box wrapper and text, using a pure 100x100px image instead to match the landing page design.
- **Auth PKCE Fix:** Manually handling PKCE verifier via cookies in Server Actions and Callback route, as SDK's default `sessionStorage` is unavailable in server-side Next.js context.
- **Navbar Auth Sync:** Improved `Navbar` component to use server-side session detection and `initialUser` prop to ensure correct auth state reflection across all pages and avoid client-side "flash".
- **Profile Page Hardening:** Fixed null-safety crashes on profile array/object fields, replaced `alert()` calls with an in-app toast (rendered via portal, above the navbar), unified the completion percentage and "missing fields" banner behind a single weighted checklist, and hid the completion banner entirely once the profile reaches 100%.
- **Resume View/Change:** Added a "View Resume" link (opens the stored PDF in a new tab) alongside the "Select/Change Resume" control once a resume has been uploaded.
- **AI Resume Autofill (Feature 07):** Added `POST /api/resume/extract` using `pdf-parse` + OpenAI structured extraction, plus an `Extract from Resume` action on the profile upload card that auto-fills form fields for user review before save.
- **AI Provider Update:** Migrated resume extraction model calls to OpenRouter-compatible settings (`https://openrouter.ai/api/v1` + referer/title headers) and constrained completion token limits to avoid 402 credit-limit errors with the provided key.
- **OpenRouter Auth Reliability Fix:** Switched resume extraction AI calls to an explicit `fetch` request with a guaranteed `Authorization: Bearer ...` header to resolve intermittent `401 Missing Authentication header` failures.
- **Resume PDF Generation (Feature 08):** Added `POST /api/resume/generate` to build polished resume content with GPT-4o, render a PDF with `@react-pdf/renderer`, upload to `resumes/{user_id}/resume.pdf` (upsert), persist `resume_pdf_url` in `profiles`, and wired the profile page "Generate Resume from Profile" action with loading and toast states.
- **Feature 08 Type-Safety Follow-up:** Aligned resume upload/public-URL calls with the current InsForge SDK signatures and fixed server PDF render/upload typing so production build and TypeScript checks pass.
- **Find Jobs UI (Feature 09):** Rebuilt `app/find-jobs/page.tsx` to match the design with a token-based search card, results banner, filter chips, score-meter table, source badges, and pagination controls using static sample rows as placeholders for upcoming data integration.
- **Adzuna Job Discovery (Feature 10):** Added `POST /api/agent/find` to run Adzuna discovery (country detection + `it-jobs` filter), score each result against the user profile via GPT matching, save jobs with `source: 'search'`, track `agent_runs` lifecycle updates, and emit PostHog `job_search_started`/`job_found` events. Wired `app/find-jobs/FindJobsClient.tsx` to call the endpoint, refresh persisted DB results, and show success/error banners.
- **Find Jobs Filtering + Sorting + Pagination (Feature 11):** Wired `app/find-jobs/page.tsx` to read URL search params and query the `jobs` table with user-scoped filters (`all/high/low`), sort modes (`match_score`, newest, oldest), case-insensitive company/title search, and 20-per-page pagination with exact counts. Updated `app/find-jobs/FindJobsClient.tsx` controls to drive URL state and render server-backed counts and page navigation.
- **History Note:** PR #2 (`revert-1-profile-page`) had reverted the original profile feature (PR #1) on `master`; that revert was itself reverted on `profile-extraction` to restore `ProfileClient.tsx` and the InsForge save flow before the fixes above were applied.
