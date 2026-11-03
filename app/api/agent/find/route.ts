import { NextResponse } from "next/server";
import { createInsforgeServer } from "@/lib/insforge-server";
import { createPostHogServer } from "@/lib/posthog-server";

export const runtime = "nodejs";

type AdzunaJob = {
  id: string;
  title: string;
  company?: { display_name?: string | null } | null;
  location?: { display_name?: string | null } | null;
  description?: string | null;
  redirect_url?: string | null;
  salary_min?: number | null;
  salary_max?: number | null;
  contract_type?: string | null;
};

type ProfileRow = {
  full_name: string | null;
  current_title: string | null;
  years_experience: string | null;
  skills: string[] | null;
  industries: string[] | null;
  job_titles_seeking: string[] | null;
  preferred_locations: string[] | null;
  remote_preference: string | null;
  salary_expectation: string | null;
};

type MatchResult = {
  matchScore: number;
  matchReason: string;
  matchedSkills: string[];
  missingSkills: string[];
};

const adzunaAppId = process.env.NEXT_PUBLIC_ADZUNA_APPLICATION_ID ?? process.env.ADZUNA_APP_ID;
const adzunaAppKey = process.env.NEXT_PUBLIC_ADZUNA_APPLICATION_KEY ?? process.env.ADZUNA_APP_KEY;
const openrouterApiKey = process.env.OPENROUTER_API_KEY ?? process.env.OPENAI_API_KEY;
const openrouterBaseUrl = "https://openrouter.ai/api/v1";
const openrouterReferer = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

function detectCountryFromLocation(location: string): "us" | "gb" | "au" | "ca" {
  const normalizedLocation = location.toLowerCase();

  if (
    normalizedLocation.includes("uk") ||
    normalizedLocation.includes("united kingdom") ||
    normalizedLocation.includes("england") ||
    normalizedLocation.includes("london")
  ) {
    return "gb";
  }

  if (
    normalizedLocation.includes("australia") ||
    normalizedLocation.includes("sydney") ||
    normalizedLocation.includes("melbourne")
  ) {
    return "au";
  }

  if (
    normalizedLocation.includes("canada") ||
    normalizedLocation.includes("toronto") ||
    normalizedLocation.includes("vancouver")
  ) {
    return "ca";
  }

  return "us";
}

function buildSalaryLabel(job: AdzunaJob): string | null {
  if (!job.salary_min || !job.salary_max) {
    return null;
  }

  return `$${Math.round(job.salary_min / 1000)}k - $${Math.round(job.salary_max / 1000)}k`;
}

function normalizeMatchResult(match: MatchResult): MatchResult {
  return {
    matchScore: Math.max(0, Math.min(100, Math.round(match.matchScore))),
    matchReason: match.matchReason?.trim() || "Potential fit based on your profile and this role.",
    matchedSkills: Array.isArray(match.matchedSkills) ? match.matchedSkills.filter(Boolean).slice(0, 10) : [],
    missingSkills: Array.isArray(match.missingSkills) ? match.missingSkills.filter(Boolean).slice(0, 10) : [],
  };
}

async function scoreJobAgainstProfile(job: AdzunaJob, profile: ProfileRow): Promise<MatchResult> {
  if (!openrouterApiKey) {
    return {
      matchScore: 60,
      matchReason: "Match scoring is temporarily running in fallback mode.",
      matchedSkills: [],
      missingSkills: [],
    };
  }

  const prompt = {
    profile,
    job: {
      title: job.title,
      company: job.company?.display_name ?? "Unknown",
      location: job.location?.display_name ?? "Unknown",
      description: job.description ?? "",
      contractType: job.contract_type ?? "fulltime",
      salaryMin: job.salary_min ?? null,
      salaryMax: job.salary_max ?? null,
    },
  };

  const response = await fetch(`${openrouterBaseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${openrouterApiKey}`,
      "HTTP-Referer": openrouterReferer,
      "X-Title": "JobPilot",
    },
    body: JSON.stringify({
      model: "openai/gpt-4o-mini",
      temperature: 0.1,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You are a job match evaluator. Return strict JSON with keys matchScore (0-100 integer), matchReason (single concise paragraph), matchedSkills (string[]), missingSkills (string[]).",
        },
        {
          role: "user",
          content: `Score this job against the profile: ${JSON.stringify(prompt)}`,
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`Scoring request failed with status ${response.status}`);
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string | null } | null }>;
  };
  const content = payload.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("Scoring response was empty.");
  }

  const parsed = JSON.parse(content) as MatchResult;
  return normalizeMatchResult(parsed);
}

