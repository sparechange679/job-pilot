"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { BriefcaseBusiness, ChevronDown, Loader2, Search, Sparkles } from "lucide-react";

export type JobRow = {
  id: string;
  company: string;
  role: string;
  matchScore: number;
  salary: string;
  source: "Search" | "URL";
  dateFound: string;
};

type Props = {
  initialJobs: JobRow[];
  totalResults: number;
  page: number;
  pageSize: number;
  matchFilter: "all" | "high" | "low";
  sortOption: "score" | "newest" | "oldest";
  searchQuery: string;
};

type SearchResponse = {
  message?: string;
  error?: string;
};

function getScoreColor(score: number): string {
  if (score >= 80) {
    return "bg-success";
  }

  if (score >= 60) {
    return "bg-info-medium";
  }

  return "bg-warning";
}

function getSourceBadgeClass(source: JobRow["source"]): string {
  if (source === "URL") {
    return "bg-info-lightest text-info-foreground border-info-light";
  }

  return "bg-accent-muted text-accent-dark border-accent-light";
}

export function FindJobsClient({ initialJobs, totalResults, page, pageSize, matchFilter, sortOption, searchQuery }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [jobTitle, setJobTitle] = useState("Frontend Engineer");
  const [location, setLocation] = useState("Remote, New York");
  const [isSearching, setIsSearching] = useState(false);
  const [bannerMessage, setBannerMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [filterQuery, setFilterQuery] = useState(searchQuery);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(totalResults / pageSize)), [pageSize, totalResults]);
  const currentPage = Math.min(Math.max(page, 1), totalPages);
  const startResult = totalResults === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endResult = totalResults === 0 ? 0 : Math.min((currentPage - 1) * pageSize + initialJobs.length, totalResults);

  const updateQueryParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());

    for (const [key, value] of Object.entries(updates)) {
      if (!value) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    }

    const queryString = params.toString();
    router.push(queryString ? `${pathname}?${queryString}` : pathname);
  };

  const handleFilterQuerySubmit = () => {
    const trimmedQuery = filterQuery.trim();
    updateQueryParams({ q: trimmedQuery || null, page: "1" });
  };

  const handlePageChange = (nextPage: number) => {
    if (nextPage < 1 || nextPage > totalPages || nextPage === currentPage) {
      return;
    }

    updateQueryParams({ page: String(nextPage) });
  };

  const handleSearch = async () => {
    const trimmedTitle = jobTitle.trim();
    if (!trimmedTitle) {
      setErrorMessage("Please enter a job title before searching.");
      setBannerMessage(null);
      return;
    }

    setIsSearching(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/agent/find", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobTitle: trimmedTitle,
          location: location.trim(),
        }),
      });

      const payload = (await response.json()) as SearchResponse;
      if (!response.ok) {
        setBannerMessage(null);
        setErrorMessage(payload.error ?? "Job discovery failed. Please try again.");
        return;
      }

      setBannerMessage(payload.message ?? "Job discovery completed.");
      setErrorMessage(null);
      router.refresh();
    } catch {
      setBannerMessage(null);
      setErrorMessage("Job discovery failed. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <>
      <section className="rounded-[16px] border border-border bg-surface p-6 shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1fr_auto] lg:items-end">
          <div className="flex flex-col gap-2">
            <label className="text-[12px] font-medium tracking-[0.08em] text-text-secondary">JOB TITLE</label>
            <div className="flex h-14 items-center gap-3 rounded-xl border border-border bg-surface px-4 text-text-muted shadow-[0px_1px_2px_rgba(0,0,0,0.05)]">
              <Search className="h-5 w-5" />
              <input
                value={jobTitle}
                onChange={(event) => setJobTitle(event.target.value)}
                placeholder="Frontend Engineer"
                className="w-full bg-transparent text-[14px] leading-5 text-text-primary placeholder:text-text-muted outline-none"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[12px] font-medium tracking-[0.08em] text-text-secondary">LOCATION</label>
            <div className="flex h-14 items-center rounded-xl border border-border bg-surface px-4 text-[14px] text-text-muted shadow-[0px_1px_2px_rgba(0,0,0,0.05)]">
              <input
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                placeholder="Remote, New York..."
                className="w-full bg-transparent text-[14px] leading-5 text-text-primary placeholder:text-text-muted outline-none"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleSearch}
            disabled={isSearching}
            className="flex h-14 items-center justify-center gap-2 rounded-xl bg-accent px-8 text-[16px] font-medium text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-70"
          >
            {isSearching ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
            <span>{isSearching ? "Searching..." : "Find Jobs"}</span>
          </button>
        </div>

        {bannerMessage ? (
          <div className="mt-5 flex items-center gap-2 rounded-xl border border-success-light bg-success-lightest px-4 py-4 text-success-foreground">
            <Sparkles className="h-5 w-5" />
            <span className="text-[14px] font-medium">{bannerMessage}</span>
          </div>
        ) : null}

        {errorMessage ? (
          <div className="mt-5 rounded-xl border border-error bg-surface px-4 py-4 text-[14px] font-medium text-error">
            {errorMessage}
          </div>
        ) : null}
      </section>

      <section className="rounded-[16px] border border-border bg-surface shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]">
        <div className="border-b border-border px-6 py-3">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex h-12 w-full items-center gap-2 rounded-lg border border-border bg-surface px-4 text-text-muted lg:max-w-[760px]">
              <Search className="h-5 w-5" />
              <input
                value={filterQuery}
                onChange={(event) => setFilterQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    handleFilterQuerySubmit();
                  }
                }}
                placeholder="Filter by company or role..."
                className="w-full bg-transparent text-[14px] text-text-primary placeholder:text-text-muted outline-none"
              />
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <button
                type="button"
                onClick={handleFilterQuerySubmit}
                className="flex h-12 items-center rounded-xl border border-border bg-surface px-4 text-[14px] font-medium text-text-primary hover:bg-surface-secondary transition-colors"
              >
                Apply
              </button>
              <button
                type="button"
                onClick={() => updateQueryParams({ match: null, page: "1" })}
                className={`flex h-12 items-center gap-2 rounded-xl border px-4 text-[14px] transition-colors ${
                  matchFilter === "all"
                    ? "border-accent bg-accent-muted text-accent-dark"
                    : "border-border bg-surface text-text-primary hover:bg-surface-secondary"
                }`}
              >
                <span>All Matches</span>
              </button>
              <button
                type="button"
                onClick={() => updateQueryParams({ match: "high", page: "1" })}
                className={`flex h-12 items-center gap-2 rounded-xl border px-4 text-[14px] transition-colors ${
                  matchFilter === "high"
                    ? "border-accent bg-accent-muted text-accent-dark"
                    : "border-border bg-surface text-text-primary hover:bg-surface-secondary"
                }`}
              >
                <span>High Match</span>
              </button>
              <button
                type="button"
                onClick={() => updateQueryParams({ match: "low", page: "1" })}
                className={`flex h-12 items-center gap-2 rounded-xl border px-4 text-[14px] transition-colors ${
                  matchFilter === "low"
                    ? "border-accent bg-accent-muted text-accent-dark"
                    : "border-border bg-surface text-text-primary hover:bg-surface-secondary"
                }`}
              >
                <span>Low Match</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  updateQueryParams({
                    sort: sortOption === "newest" ? "oldest" : sortOption === "oldest" ? "score" : "newest",
                    page: "1",
                  })
                }
                className="flex h-12 items-center gap-2 rounded-xl border border-border bg-surface px-4 text-[14px] text-text-primary"
              >
                <span>
                  {sortOption === "newest" ? "Newest" : sortOption === "oldest" ? "Oldest" : "Match Score"}
                </span>
                <ChevronDown className="h-4 w-4 text-text-secondary" />
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="px-8 py-5 text-left text-[12px] font-medium tracking-[0.08em] text-text-secondary">COMPANY</th>
                <th className="px-4 py-5 text-left text-[12px] font-medium tracking-[0.08em] text-text-secondary">ROLE</th>
                <th className="px-4 py-5 text-left text-[12px] font-medium tracking-[0.08em] text-text-secondary">MATCH SCORE</th>
                <th className="px-4 py-5 text-left text-[12px] font-medium tracking-[0.08em] text-text-secondary">SALARY EST.</th>
                <th className="px-4 py-5 text-left text-[12px] font-medium tracking-[0.08em] text-text-secondary">SOURCE</th>
                <th className="px-4 py-5 text-left text-[12px] font-medium tracking-[0.08em] text-text-secondary">DATE FOUND</th>
              </tr>
            </thead>

            <tbody>
              {initialJobs.map((job) => (
                <tr
                  key={job.id}
                  onClick={() => router.push(`/find-jobs/${job.id}`)}
                  className="cursor-pointer border-b border-border last:border-b-0 hover:bg-surface-secondary"
                >
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-[12px] border border-border bg-surface-secondary text-text-secondary">
                        <BriefcaseBusiness className="h-5 w-5" />
                      </div>
                      <span className="text-[14px] font-semibold text-text-primary">{job.company}</span>
                    </div>
                  </td>
                  <td className="px-4 py-6 text-[14px] text-text-darkest">{job.role}</td>
                  <td className="px-4 py-6">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-32 rounded-full bg-border">
                        <div className={`h-2 rounded-full ${getScoreColor(job.matchScore)}`} style={{ width: `${job.matchScore}%` }} />
                      </div>
                      <span className="text-[14px] font-semibold text-text-darkest">{job.matchScore}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-6 text-[14px] text-text-darkest">{job.salary}</td>
                  <td className="px-4 py-6">
                    <span
                      className={`inline-flex items-center rounded-full border px-3 py-1 text-[12px] font-medium ${getSourceBadgeClass(job.source)}`}
                    >
                      {job.source}
                    </span>
                  </td>
                  <td className="px-4 py-6 text-[14px] text-text-secondary">{job.dateFound}</td>
                </tr>
              ))}

              {initialJobs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-[14px] text-text-secondary">
                    No jobs yet. Run a search to discover new opportunities.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 border-t border-border px-6 py-5 md:flex-row md:items-center md:justify-between">
          <p className="text-[16px] text-text-secondary">
            Showing <span className="font-semibold text-text-primary">{startResult}</span> to{" "}
            <span className="font-semibold text-text-primary">{endResult}</span> of{" "}
            <span className="font-semibold text-text-primary">{totalResults}</span> results
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className="rounded-xl border border-border bg-surface px-5 py-2 text-[16px] text-text-darkest disabled:text-text-muted"
            >
              Previous
            </button>

            <button className="h-12 min-w-12 rounded-xl border border-accent-light bg-accent-muted px-4 text-[16px] font-medium text-accent">
              {currentPage}
            </button>

            <button
              type="button"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="rounded-xl border border-border bg-surface px-5 py-2 text-[16px] text-text-darkest disabled:text-text-muted"
            >
              Next
            </button>
          </div>
        </div>
      </section>
    </>
  );
}