import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpRight,
  BriefcaseBusiness,
  CalendarDays,
  CircleDollarSign,
  MapPin,
  Sparkles,
  WandSparkles,
} from "lucide-react";

import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { createInsforgeServer } from "@/lib/insforge-server";

type JobDetailsPageProps = {
  params: Promise<{ id: string }>;
};

type JobDetailsRow = {
  id: string;
  title: string | null;
  company: string | null;
  salary: string | null;
  location: string | null;
  job_type: string | null;
  found_at: string | null;
  about_role: string | null;
  match_score: number | null;
  match_reason: string | null;
  matched_skills: string[] | null;
  missing_skills: string[] | null;
  external_apply_url: string | null;
};

function toRelativeDateLabel(value: string | null): string {
  if (!value) {
    return "Recently";
  }

  const foundDate = new Date(value);
  const now = new Date();
  const diffInMs = now.getTime() - foundDate.getTime();

  if (diffInMs < 0) {
    return "Recently";
  }

  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  if (diffInHours < 1) {
    return "Just now";
  }

  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours === 1 ? "" : "s"} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) {
    return "Yesterday";
  }

  return `${diffInDays} days ago`;
}

function toJobTypeLabel(value: string | null): string {
  if (!value) {
    return "—";
  }

  const normalized = value.replace(/[_-]/g, " ").trim();
  if (!normalized) {
    return "—";
  }

  return normalized
    .split(" ")
    .filter((part) => part.length > 0)
    .map((part) => `${part[0]?.toUpperCase() ?? ""}${part.slice(1).toLowerCase()}`)
    .join(" ");
}

