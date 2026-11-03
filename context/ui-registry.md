# UI Registry

Living document. Updated after every component is built. Read this before building any new component — match existing patterns exactly before inventing new ones.

---

## How to Use

Before building any component:

1. Check if a similar component already exists here
2. If yes — match its exact classes
3. If no — build it following ui-rules.md and ui-tokens.md, then add it here

After building any component — update this file with the component name, file path, and exact classes used.

---

## Components

### Layout Components
- **Navbar:** `components/layout/Navbar.tsx` (Supports `initialUser` for server-side auth sync)
  - Container: `fixed top-0 left-0 right-0 h-16 bg-surface z-50 px-6 border-b border-border`
  - Logo: `Image` (100x100px)
  - Links: `text-sm font-medium transition-colors hover:text-accent` (+ active state: `text-accent`, default: `text-text-dark`)
  - Button: `bg-text-darkest text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity`
- **Footer:** `components/layout/Footer.tsx`
  - Container: `bg-surface border-t border-border py-12 px-6`
  - Logo: `Image` (100x100px)
  - Links: `text-sm font-medium text-text-dark hover:text-accent transition-colors`

### Homepage Components
- **Hero:** `components/homepage/Hero.tsx`
  - Section: `relative pt-32 pb-20 overflow-hidden`
  - Heading: `text-5xl md:text-[64px] font-bold text-text-primary leading-tight tracking-tight mb-6`
  - Primary Button: `bg-text-darkest text-white px-8 py-3 rounded-lg text-base font-medium flex items-center gap-2 hover:opacity-90 transition-opacity`
  - Secondary Button: `bg-surface border border-border text-text-primary px-8 py-3 rounded-lg text-base font-medium hover:bg-surface-secondary transition-colors`
- **Feature Card:** `components/homepage/ManageJobSearch.tsx`, `components/homepage/ApplyWithConfidence.tsx`
  - Active Card: `bg-surface shadow-[inset_4px_0_0_0_var(--color-accent)]`
  - Inactive Card: `bg-background`
  - Border: `p-8 border-b border-border last:border-b-0`
- **Testimonial:** `components/homepage/Testimonial.tsx`
  - Quote: `text-3xl md:text-4xl font-medium text-text-primary leading-tight italic`
  - Label: `text-accent uppercase tracking-widest text-xs font-bold mb-6 block`

### Profile Page Components
- **Profile Card:** `app/profile/page.tsx`
  - Container: `bg-surface border border-border rounded-[16px] p-6 shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]`
  - Section Heading: `text-[16px] font-semibold text-text-primary leading-[24px] mb-4`
  - Sub Heading: `text-[14px] font-semibold text-text-primary leading-[20px] mb-4 uppercase tracking-tight`
  - Label: `text-[12px] font-medium text-text-secondary uppercase tracking-tight`
  - Input: `bg-surface border border-border rounded-lg px-3 py-2 text-[14px] text-text-primary placeholder:text-text-muted focus:ring-1 focus:ring-accent focus:border-accent outline-none`
  - Primary Button (Save): `w-full bg-accent text-white py-3 rounded-lg font-semibold text-[16px] hover:opacity-90 transition-opacity`
  - Completion Ring: `text-error` for fill, `text-border-light` for track, `text-[20px] font-bold text-text-primary` for percentage
  - Upload Zone: `border-2 border-dashed border-border-muted rounded-xl p-10 bg-surface-secondary/50 relative`
  - Extract Action Button: `px-4 py-2 bg-accent text-white rounded-md text-[14px] font-medium hover:opacity-90 transition-opacity disabled:opacity-60`
  - Loading Spinner: `animate-spin h-5 w-5 text-white` (inside button), `h-8 w-8 text-accent` (full page loading)
  - Tag/Badge: `inline-flex items-center gap-1 px-3 py-1 bg-surface-secondary border border-border rounded-md text-[13px] text-text-primary`
  - Experience Item: `flex flex-col gap-6 p-4 bg-surface-secondary/30 rounded-xl border border-border-light relative`
  - View Resume Button: `px-4 py-2 border border-border bg-surface rounded-md text-[14px] font-medium text-accent hover:bg-surface-secondary transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50`
  - Generate Resume Action Button: `flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-md text-[14px] font-medium hover:opacity-90 transition-opacity disabled:opacity-60`

