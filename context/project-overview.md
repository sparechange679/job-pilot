# Project Overview

## About the Project

JobPilot is a full stack AI-powered job hunting assistant. The user sets up their profile once, uploads their resume, and the agent automatically discovers relevant jobs from Adzuna — scoring each one against the user's profile using GPT-4o. For jobs they're interested in, the agent researches the company across their public web pages and builds a structured dossier — company overview, tech stack, culture, why the role exists, and interview prep. The user reviews everything and applies with one click.

The entire process is tracked on a dashboard with PostHog-powered analytics and a recent activity feed.

---

## The Problem It Solves

Job hunting is one of the most repetitive and time-consuming tasks a developer faces. Reading dozens of job descriptions, deciding if a role fits, researching each company from scratch — all of this before even clicking apply.

JobPilot eliminates all of that preparation work. The agent finds the jobs, scores them intelligently against the user's actual skills, and researches each company so the user arrives at every application fully informed. The user just decides which ones to apply to and clicks.

---

## Pages

```
/                  → Homepage
/login             → Auth page (Google + GitHub OAuth)
/dashboard         → Overview, recent activity, analytics
/find-jobs         → Search controls + full jobs list
/find-jobs/[id]    → Individual job details page + company research
/profile           → Profile form, resume management
```

---

## Navigation

Top navbar. Clean and minimal. Three navigation items:

```
Dashboard    Find Jobs    Profile
```

Full width layout on all pages. No sidebar.

---

## Core User Flow

### Homepage

- Hero section
- Logged in users → redirect to dashboard
- Logged out users → redirect to login

### Onboarding

- User signs up via InsForge auth (Google or GitHub OAuth)
- On login → redirect to /dashboard
- Dashboard shows incomplete profile banner if profile not finished

### Profile Setup

- User fills profile form — all standard resume fields
- User uploads their existing resume PDF
- Two options on upload:
  - "Extract from Resume" → GPT-4o parses resume and auto-fills profile form fields
  - "Skip" → resume stored as-is, profile unchanged
- User can manually edit any profile field at any time
- User can generate a clean professional PDF resume from their current profile data using GPT-4o

### Finding Jobs — Adzuna Discovery

- User goes to Find Jobs page
- Enters job title and location
- Clicks Find Jobs button
- Agent calls Adzuna API with user's search criteria
- GPT-4o scores each job 0-100 against user profile
- Jobs appear in the job list below
- After search completes a message shows: "Found 8 jobs and saved 4 strong matches"

### Job Matching

- GPT-4o scores each job 0-100 against user profile
- Returns: score, match reason, matched skills array, missing skills array
- All jobs visible in Find Jobs page regardless of score
- High scoring jobs visually highlighted
- Low scoring jobs still accessible — user decides what to do

### Job Details Page

- Full structured job information:
  - Title, company, location, salary, job type, source, date found
  - About the role
  - Responsibilities (bullet points)
  - Requirements (bullet points)
  - Nice to have (if present)
  - Benefits (if present)
  - About the company
- Match score section:
  - Score number prominently displayed
  - Visual score indicator
  - Matched skills — green tags
  - Missing skills — red tags
  - Match reason paragraph from GPT-4o
- Company Research section:
  - Empty state with Research Company button
  - After research: structured dossier showing company overview, tech stack, culture, why this role exists, interview prep talking points
  - Powered by Browserbase + Stagehand browsing the company's public pages
- Apply Now button — opens external apply URL in new tab

### Company Research Flow

- User clicks Research Company on job details page
- Single Browserbase session opens with Stagehand
- Agent navigates to company homepage — extracts overview, nav links, tech mentions
- Agent visits About, Blog, Engineering pages if they exist
- GPT-4o synthesizes all extracted content into structured dossier
- Dossier displayed on job details page
- If company site cannot be found — GPT-4o generates best dossier from company name and job description alone

### Dashboard

- Stats bar — 4 cards: Total Jobs Found, Avg. Match Rate, Companies Researched, Jobs This Week
- Recent activity — list of last 5-10 user actions pulled from DB
- Analytics section (PostHog powered):
  - Jobs found over time — line chart
  - Match score distribution — bar chart
  - Company research activity — bar chart

### Find Jobs Page

- Search controls at top:
  - Job title input
  - Location input
  - Find Jobs button
  - Success message after search: "Found 8 jobs and saved 4 strong matches"
- Full paginated job list below:
  - Filter: All Matches / High Match / Low Match dropdown
  - Sort dropdown: Match Score / Newest / Oldest
  - Each job row: company, title, match score badge, salary, source badge, date found
  - Click job row → opens job details page
  - Pagination — 20 jobs per page
  - "Jobs by Adzuna" credit displayed on job listings

---

## Data Architecture

### Main Profile Data

- Lives in `profiles` table
- Only changes when user explicitly edits profile page or uploads resume and selects "Extract from Resume"
- Used for job matching
- Never modified by any agent operation

### Company Research Data

- Stored in `jobs.company_research` jsonb column
- Generated per job when user clicks Research Company
- Never affects profile data or match score

---

## Features In Scope

- Homepage with hero, how it works, features, footer
- Top navbar — Dashboard, Find Jobs, Profile
- InsForge authentication (Google + GitHub OAuth)
- Redirect to dashboard after login
- Profile form with all standard resume fields
- Resume PDF upload with optional profile auto-fill via GPT-4o
- Resume PDF generation from profile data using GPT-4o
- Adzuna API job discovery — searches by title and location, category filtered to IT jobs
- GPT-4o job matching with score, reason, matched skills, missing skills
- Job details page with full structured description
- Company Research Agent — single Browserbase session browses company public pages, GPT-4o builds dossier
- Find Jobs page with search controls, filter, sort dropdown, pagination
- Dashboard with stats bar, recent activity, analytics charts
- PostHog event tracking throughout
- PostHog analytics charts on dashboard
- Incomplete profile banner on dashboard
- "Jobs by Adzuna" credit on all job listings

---

## Features Out of Scope

- Auto apply — agent does not fill or submit application forms
- URL input for manual job import
- Cover letter generation
- Resume tailoring per job
- Score recalculation after tailoring
- Previous Job + Next Job navigation
- Sidebar navigation — top navbar only
- Separate analytics page — charts live on dashboard
- Live browser embed on dashboard
- Live agent feed / realtime log
- Job-specific profile form on job details page
- Dismiss job feature
- Email or push notifications
- Mobile app
- Team or multi-user accounts
- Scheduled agent runs — manually triggered only
- Multiple saved resume versions — one active resume per user at a time
- Payment or subscription system
- Browser extension

---

## PostHog Events

```typescript
job_search_started; // { userId, jobTitle, location }
job_found; // { userId, source, matchScore }
profile_completed; // { userId }
company_researched; // { userId, jobId, company }
```

---

## Target User

A developer or technical job seeker who:

- Is actively applying to jobs
- Has an existing resume they want to use
- Wants intelligent job matching based on their actual skills
- Wants to research companies quickly before applying
- Is comfortable with a modern web application

---

## Success Criteria

- User can sign up, fill profile, upload resume, and start finding jobs in under 5 minutes
- Adzuna job discovery returns relevant tech jobs for any title and location search
- GPT-4o match scores feel accurate and the reasoning makes sense
- Company Research Agent returns a useful dossier for well-known tech companies
- Company Research Agent gracefully handles companies with minimal web presence
- Job details page displays clean structured job information
- Dashboard analytics charts show meaningful data after several searches
- All job data stored correctly in InsForge with full structured fields
- PostHog events fire correctly for all key user actions
- UI is visually consistent across all pages
