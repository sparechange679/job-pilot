# 0001. Database Schema

**Date**: 2026-08-12
**Status**: Proposed

## Summary

This decision sets up the core database structure and security rules for JobPilot. It establishes the four main tables for user profiles, job listings, agent search runs, and activity logs, along with a secure storage area for resumes. Strict security rules (row level security) ensure that users can only see and manage their own data, providing a solid foundation for the rest of the application.

## Context

JobPilot needs a reliable way to store user data, job search results, and the logs from its autonomous agents. Without a defined schema, we cannot store the profiles needed for matching or the results found by the search agents. We are using InsForge as our backend, which provides a PostgreSQL database and built-in security features. The challenge is to define a schema that is flexible enough for AI research data (which comes in various shapes) while keeping user data private and isolated.

## Requirements

**User stories**:
- As a candidate, I want my profile and resumes to be stored securely so that only I can access them.
- As a search agent, I want a place to save found jobs and my match reasoning so the user can review them later.

**Acceptance criteria**:
- **AC-1**: Database contains four tables: `profiles`, `jobs`, `agent_runs`, and `agent_logs`.
- **AC-2**: A storage bucket named `resumes` is created with authenticated access only.
- **AC-3**: Row Level Security (RLS) is enabled on all tables, ensuring users can only access rows where `user_id` matches their own ID.
- **AC-4**: The `jobs` table can store flexible AI-generated research data (JSONB format).
- **AC-5**: The `profiles` table stores complete professional history, skills, and preferences.

## Options considered

### Option 1: Full Relational Schema (InsForge PostgreSQL)

A structured approach using the four tables defined in the build plan, leveraging PostgreSQL's native features like JSONB for flexible AI data and RLS for security.

**Pros**:
- Strong data integrity and clear relationships.
- Built-in security (RLS) simplifies application logic.
- JSONB provides the flexibility needed for unstructured AI outputs.

**Cons**:
- Requires upfront design of all tables.

### Option 2: Schema-less / Document Approach

Storing most data in a single large JSON blob or a document-style store.

**Pros**:
- Very flexible for changing AI outputs.

**Cons**:
- Harder to enforce security rules at the database level.
- Loss of relational benefits (joins, constraints).
- Not the native strength of the chosen InsForge platform.

## Decision

**Chosen option**: Option 1: Full Relational Schema (InsForge PostgreSQL)

We will implement the complete four-table schema with strict security policies.

**Implementation skills**: `insforge` (`insforge/sdk`, `node_modules/@insforge/sdk/`)

## Rationale

We chose the relational approach because it aligns perfectly with the InsForge platform and provides the strongest security guarantees for our users. By using PostgreSQL's JSONB columns for `company_research` and `work_experience`, we get the best of both worlds: the structure of a relational database for core entities and the flexibility of a document store for AI data. Strict RLS is the most reliable way to prevent data leaks between users in a multi-tenant application.

## Feature design

**Data model sketch**:

**Table: `profiles`**
| Column | Type | Constraints |
|---|---|---|
| `id` | uuid | PK, references auth.users |
| `full_name` | text | |
| `email` | text | |
| `phone` | text | |
| `location` | text | |
| `current_title` | text | |
| `experience_level`| text | |
| `years_experience` | integer | |
| `skills` | text[] | |
| `industries` | text[] | |
| `work_experience` | jsonb | Array of objects |
| `education` | jsonb | Object |
| `job_titles_seeking`| text[] | |
| `remote_preference`| text | |
| `preferred_locations`| text[] | |
| `salary_expectation`| text | |
| `cover_letter_tone`| text | |
| `linkedin_url` | text | |
| `portfolio_url` | text | |
| `work_authorization`| text | |
| `resume_pdf_url` | text | |
| `is_complete` | boolean | Default: false |
| `created_at` | timestamptz | Default: now() |
| `updated_at` | timestamptz | Default: now() |