### Find Jobs Page Components
- **Find Jobs Page UI:** `app/find-jobs/page.tsx`
  - Page Shell: `flex min-h-screen flex-col bg-background`, content container `mx-auto w-full max-w-[1440px] px-6 pb-16 pt-24`
  - Search Card: `rounded-2xl border border-border bg-surface p-5 shadow-[0_1px_2px_rgba(0,0,0,0.06)]`
  - Search Input Group: wrapper `relative flex-1`, icon `absolute left-4 top-1/2 -translate-y-1/2 text-text-muted`, input `h-12 w-full rounded-xl border border-border bg-surface pl-11 pr-4 text-[14px] text-text-primary placeholder:text-text-muted outline-none transition-colors focus:border-accent`
  - Search CTA: `inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-accent px-6 text-[14px] font-semibold text-white transition-opacity hover:opacity-90`
  - Results Banner: `mb-6 rounded-xl border border-accent-light bg-accent-muted px-4 py-3 text-[14px] text-text-secondary`
  - Filter Pills: active `inline-flex h-10 items-center gap-2 rounded-full border border-border bg-surface px-4 text-[13px] font-medium text-text-primary`; inactive `inline-flex h-10 items-center gap-2 rounded-full border border-border bg-surface-secondary px-4 text-[13px] font-medium text-text-secondary`
  - Jobs Table: table card `overflow-hidden rounded-2xl border border-border bg-surface`; header cells `bg-surface-secondary px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-text-muted`; body cells `px-6 py-4 text-[14px] text-text-primary align-middle`
  - Match Score Meter: rail `h-2 w-full overflow-hidden rounded-full bg-border`, fill from tokenized state (`bg-success` / `bg-info-medium` / `bg-warning`) + label `text-[13px] font-medium text-text-secondary`
  - Source Badge: base `inline-flex rounded-full border px-3 py-1 text-[12px] font-medium`; Search `bg-accent-muted text-accent-dark border-accent-light`; URL `bg-info-lightest text-info-foreground border-info-light`
  - Pagination: text `text-[14px] text-text-secondary`, page buttons `inline-flex h-9 min-w-9 items-center justify-center rounded-lg border border-border bg-surface px-3 text-[13px] font-medium text-text-secondary`, active page `border-accent bg-accent text-white`
- **Find Jobs Discovery Client:** `app/find-jobs/FindJobsClient.tsx`
  - Search Input Card: `rounded-[16px] border border-border bg-surface p-6 shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]`
  - Controlled Search Inputs: `h-14 rounded-xl border border-border bg-surface px-4` + input `w-full bg-transparent text-[14px] text-text-primary placeholder:text-text-muted outline-none`
  - Search CTA (loading-aware): `flex h-14 items-center justify-center gap-2 rounded-xl bg-accent px-8 text-[16px] font-medium text-accent-foreground hover:opacity-90 disabled:opacity-70`
  - Success Banner: `mt-5 rounded-xl border border-success-light bg-success-lightest px-4 py-4 text-success-foreground`
  - Error Banner: `mt-5 rounded-xl border border-error bg-surface px-4 py-4 text-[14px] font-medium text-error`
  - Results Controls (server-backed): text filter input `h-12 rounded-lg border border-border bg-surface px-4 text-[14px] text-text-primary placeholder:text-text-muted`, filter/sort action buttons with active state `border-accent bg-accent-muted text-accent-dark` and inactive state `border-border bg-surface text-text-primary`
  - Pagination Summary + Controls: summary text `text-[16px] text-text-secondary` with emphasized counts `font-semibold text-text-primary`; nav buttons `rounded-xl border border-border bg-surface px-5 py-2 text-[16px]` + disabled `text-text-muted`; active page `h-12 min-w-12 rounded-xl border border-accent-light bg-accent-muted text-accent`
