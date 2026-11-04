import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { createInsforgeServer } from "@/lib/insforge-server";

type Stat = {
  label: string;
  value: string;
  trend?: string;
  detail: string;
};

const stats: Stat[] = [
  { label: "Total Jobs Found", value: "284", trend: "+12%", detail: "vs last week" },
  { label: "Avg. Match Rate", value: "82%", trend: "+3%", detail: "vs last week" },
  { label: "Companies Researched", value: "38", detail: "Total researched" },
  { label: "Jobs This Week", value: "16", detail: "New this week" },
];

const scoreLabels = ["50-60%", "60-70%", "70-80%", "80-90%", "90-100%"];

type ActivityItem = {
  text: string;
  time: string;
  color: string;
  ring: string;
  timestamp: string;
};

function formatTimeAgo(timestamp: string) {
  const elapsedSeconds = Math.max(0, Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000));
  if (elapsedSeconds < 60) return "Just now";
  const minutes = Math.floor(elapsedSeconds / 60);
  if (minutes < 60) return `${minutes} min${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const daysAgo = Math.floor(hours / 24);
  if (daysAgo === 1) return "Yesterday";
  return `${daysAgo} days ago`;
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <section className={`rounded-2xl border border-border bg-surface p-6 shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] ${className}`}>{children}</section>;
}

function LineChart({ values, labels }: { values: number[]; labels: string[] }) {
  if (!values.length) return <p className="mt-6 text-sm text-text-muted">No job discoveries in the last 30 days.</p>;
  const max = Math.max(...values, 1);
  const points = values.map((value, index) => `${index * 100 / Math.max(values.length - 1, 1)},${100 - value / max * 80}`).join(" ");
  return <div className="relative h-64 pt-2"><div className="absolute inset-x-0 top-4 bottom-8 flex flex-col justify-between text-xs text-text-muted"><span>{max}</span><span>{Math.round(max * .75)}</span><span>{Math.round(max * .5)}</span><span>{Math.round(max * .25)}</span><span>0</span></div><svg viewBox="0 0 600 100" preserveAspectRatio="none" className="ml-10 h-52 w-[calc(100%-2.5rem)]"><defs><linearGradient id="chart-fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="var(--color-accent-light)" /><stop offset="100%" stopColor="var(--color-surface)" /></linearGradient></defs><polygon points={`0,100 ${points} 100,100`} fill="url(#chart-fill)" /><polyline points={points} fill="none" stroke="var(--color-accent)" strokeWidth="1.5" /></svg><div className="ml-10 flex justify-between text-xs text-text-muted">{labels.map((label) => <span key={label}>{label}</span>)}</div></div>;
}

function BarChart({ values, labels, color = "bg-success-alt" }: { values: number[]; labels: string[]; color?: string }) {
  if (!values.some(Boolean)) return <p className="mt-6 text-sm text-text-muted">No analytics data available yet.</p>;
  const max = Math.max(...values);
  return <div className="flex h-64 items-end gap-3 pt-6">{values.map((value, index) => <div className="flex h-full flex-1 flex-col items-center justify-end gap-2" key={labels[index]}><div className={`${color} w-full max-w-12 rounded-t-lg`} style={{ height: `${Math.max(8, value / max * 100)}%` }} /><span className="text-center text-xs text-text-muted">{labels[index]}</span></div>)}</div>;
}

export default async function DashboardPage() {
  const insforge = await createInsforgeServer();
  const { data: { user } } = await insforge.auth.getCurrentUser();

  let dashboardStats = stats;
  let recentActivity: ActivityItem[] = [];
  let jobsOverTime: number[] = [];
  let researchOverTime: number[] = [];
  const matchScores = [0, 0, 0, 0, 0];
  let chartLabels: string[] = [];
  if (user) {
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);
    const [jobsResult, researchedResult, weekResult] = await Promise.all([
      insforge.database.from("jobs").select("match_score", { count: "exact" }).eq("user_id", user.id),
      insforge.database.from("jobs").select("id", { count: "exact", head: true }).eq("user_id", user.id).not("company_research", "is", null),
      insforge.database.from("jobs").select("id", { count: "exact", head: true }).eq("user_id", user.id).gte("found_at", weekStart.toISOString()),
    ]);

    const jobs = (jobsResult.data ?? []) as Array<{ match_score: number | null }>;
    const scores = jobs
      .map((job) => job.match_score)
      .filter((score): score is number => typeof score === "number");
    const averageMatchRate = scores.length
      ? `${Math.round(scores.reduce((total, score) => total + score, 0) / scores.length)}%`
      : "—";

    dashboardStats = [
      { label: "Total Jobs Found", value: String(jobsResult.count ?? 0), detail: "All time" },
      { label: "Avg. Match Rate", value: averageMatchRate, detail: "Across all jobs" },
      { label: "Companies Researched", value: String(researchedResult.count ?? 0), detail: "Total researched" },
      { label: "Jobs This Week", value: String(weekResult.count ?? 0), detail: "New this week" },
    ];

    const now = new Date();
    chartLabels = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(now);
      date.setDate(now.getDate() - (6 - index));
      return date.toLocaleDateString("en-US", { weekday: "short" });
    });
    const chartDays = chartLabels.map((_, index) => {
      const date = new Date(now);
      date.setDate(now.getDate() - (6 - index));
      date.setHours(0, 0, 0, 0);
      return date.getTime();
    });
    const recentJobs = ((await insforge.database.from("jobs").select("found_at, match_score").eq("user_id", user.id).gte("found_at", new Date(now.getTime() - 30 * 86400000).toISOString())).data ?? []) as Array<{ found_at: string; match_score: number | null }>;
    jobsOverTime = chartDays.map((day) => recentJobs.filter((job) => {
      const time = new Date(job.found_at).getTime();
      return time >= day && time < day + 86400000;
    }).length);
    researchOverTime = chartDays.map(() => 0);
    const researchJobs = ((await insforge.database.from("jobs").select("found_at").eq("user_id", user.id).not("company_research", "is", null).gte("found_at", new Date(now.getTime() - 7 * 86400000).toISOString())).data ?? []) as Array<{ found_at: string }>;
    researchJobs.forEach((job) => {
      const index = chartDays.findIndex((day) => {
        const time = new Date(job.found_at).getTime();
        return time >= day && time < day + 86400000;
      });
      if (index >= 0) researchOverTime[index] += 1;
    });
    scores.forEach((score) => {
      const index = Math.min(4, Math.max(0, Math.floor((score - 50) / 10)));
      if (score >= 50) matchScores[index] += 1;
    });

    const [runsResult, researchResult] = await Promise.all([
      insforge.database.from("agent_runs").select("job_title_searched, jobs_found, completed_at").eq("user_id", user.id).eq("status", "completed").not("completed_at", "is", null).order("completed_at", { ascending: false }).limit(10),
      insforge.database.from("jobs").select("company, found_at").eq("user_id", user.id).not("company_research", "is", null).order("found_at", { ascending: false }).limit(10),
    ]);

    const runActivity = ((runsResult.data ?? []) as Array<{ job_title_searched: string | null; jobs_found: number | null; completed_at: string }>).map((run) => ({
      text: `Found ${run.jobs_found ?? 0} jobs for ${run.job_title_searched || "your search"}`,
      time: formatTimeAgo(run.completed_at), color: "bg-success-alt", ring: "bg-success-light", timestamp: run.completed_at,
    }));
    const researchActivityItems = ((researchResult.data ?? []) as Array<{ company: string | null; found_at: string }>).map((job) => ({
      text: `Researched ${job.company || "company"}`,
      time: formatTimeAgo(job.found_at), color: "bg-info", ring: "bg-info-light", timestamp: job.found_at,
    }));
    recentActivity = [...runActivity, ...researchActivityItems].sort((left, right) => new Date(right.timestamp).getTime() - new Date(left.timestamp).getTime()).slice(0, 5);
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar initialUser={user} />
      <main className="mx-auto w-full max-w-[1440px] flex-1 px-6 pb-16 pt-24">
        <div className="mb-6 flex items-end justify-between"><div><p className="mb-1 text-sm font-medium text-text-muted">Overview</p><h1 className="text-3xl font-semibold tracking-tight text-text-primary">Dashboard</h1></div><p className="text-sm text-text-secondary">Your job search at a glance</p></div>
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">{dashboardStats.map((stat) => <Card key={stat.label} className="min-h-48"><p className="text-sm font-medium text-text-secondary">{stat.label}</p><p className="mt-8 text-5xl font-semibold tracking-tight text-text-primary">{stat.value}</p><div className="mt-6 flex items-center gap-3 text-sm text-text-muted">{stat.trend && <span className="rounded bg-success-lightest px-2 py-1 font-medium text-success-darker">{stat.trend}</span>}<span>{stat.detail}</span></div></Card>)}</div>
        <div className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_1fr]"><Card><h2 className="text-xl font-semibold text-text-primary">Recent Activity</h2>{recentActivity.length > 0 ? <div className="mt-6 divide-y divide-border">{recentActivity.map((item) => <div className="flex items-center gap-4 py-4 first:pt-0 last:pb-0" key={`${item.timestamp}-${item.text}`}><span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${item.ring}`}><span className={`h-3 w-3 rounded-full ${item.color}`} /></span><div><p className="text-sm font-medium text-text-primary">{item.text}</p><p className="mt-1 text-sm text-text-muted">{item.time}</p></div></div>)}</div> : <p className="mt-6 text-sm text-text-muted">Your recent searches and research will appear here.</p>}</Card><Card><h2 className="text-xl font-semibold text-text-primary">Company Research Activity</h2><BarChart values={researchOverTime} labels={chartLabels} color="bg-info" /></Card></div>
        <div className="mt-6 grid gap-6 xl:grid-cols-2"><Card><h2 className="text-xl font-semibold text-text-primary">Jobs Found Over Time</h2><LineChart values={jobsOverTime} labels={chartLabels} /></Card><Card><h2 className="text-xl font-semibold text-text-primary">Match Score Distribution</h2><BarChart values={matchScores} labels={scoreLabels} /></Card></div>
      </main>
      <Footer />
    </div>
  );
}
