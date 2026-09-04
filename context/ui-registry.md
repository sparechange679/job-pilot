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
  - Links: `text-sm font-medium text-text-dark hover:text-accent transition-colors`
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
  - Loading Spinner: `animate-spin h-5 w-5 text-white` (inside button), `h-8 w-8 text-accent` (full page loading)
  - Tag/Badge: `inline-flex items-center gap-1 px-3 py-1 bg-surface-secondary border border-border rounded-md text-[13px] text-text-primary`
  - Experience Item: `flex flex-col gap-6 p-4 bg-surface-secondary/30 rounded-xl border border-border-light relative`