**Table: `agent_runs`**
| Column | Type | Constraints |
|---|---|---|
| `id` | uuid | PK, Default: gen_random_uuid() |
| `user_id` | uuid | FK -> profiles.id, NOT NULL |
| `status` | text | 'running', 'completed', 'failed' |
| `job_title_searched`| text | |
| `location_searched` | text | |
| `jobs_found` | integer | Default: 0 |
| `started_at` | timestamptz | Default: now() |
| `completed_at` | timestamptz | |

**Table: `jobs`**
| Column | Type | Constraints |
|---|---|---|
| `id` | uuid | PK, Default: gen_random_uuid() |
| `run_id` | uuid | FK -> agent_runs.id, Nullable |
| `user_id` | uuid | FK -> profiles.id, NOT NULL |
| `source` | text | 'search', 'url' |
| `source_url` | text | |
| `external_apply_url`| text | |
| `title` | text | |
| `company` | text | |
| `location` | text | |
| `salary` | text | |
| `job_type` | text | |
| `about_role` | text | |
| `responsibilities` | text[] | |
| `requirements` | text[] | |
| `nice_to_have` | text[] | |
| `benefits` | text[] | |
| `about_company` | text | |
| `match_score` | integer | Nullable |
| `match_reason` | text | |
| `matched_skills` | text[] | |
| `missing_skills` | text[] | |
| `company_research` | jsonb | Nullable |
| `found_at` | timestamptz | Default: now() |

**Table: `agent_logs`**
| Column | Type | Constraints |
|---|---|---|
| `id` | uuid | PK, Default: gen_random_uuid() |
| `run_id` | uuid | FK -> agent_runs.id, NOT NULL |
| `user_id` | uuid | FK -> profiles.id, NOT NULL |
| `message` | text | |
| `level` | text | 'info', 'success', 'warning', 'error' |
| `job_id` | uuid | FK -> jobs.id, Nullable |
| `created_at` | timestamptz | Default: now() |

**API surface**:
Direct table access via InsForge SDK, governed by RLS.

**Value sourcing**:
| Action | Value produced / displayed | Source |
|---|---|---|
| Create Profile | `email` | auth user email |
| Find Jobs Run | `match_score` | GPT-4o scoring logic |
| Company Research | `company_research` | Agent research synthesis |
| View Jobs | `match_reason` | DB column `match_reason` |

**Key invariants**:
- Every row in `jobs`, `agent_runs`, and `agent_logs` must have a `user_id` that exists in `profiles`.
- A user can only have one active `running` agent run at a time (enforced by application logic).

**Security model**:
Strict Row Level Security (RLS) on all tables. 
- Policy: `CREATE POLICY "User can only access own data" ON <table> FOR ALL USING (user_id = auth.uid());`
- Storage: Bucket `resumes` restricted to `resumes/{user_id}/*` for the authenticated user.

**Critical test scenarios**:
- Happy path: User creates a profile and it is successfully saved to the `profiles` table, verifies **AC-1, AC-5**.
- Failure case: User tries to access another user's job listing directly via ID and is denied by the database, verifies **AC-3**.
- Storage test: User uploads a resume and verifies it is stored in the correct private path, verifies **AC-2**.

## Build plan

1. Create `profiles` table with all fields and enable RLS, satisfies **AC-1, AC-3, AC-5**.
2. Create `agent_runs` table with foreign key to profiles and enable RLS, satisfies **AC-1, AC-3**.
3. Create `jobs` table with foreign keys and JSONB research column, enable RLS, satisfies **AC-1, AC-3, AC-4**.
4. Create `agent_logs` table with foreign keys and enable RLS, satisfies **AC-1, AC-3**.
5. Create `resumes` storage bucket with authenticated-only access policies, satisfies **AC-2**.

## Consequences

**Positive**:
- Secure by default with RLS.
- Scalable data model that handles both structured and unstructured AI data.
- Clear tracking of agent activities and logs.

**Negative / tradeoffs**:
- JSONB columns require careful handling in the frontend to avoid runtime errors on missing fields.
- Initial setup requires precise SQL or UI configuration in InsForge.

**Neutral**:
- All queries must include the user session for RLS to function correctly.