async function searchAdzunaJobs(jobTitle: string, location: string): Promise<AdzunaJob[]> {
  if (!adzunaAppId || !adzunaAppKey) {
    throw new Error("Adzuna API credentials are not configured.");
  }

  const country = detectCountryFromLocation(location);
  const params = new URLSearchParams({
    app_id: adzunaAppId,
    app_key: adzunaAppKey,
    what: jobTitle,
    category: "it-jobs",
    results_per_page: "10",
    "content-type": "application/json",
  });

  if (location.trim()) {
    params.set("where", location.trim());
  }

  const response = await fetch(`https://api.adzuna.com/v1/api/jobs/${country}/search/1?${params}`);
  if (!response.ok) {
    throw new Error(`Adzuna API error: ${response.status}`);
  }

  const data = (await response.json()) as { results?: AdzunaJob[] };
  return data.results ?? [];
}

async function capturePosthogEvent(userId: string, event: string, properties: Record<string, unknown>): Promise<void> {
  const posthog = createPostHogServer();
  if (!posthog) {
    return;
  }

  try {
    posthog.capture({
      distinctId: userId,
      event,
      properties,
    });
    await posthog.shutdown();
  } catch {
    // no-op
  }
}

export async function POST(request: Request) {
  let runId: string | null = null;

  try {
    const body = (await request.json()) as { jobTitle?: string; location?: string };
    const jobTitle = body.jobTitle?.trim() ?? "";
    const location = body.location?.trim() ?? "";

    if (!jobTitle) {
      return NextResponse.json({ error: "Job title is required." }, { status: 400 });
    }

    const insforge = await createInsforgeServer();
    const {
      data: { user },
    } = await insforge.auth.getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: run, error: runError } = await insforge.database
      .from("agent_runs")
      .insert([
        {
          user_id: user.id,
          status: "running",
          job_title_searched: jobTitle,
          location_searched: location || null,
          jobs_found: 0,
          started_at: new Date().toISOString(),
        },
      ])
      .select("id")
      .single();

    if (runError || !run) {
      throw new Error("Could not start job discovery run.");
    }

    runId = run.id;
    await capturePosthogEvent(user.id, "job_search_started", {
      jobTitle,
      location,
      runId,
    });

    const { data: profile, error: profileError } = await insforge.database
      .from("profiles")
      .select(
        "full_name, current_title, years_experience, skills, industries, job_titles_seeking, preferred_locations, remote_preference, salary_expectation",
      )
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      throw new Error("Could not load profile for job matching.");
    }

    const adzunaJobs = await searchAdzunaJobs(jobTitle, location);
    const records = [] as Array<Record<string, unknown>>;

    for (const job of adzunaJobs) {
      const scored = await scoreJobAgainstProfile(job, profile as ProfileRow);

      records.push({
        run_id: runId,
        user_id: user.id,
        source: "search",
        source_url: job.redirect_url ?? "",
        external_apply_url: job.redirect_url ?? "",
        title: job.title,
        company: job.company?.display_name ?? "Unknown",
        location: job.location?.display_name ?? "Unknown",
        salary: buildSalaryLabel(job),
        job_type: job.contract_type ?? "fulltime",
        about_role: job.description ?? "",
        match_score: scored.matchScore,
        match_reason: scored.matchReason,
        matched_skills: scored.matchedSkills,
        missing_skills: scored.missingSkills,
        found_at: new Date().toISOString(),
      });

      await capturePosthogEvent(user.id, "job_found", {
        runId,
        company: job.company?.display_name ?? "Unknown",
        title: job.title,
        matchScore: scored.matchScore,
      });
    }

    if (records.length > 0) {
      const { error: insertError } = await insforge.database.from("jobs").insert(records);
      if (insertError) {
        throw insertError;
      }
    }

    const strongMatches = records.filter(
      (record) => typeof record.match_score === "number" && (record.match_score as number) >= 70,
    ).length;

    const { error: updateError } = await insforge.database
      .from("agent_runs")
      .update({
        status: "completed",
        jobs_found: records.length,
        completed_at: new Date().toISOString(),
      })
      .eq("id", runId);

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({
      jobsFound: records.length,
      strongMatches,
      message: `Found ${records.length} jobs and saved ${strongMatches} strong matches.`,
    });
  } catch (error) {
    if (runId) {
      try {
        const insforge = await createInsforgeServer();
        await insforge.database
          .from("agent_runs")
          .update({
            status: "failed",
            completed_at: new Date().toISOString(),
          })
          .eq("id", runId);
      } catch {
        // no-op
      }
    }

    const message = error instanceof Error ? error.message : "Failed to discover jobs right now.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}