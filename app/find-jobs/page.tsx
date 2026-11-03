import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { createInsforgeServer } from "@/lib/insforge-server";
import { FindJobsClient, type JobRow } from "./FindJobsClient";

const JOBS_PER_PAGE = 20;

type MatchFilter = "all" | "high" | "low";
type SortOption = "score" | "newest" | "oldest";

type PageProps = {
  searchParams: Promise<{
    page?: string;
    match?: string;
    sort?: string;
    q?: string;
  }>;
};

type JobsTableRow = {
  id: string;
  title: string | null;
  company: string | null;
  salary: string | null;
  source: string | null;
  match_score: number | null;
  found_at: string | null;
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

export default async function FindJobsPage({ searchParams }: PageProps) {
  const insforge = await createInsforgeServer();
  const {
    data: { user },
  } = await insforge.auth.getCurrentUser();

  const resolvedSearchParams = await searchParams;
  const pageParam = Number.parseInt(resolvedSearchParams.page ?? "1", 10);
  const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;

  const matchFilter: MatchFilter =
    resolvedSearchParams.match === "high" || resolvedSearchParams.match === "low"
      ? resolvedSearchParams.match
      : "all";

  const sortOption: SortOption =
    resolvedSearchParams.sort === "newest" || resolvedSearchParams.sort === "oldest"
      ? resolvedSearchParams.sort
      : "score";

  const queryText = (resolvedSearchParams.q ?? "").trim();

  const initialJobs: JobRow[] = [];
  let totalResults = 0;

  if (user) {
    let jobsQuery = insforge.database
      .from("jobs")
      .select("id, title, company, salary, source, match_score, found_at", { count: "exact" })
      .eq("user_id", user.id);

    if (matchFilter === "high") {
      jobsQuery = jobsQuery.gte("match_score", 70);
    }

    if (matchFilter === "low") {
      jobsQuery = jobsQuery.lt("match_score", 70);
    }

    if (queryText) {
      const safeSearchText = queryText.replace(/,/g, " ");
      jobsQuery = jobsQuery.or(`company.ilike.%${safeSearchText}%,title.ilike.%${safeSearchText}%`);
    }

    if (sortOption === "newest") {
      jobsQuery = jobsQuery.order("found_at", { ascending: false });
    } else if (sortOption === "oldest") {
      jobsQuery = jobsQuery.order("found_at", { ascending: true });
    } else {
      jobsQuery = jobsQuery.order("match_score", { ascending: false }).order("found_at", { ascending: false });
    }

    const from = (page - 1) * JOBS_PER_PAGE;
    const to = from + JOBS_PER_PAGE - 1;

    const { data: rows, count } = await jobsQuery.range(from, to);

    totalResults = count ?? 0;

    const mappedRows = (rows ?? []) as JobsTableRow[];
    for (const row of mappedRows) {
      initialJobs.push({
        id: row.id,
        company: row.company ?? "Unknown",
        role: row.title ?? "Untitled role",
        matchScore: row.match_score ?? 0,
        salary: row.salary ?? "Not listed",
        source: row.source === "url" ? "URL" : "Search",
        dateFound: toRelativeDateLabel(row.found_at),
      });
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar initialUser={user} />
      <main className="mx-auto flex w-full max-w-[1440px] flex-grow flex-col gap-6 px-6 pt-24 pb-10">
        <FindJobsClient
          initialJobs={initialJobs}
          totalResults={totalResults}
          page={page}
          pageSize={JOBS_PER_PAGE}
          matchFilter={matchFilter}
          sortOption={sortOption}
          searchQuery={queryText}
        />
      </main>
      <Footer />
    </div>
  );
}
