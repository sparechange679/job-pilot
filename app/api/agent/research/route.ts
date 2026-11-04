import { NextResponse } from "next/server";
import { z } from "zod";

import { researchCompany } from "@/agent/research";
import { createInsforgeServer } from "@/lib/insforge-server";
import { createPostHogServer } from "@/lib/posthog-server";

export const runtime = "nodejs";

const requestSchema = z.object({ jobId: z.string().uuid(), retry: z.boolean().optional() });
const running = new Set<string>();

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const parsed = requestSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "Invalid research request." }, { status: 400 });
    }

    const insforge = await createInsforgeServer();
    const { data: { user } } = await insforge.auth.getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Sign in to research a company." }, { status: 401 });
    }

    const { jobId, retry } = parsed.data;
    const { data: job, error: jobError } = await insforge.database.from("jobs")
      .select("id, user_id, title, company, about_role, about_company, matched_skills, missing_skills, external_apply_url, company_research")
      .eq("id", jobId).eq("user_id", user.id).single();
    if (jobError || !job) {
      return NextResponse.json({ success: false, error: "Job not found." }, { status: 404 });
    }
    if (job.company_research && !retry) {
      return NextResponse.json({ success: false, error: "Research already exists. Choose retry to replace it." }, { status: 409 });
    }

    const lockKey = `${user.id}:${jobId}`;
    if (running.has(lockKey)) {
      return NextResponse.json({ success: false, error: "Research is already running for this job." }, { status: 409 });
    }
    running.add(lockKey);
    try {
      const { data: profile, error: profileError } = await insforge.database.from("profiles")
        .select("current_title, years_experience, experience_level, skills, work_experience")
        .eq("id", user.id).single();
      if (profileError || !profile) {
        return NextResponse.json({ success: false, error: "Complete your profile before researching a company." }, { status: 400 });
      }

      const dossier = await researchCompany(job, profile);
      const { data: saved, error: saveError } = await insforge.database.from("jobs")
        .update({ company_research: dossier }).eq("id", jobId).eq("user_id", user.id)
        .select("id").single();
      if (saveError || !saved) throw new Error("Unable to persist company research");

      const posthog = createPostHogServer();
      if (posthog) {
        try {
          posthog.capture({ distinctId: user.id, event: "company_researched", properties: { userId: user.id, jobId, company: job.company } });
          await posthog.shutdown();
        } catch (error) {
          console.error("[agent/research] Event delivery failed", error);
        }
      }
      return NextResponse.json({ success: true, data: dossier });
    } finally {
      running.delete(lockKey);
    }
  } catch (error) {
    console.error("[agent/research] Research failed", error);
    return NextResponse.json({ success: false, error: "Company research could not be completed. Please try again." }, { status: 500 });
  }
}