# 0003. Profile Save Logic

**Date**: 2026-08-12
**Status**: Proposed

## Summary

Implement the logic to persist user profile data and resume files to the InsForge backend. This feature connects the Profile Page UI to the database and storage layers.

## Rationale

The Profile Page currently exists only in the frontend state. To make it functional, we need to:
1. Save personal and professional information to the `profiles` table.
2. Upload resume PDFs to a dedicated storage bucket.
3. Ensure the user's progress is persisted across sessions.

## Feature design

**Data model sketch**:
- **Table**: `profiles`
  - `id`: UUID (Primary Key, references auth.users)
  - `full_name`: TEXT
  - `email`: TEXT
  - `phone`: TEXT
  - `location`: TEXT
  - `linkedin_url`: TEXT
  - `portfolio_url`: TEXT
  - `work_authorization`: TEXT
  - `current_title`: TEXT
  - `experience_level`: TEXT
  - `years_experience`: TEXT
  - `skills`: TEXT[]
  - `industries`: TEXT[]
  - `work_experience`: JSONB[]
  - `education`: JSONB
  - `job_titles_seeking`: TEXT[]
  - `remote_preference`: TEXT
  - `salary_expectation`: TEXT
  - `preferred_locations`: TEXT[]
  - `resume_pdf_url`: TEXT
  - `updated_at`: TIMESTAMP WITH TIME ZONE

**State transitions**:
- Profile: `State (UI)` → `Saving (Loading)` → `Persisted (Success)` OR `Error`

**API surface**:
| Endpoint | Method | Key inputs | Key outputs | Auth | Key errors |
|---|---|---|---|---|---|
| SDK: `db.from('profiles').upsert()` | POST | `profile_data`: object | `data`, `error` | Authenticated | 403 Forbidden, 400 Bad Request |
| SDK: `storage.upload()` | POST | `file`: Blob, `path`: string | `path`, `error` | Authenticated | 413 Payload Too Large, 403 Forbidden |

**Value sourcing**:
| Action | Value produced / displayed | Source |
|---|---|---|
| Save Profile | `profile_data` | UI state (`profile` object) |
| Upload Resume | `resume_pdf_url` | Storage public URL after upload |
| Fetch Profile | Initial UI state | `db.from('profiles').select().single()` |

**Key invariants**:
- One profile per user (`id` is unique).
- Resumes are stored as `resumes/{user_id}.pdf` to ensure overwriting of previous versions.
- `updated_at` is set on every successful save.

**Security model**:
- Users can only read and write their own profile (enforced by RLS on InsForge).
- Resume bucket requires authentication for uploads.

**Configuration required**:
- `NEXT_PUBLIC_INSFORGE_URL`: API Base URL
- `NEXT_PUBLIC_INSFORGE_ANON_KEY`: Client-side anon key

## Requirements

1. **Manual Save**: Profile data is only persisted when the "Save Profile" button is clicked. (AC-1)
2. **Data Persistence**: All UI fields (Personal, Professional, Work Exp, Education, Preferences) are saved to the `profiles` table. (AC-2)
3. **Resume Storage**: Uploaded PDFs are stored in the `resumes` bucket with the naming convention `resumes/{user_id}.pdf`. (AC-3)
4. **Loading States**: Show a loading indicator on the Save button while the operation is in progress. (AC-4)
5. **Success/Error Notifications**: Display a toast or message informing the user of the save result. (AC-5)
6. **Initialization**: On page load, fetch the existing profile data for the authenticated user and populate the form. (AC-6)

## Build plan

1. **Setup Storage Bucket**: Ensure the `resumes` bucket exists in InsForge and has appropriate RLS policies.
2. **Fetch Logic**:
   - Implement `useEffect` in `app/profile/page.tsx` to fetch the current user's profile.
   - Handle the case where no profile exists (initial default state).
3. **Save Logic**:
   - Implement `handleSave` function in `app/profile/page.tsx`.
   - Call `insforge.db.from('profiles').upsert([profileData])`.
4. **Resume Upload**:
   - Update the Resume Upload Zone to handle file selection.
   - Implement `uploadResume` function using `insforge.storage.upload()`.
   - Update `resume_pdf_url` in the `profile` state/DB after successful upload.
5. **UI Updates**:
   - Add `isSaving` state and loading spinner to the Save button.
   - Add notification feedback (Success/Error).

**Critical test scenarios**:
- Happy path: User fills form, clicks Save, data is persisted to DB, verifies AC-1, AC-2
- Failure case: Database disconnect during save, error message shown, verifies AC-5
- Auth/permission: Unauthenticated user tries to save, redirect to login or error, verifies AC-2
- Resume path: User uploads new resume, existing one is replaced in storage, verifies AC-3
