# JobPilot

JobPilot is an AI-powered job hunting assistant for developers. It helps users create a profile, upload a resume, discover relevant jobs, score them against their skills, and research companies before applying.

## What it does

- Tracks a user's profile and resume data
- Searches for software engineering jobs from Adzuna
- Matches jobs against the user's profile using AI
- Shows a match score, strengths, and missing skills
- Researches companies and produces a recruiter-friendly dossier
- Provides a dashboard with recent activity and analytics

## Core user flow

1. Sign in with GitHub or Google via InsForge auth
2. Complete the profile and upload a resume
3. Search for jobs by title and location
4. Review AI-generated match scores and reasons
5. Open a job detail page for full context and company research
6. Use the dashboard to monitor activity and trends

## Tech stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- InsForge for auth and backend data
- OpenAI for resume/job analysis and company research synthesis
- Adzuna for job discovery
- PostHog for analytics

## Project structure

- `app/` — application routes and page layouts
- `components/` — reusable UI components
- `context/` — product and architecture documentation
- `lib/` — shared libraries and server utilities
- `public/` — static assets and branding
- `docs/` — specs and design documents

## Local setup

Install dependencies:

```bash
npm install
```

Create your environment file by copying `.example.env`:

```bash
cp .example.env .env.local
```

Then fill in the required values:

- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_POSTHOG_KEY`
- `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN`
- `NEXT_PUBLIC_POSTHOG_HOST`
- `NEXT_PUBLIC_INSFORGE_URL`
- `NEXT_PUBLIC_INSFORGE_ANON_KEY`
- `NEXT_PUBLIC_BROWSERBASE_API_KEY`
- `NEXT_PUBLIC_ADZUNA_APPLICATION_ID`
- `NEXT_PUBLIC_ADZUNA_APPLICATION_KEY`
- `OPENAI_API_KEY`

Run the app:

```bash
npm run dev
```

Then open:

```text
http://localhost:3000
```

## Main routes

- `/` — marketing homepage
- `/login` — authentication
- `/dashboard` — user overview and analytics
- `/find-jobs` — job discovery and lists
- `/find-jobs/[id]` — individual job detail page
- `/profile` — profile and resume management

## Features in scope

- Homepage with product messaging and CTA
- Auth with Google and GitHub OAuth
- Profile creation with resume upload
- AI-assisted resume extraction
- Job discovery via Adzuna
- AI job matching and score breakdown
- Company research summaries
- Dashboard analytics and recent activity
- PostHog tracking across core workflows

## Notes

This repo is designed around a developer-focused job search flow and intentionally keeps the product focused on job discovery, matching, and prep rather than automation-heavy application workflows.

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## License

This project is currently private and not published under an open-source license.