export default async function JobDetailsPage({ params }: JobDetailsPageProps) {
  const insforge = await createInsforgeServer();
  const {
    data: { user },
  } = await insforge.auth.getCurrentUser();

  if (!user) {
    notFound();
  }

  const { id } = await params;

  const { data, error } = await insforge.database
    .from("jobs")
    .select(
      "id, title, company, salary, location, job_type, found_at, about_role, match_score, match_reason, matched_skills, missing_skills, external_apply_url",
    )
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !data) {
    notFound();
  }

  const job: JobDetailsRow = {
    id: data.id,
    title: data.title,
    company: data.company,
    salary: data.salary,
    location: data.location,
    job_type: data.job_type,
    found_at: data.found_at,
    about_role: data.about_role,
    match_score: data.match_score,
    match_reason: data.match_reason,
    matched_skills: data.matched_skills,
    missing_skills: data.missing_skills,
    external_apply_url: data.external_apply_url,
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar initialUser={user} />

      <main className="mx-auto flex w-full max-w-[1440px] flex-grow flex-col gap-6 px-6 pb-10 pt-24">
        <Link
          href="/find-jobs"
          className="inline-flex w-fit items-center gap-2 text-[16px] font-medium text-text-slate-medium transition-colors hover:text-text-primary"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Jobs</span>
        </Link>

        <section className="rounded-[16px] border border-border bg-surface p-6 shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl border border-border bg-surface-secondary text-text-secondary">
                <BriefcaseBusiness className="h-9 w-9" />
              </div>

              <div className="space-y-1">
                <h1 className="text-[52px] font-bold leading-[1.05] text-text-darkest">{job.title ?? "Untitled role"}</h1>
                <div className="flex flex-wrap items-center gap-3 text-[16px] text-text-slate-medium">
                  <span>{job.company ?? "Unknown company"}</span>
                  <span aria-hidden="true">•</span>
                  <span className="inline-flex items-center rounded-full bg-success-lightest px-3 py-1 text-[14px] font-medium leading-none text-success-foreground">
                    {(job.match_score ?? 0).toFixed(0)}% Match Score
                  </span>
                </div>
              </div>
            </div>

            <a
              href={job.external_apply_url ?? "#"}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-border bg-surface px-5 text-[14px] font-medium text-text-darkest transition-colors hover:bg-surface-secondary"
            >
              <ArrowUpRight className="h-6 w-6" />
              <span>View Job Post</span>
            </a>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-[16px] border border-border bg-surface p-5 shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-success-lightest text-success">
                <CircleDollarSign className="h-8 w-8" />
              </div>
              <div>
                <p className="text-[14px] font-semibold text-text-darkest">{job.salary ?? "Not listed"}</p>
                <p className="text-[12px] uppercase tracking-[0.04em] text-text-muted">Salary Est.</p>
              </div>
            </div>
          </article>

          <article className="rounded-[16px] border border-border bg-surface p-5 shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-info-lightest text-info-medium">
                <MapPin className="h-8 w-8" />
              </div>
              <div>
                <p className="text-[14px] font-semibold text-text-darkest">{job.location ?? "Unknown"}</p>
                <p className="text-[12px] uppercase tracking-[0.04em] text-text-muted">Location</p>
              </div>
            </div>
          </article>

          <article className="rounded-[16px] border border-border bg-surface p-5 shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-muted text-accent">
                <BriefcaseBusiness className="h-8 w-8" />
              </div>
              <div>
                <p className="text-[14px] font-semibold text-text-darkest">{toJobTypeLabel(job.job_type)}</p>
                <p className="text-[12px] uppercase tracking-[0.04em] text-text-muted">Job Type</p>
              </div>
            </div>
          </article>

          <article className="rounded-[16px] border border-border bg-surface p-5 shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-secondary text-text-secondary">
                <CalendarDays className="h-8 w-8" />
              </div>
              <div>
                <p className="text-[14px] font-semibold text-text-darkest">{toRelativeDateLabel(job.found_at)}</p>
                <p className="text-[12px] uppercase tracking-[0.04em] text-text-muted">Date Found</p>
              </div>
            </div>
          </article>
        </section>

        <section className="rounded-[16px] border border-border bg-surface p-6 shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]">
          <header className="mb-4 flex items-center gap-3">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-success-lightest text-success">
              <Sparkles className="h-5 w-5" />
            </span>
            <h2 className="text-[16px] font-semibold uppercase tracking-[0.04em] text-text-slate-medium">AI Match Reasoning</h2>
          </header>
          <p className="text-[14px] leading-[1.5] text-text-darkest">{job.match_reason ?? "No match reasoning available yet."}</p>
        </section>

        <section className="rounded-[16px] border border-border bg-surface p-6 shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]">
          <h2 className="text-[16px] font-semibold uppercase tracking-[0.04em] text-text-slate-medium">Required Skills vs Your Profile</h2>

          <div className="mt-5">
            <p className="mb-3 text-[12px] text-text-secondary">You have</p>
            <div className="flex flex-wrap gap-3">
              {(job.matched_skills ?? []).length > 0 ? (
                (job.matched_skills ?? []).map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center rounded-full bg-success-lightest px-3 py-1 text-[12px] font-medium text-success-foreground"
                  >
                    ✓ {skill}
                  </span>
                ))
              ) : (
                <span className="text-[12px] text-text-secondary">No matched skills yet.</span>
              )}
            </div>
          </div>

          <div className="mt-6">
            <p className="mb-3 text-[12px] text-text-secondary">Gap skills</p>
            <div className="flex flex-wrap gap-3">
              {(job.missing_skills ?? []).length > 0 ? (
                (job.missing_skills ?? []).map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center rounded-full bg-accent-muted px-3 py-1 text-[12px] font-medium text-accent"
                  >
                    × {skill}
                  </span>
                ))
              ) : (
                <span className="text-[12px] text-text-secondary">No skill gaps detected.</span>
              )}
            </div>
          </div>
        </section>

        <section className="rounded-[16px] border border-border bg-surface p-6 shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]">
          <header className="mb-4 flex items-center gap-3">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-surface-secondary text-text-secondary">
              <BriefcaseBusiness className="h-5 w-5" />
            </span>
            <h2 className="text-[36px] font-semibold text-text-darkest">Job Description</h2>
          </header>

          <p className="text-[14px] leading-[1.5] text-text-darkest">{job.about_role ?? "No job description available."}</p>
        </section>

        <section className="overflow-hidden rounded-[16px] border border-border bg-surface shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]">
          <div className="flex flex-col gap-4 border-b border-border px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-accent-muted text-accent">
                <WandSparkles className="h-5 w-5" />
              </span>
              <h2 className="text-[36px] font-semibold text-text-darkest">Company Research</h2>
            </div>

            <button
              type="button"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-accent px-5 text-[14px] font-medium text-accent-foreground transition-opacity hover:opacity-90"
            >
              <Sparkles className="h-5 w-5" />
              <span>Research Company</span>
            </button>
          </div>

          <div className="flex min-h-[260px] flex-col items-center justify-center px-6 py-14 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-surface-secondary text-text-muted">
              <BriefcaseBusiness className="h-8 w-8" />
            </div>
            <p className="text-[36px] font-medium text-text-darkest">No research yet</p>
            <p className="mt-2 max-w-[680px] text-[14px] leading-[1.4] text-text-muted">
              Click “Research Company” to let the AI browse {job.company ?? "this company"}'s public pages and build a dossier.
            </p>
          </div>
        </section>

        <a
          href={job.external_apply_url ?? "#"}
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-14 items-center justify-center rounded-xl bg-accent px-8 text-[16px] font-medium text-accent-foreground transition-opacity hover:opacity-90"
        >
          Apply Now at {job.company ?? "Company"}
        </a>
      </main>

      <Footer />
    </div>
  );
}
