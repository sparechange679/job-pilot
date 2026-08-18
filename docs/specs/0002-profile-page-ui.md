# 0002. Profile Page — Full UI

**Date**: 2026-08-12
**Status**: Accepted

## Summary

This decision defines the user interface and interaction model for the JobPilot profile page. It establishes a comprehensive form for capturing personal, professional, and career preference data, integrated with a secure resume upload system. The implementation includes real time profile completion tracking and an automated resume extraction flow to minimize manual data entry for the user.

## Context

A high quality candidate profile is the foundational input for JobPilot's autonomous job search and company research agents. Without detailed information about a user's skills, experience, and preferences, the AI agents cannot accurately match jobs or provide meaningful insights. The current application has basic authentication but lacks a central hub for users to manage their professional identity. We need to build a UI that is both exhaustive in its data collection and frictionless in its user experience, using the already established InsForge backend and PostgreSQL schema.

## Requirements

**User stories**:
- As a candidate, I want to upload my resume so that my profile details are automatically extracted and I don't have to type them all manually.
- As a candidate, I want to see which parts of my profile are missing so that I can improve my chances of getting better job matches.
- As a candidate, I want to manage my work history and education as dynamic lists so that I can accurately represent my full career path.

**Acceptance criteria**:
- **AC-1**: Profile page displays a 70% completion indicator (basis: weighted section logic) that updates as the user fills out the form.
- **AC-2**: A secure file upload area accepts PDF resumes (max 5MB) and stores them in the `resumes/{user_id}/` bucket.
- **AC-3**: Successful resume upload immediately triggers an AI extraction process to pre-fill the form fields.
- **AC-4**: Personal information, professional details, and job preferences are editable via standard form inputs.
- **AC-5**: Work experience and education sections support adding, editing, and removing multiple entries via inline expansion.
- **AC-6**: "Save Profile" action persists all data to the `profiles` table and shows a success toast.
- **AC-7**: The UI follows the design tokens (Tailwind CSS v4) and layout patterns defined in `ui-tokens.md` and `ui-rules.md`.

## Options considered

### Option 1: Full Inline Form with Auto Extraction (Recommended)

A comprehensive single page form with real time completion tracking and automatic pre-filling from uploaded resumes.

**Pros**:
- Lowest friction for the user (auto extraction saves time).
- Clear progress visibility encourages profile completion.
- Unified view makes it easy to review the entire professional profile at once.

**Cons**:
- A long form can be overwhelming if not visually segmented correctly.
- Auto extraction requires robust error handling for failed AI parsing.

### Option 2: Multi-step Wizard

Breaking the profile into several steps (Personal -> Professional -> Preferences).

**Pros**:
- Less overwhelming for a first time setup.

**Cons**:
- Higher friction for subsequent edits (need to click through multiple screens).
- Harder to see the "whole picture" of the profile.
- Doesn't align as well with the "central profile hub" design in `profile.png`.

## Decision

**Chosen option**: Option 1: Full Inline Form with Auto Extraction

We will implement a single, well-segmented profile page as shown in the design, featuring automatic AI extraction upon resume upload and a weighted completion progress indicator.

**Implementation skills**: `insforge` (`insforge/sdk`, `node_modules/@insforge/sdk/`) · `tailwind-css-patterns` (`.agents/skills/tailwind-css-patterns/`)

## Rationale

We chose the full inline form because it provides the most efficient "management hub" experience for the user. Automatic extraction (basis: Staff recommendation for frictionless onboarding) is critical for conversion, as manual resume entry is a major drop-off point. The weighted completion indicator (basis: behavioral design patterns) provides clear feedback on profile strength. The design aligns with our existing `profiles` table schema and leverages InsForge's storage and database capabilities directly.

## Feature design

**Data model sketch**:
Uses the existing `profiles` table (basis: spec 0001). 
- `work_experience`: `jsonb` array of `{ company, title, start_date, end_date, responsibilities }`.
- `education`: `jsonb` array of `{ institution, degree, field, graduation_year }`.
- `skills` & `industries`: `text[]`.

**API surface**:
| Endpoint | Method | Key inputs | Key outputs | Auth | Key errors |
|---|---|---|---|---|---|
| /api/profile | GET | none | profile object | authenticated | 404 not found |
| /api/profile | POST | profile data (req) | updated profile | authenticated | 400 invalid, 500 server error |
| /api/resume/upload | POST | file (PDF) | file url | authenticated | 413 too large, 415 unsupported |

**Value sourcing**:
| Action | Value produced / displayed | Source |
|---|---|---|
| View Profile | Completion % | Derived from `profiles` columns (weighted: Personal 20%, Prof 30%, Work 30%, Edu 10%, Pref 10%) |
| Upload Resume | `resume_pdf_url` | InsForge Storage upload result |
| Extract Resume | Form values | AI extraction from `resume_pdf_url` (Feature 07) |
| Save Profile | `updated_at` | DB `updated_at` (automatic) |

**Key invariants**:
- `user_id` must match the authenticated session user.
- Resume file size must not exceed 5MB.
- `skills` and `industries` arrays must not exceed 50 items each.

**Security model**:
- Row Level Security (RLS) ensures users only access their own profile row.
- Storage bucket policies restrict access to `resumes/{user_id}/*`.
- Server side validation in Next.js Actions before database updates.

**Configuration required**:
- `NEXT_PUBLIC_INSFORGE_URL`: API base URL.
- `INSFORGE_SERVICE_KEY`: For backend operations if needed (prefer anon key + RLS where possible).

**Critical test scenarios**:
- Happy path: User uploads PDF, values are extracted and pre-filled, user saves and data persists, verifies **AC-2, AC-3, AC-6**.
- Failure case: User uploads a 10MB file, system rejects with clear error message, verifies **AC-2**.
- UI validation: Completion bar increases when "Location" is filled, verifies **AC-1**.

## Build plan

1. **Setup Profile Layout**: Implement the page shell with Navbar/Footer and main container segments (basis: `profile.png`), satisfies **AC-7**.
2. **Resume Upload Component**: Build the drag-and-drop upload zone with InsForge storage integration and 5MB limit, satisfies **AC-2**.
3. **Form Sections Implementation**: Create Personal, Professional, Experience, and Education form sections with Tailwind v4 styling, satisfies **AC-4, AC-5**.
4. **Completion Logic**: Implement the 70% indicator component with weighted section calculation, satisfies **AC-1**.
5. **Save Profile Action**: Create a Next.js Server Action to update the `profiles` table via the InsForge SDK, satisfies **AC-6**.
6. **Integration Hook for Extraction**: Add the hook for Feature 07 to trigger after successful upload (pre-fill logic), satisfies **AC-3**.

## Consequences

**Positive**:
- Significant reduction in manual data entry for users.
- Strong visual feedback on profile quality.
- Clean, responsive UI using modern Tailwind CSS v4 patterns.

**Negative / tradeoffs**:
- AI extraction (AC-3) adds latency to the upload flow.
- Complexity in managing dynamic JSONB lists (Experience/Education) in React state.

**Neutral**:
- Requires users to have a PDF resume for the optimal onboarding experience.

## References

**Project sources**:
- `context/designs/profile.png`: The visual source of truth for the layout.
- `docs/specs/0001-database-schema.md`: The underlying data model.
- `context/ui-tokens.md`: Tailwind v4 theme configuration.

**Practices & standards**:
- Mobile-first responsive design (basis: Tailwind CSS best practices).
- Server Actions for form submission (basis: Next.js App Router patterns).
