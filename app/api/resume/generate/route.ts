import {
  Document,
  type DocumentProps,
  Font,
  Page,
  StyleSheet,
  Text,
  View,
  renderToBuffer,
} from "@react-pdf/renderer";
import { createElement, type ReactElement } from "react";
import { NextResponse } from "next/server";
import { createInsforgeServer } from "@/lib/insforge-server";
import { createPostHogServer } from "@/lib/posthog-server";

export const runtime = "nodejs";

const openrouterApiKey = process.env.OPENROUTER_API_KEY ?? process.env.OPENAI_API_KEY;
const openrouterBaseUrl = "https://openrouter.ai/api/v1";
const openrouterReferer = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
const openrouterTitle = "JobPilot";

Font.registerHyphenationCallback((word: string) => [word]);

const styles = StyleSheet.create({
  page: {
    backgroundColor: "white",
    color: "black",
    fontFamily: "Helvetica",
    fontSize: 10,
    lineHeight: 1.45,
    paddingTop: 32,
    paddingBottom: 32,
    paddingHorizontal: 36,
  },
  headerName: {
    fontSize: 18,
    fontWeight: 700,
    marginBottom: 4,
  },
  headerLine: {
    fontSize: 9,
    color: "gray",
    marginBottom: 10,
  },
  section: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: 700,
    marginBottom: 5,
    textTransform: "uppercase",
  },
  paragraph: {
    fontSize: 10,
    marginBottom: 4,
  },
  listItem: {
    fontSize: 10,
    marginBottom: 2,
  },
  roleHeader: {
    fontSize: 10,
    fontWeight: 700,
    marginBottom: 2,
  },
  roleMeta: {
    fontSize: 9,
    color: "gray",
    marginBottom: 3,
  },
  chips: {
    fontSize: 10,
  },
});

type ProfileRow = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  linkedin_url: string | null;
  portfolio_url: string | null;
  current_title: string | null;
  years_experience: string | null;
  skills: string[] | null;
  industries: string[] | null;
  work_experience:
    | Array<{
        company: string;
        title: string;
        start_date: string;
        end_date: string;
        currently_working: boolean;
        responsibilities: string;
      }>
    | null;
  education:
    | {
        degree: string;
        field: string;
        institution: string;
        graduation_year: string;
      }
    | null;
  job_titles_seeking: string[] | null;
  remote_preference: string | null;
};

type ResumeContent = {
  summary: string;
  skills: string[];
  experience: Array<{
    company: string;
    title: string;
    dates: string;
    bullets: string[];
  }>;
  education: string;
  target_roles: string;
};

const resumeSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    summary: { type: "string" },
    skills: {
      type: "array",
      items: { type: "string" },
    },
    experience: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          company: { type: "string" },
          title: { type: "string" },
          dates: { type: "string" },
          bullets: {
            type: "array",
            items: { type: "string" },
          },
        },
        required: ["company", "title", "dates", "bullets"],
      },
    },
    education: { type: "string" },
    target_roles: { type: "string" },
  },
  required: ["summary", "skills", "experience", "education", "target_roles"],
};

function toTrimmedString(value: string | null | undefined): string {
  return (value ?? "").trim();
}

function hasMinimumProfileData(profile: ProfileRow): boolean {
  const hasName = toTrimmedString(profile.full_name).length > 0;
  const hasTitle = toTrimmedString(profile.current_title).length > 0;
  const hasSkills = (profile.skills ?? []).filter((item) => item.trim().length > 0).length > 0;
  const hasExperience =
    (profile.work_experience ?? []).filter(
      (item) => item.company.trim().length > 0 || item.title.trim().length > 0 || item.responsibilities.trim().length > 0,
    ).length > 0;

  return hasName && (hasTitle || hasSkills || hasExperience);
}

function sanitizeResumeContent(content: ResumeContent): ResumeContent {
  return {
    summary: toTrimmedString(content.summary),
    skills: (content.skills ?? []).map((skill) => toTrimmedString(skill)).filter(Boolean),
    experience: (content.experience ?? []).map((item) => ({
      company: toTrimmedString(item.company),
      title: toTrimmedString(item.title),
      dates: toTrimmedString(item.dates),
      bullets: (item.bullets ?? []).map((bullet) => toTrimmedString(bullet)).filter(Boolean),
    })),
    education: toTrimmedString(content.education),
    target_roles: toTrimmedString(content.target_roles),
  };
}

function buildProfilePrompt(profile: ProfileRow): string {
  return JSON.stringify(
    {
      full_name: profile.full_name,
      email: profile.email,
      phone: profile.phone,
      location: profile.location,
      linkedin_url: profile.linkedin_url,
      portfolio_url: profile.portfolio_url,
      current_title: profile.current_title,
      years_experience: profile.years_experience,
      skills: profile.skills ?? [],
      industries: profile.industries ?? [],
      work_experience: profile.work_experience ?? [],
      education: profile.education,
      job_titles_seeking: profile.job_titles_seeking ?? [],
      remote_preference: profile.remote_preference,
    },
    null,
    2,
  );
}

async function capturePosthogEvent(
  distinctId: string,
  event: string,
  properties: Record<string, string | number | boolean | null>,
) {
  const posthog = createPostHogServer();
  if (!posthog) {
    return;
  }

  posthog.capture({
    distinctId,
    event,
    properties,
  });

  await posthog.shutdown();
}

async function generateResumeWithAI(profile: ProfileRow): Promise<ResumeContent> {
  const response = await fetch(`${openrouterBaseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${openrouterApiKey}`,
      "HTTP-Referer": openrouterReferer,
      "X-Title": openrouterTitle,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "openai/gpt-4o-mini",
      temperature: 0,
      max_tokens: 3500,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "resume_generation",
          strict: true,
          schema: resumeSchema,
        },
      },
      messages: [
        {
          role: "system",
          content:
            "You are a senior resume writer. Produce concise, ATS-friendly content with specific achievements where possible. Keep language professional and direct.",
        },
        {
          role: "user",
          content: `Create polished resume content from this profile:\n\n${buildProfilePrompt(profile)}`,
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`OpenRouter request failed with ${response.status}: ${errorBody}`);
  }

  const completion = (await response.json()) as {
    choices?: Array<{ message?: { content?: string | null } }>;
  };

  const parsed = completion.choices?.[0]?.message?.content;
  if (!parsed) {
    throw new Error("AI response did not include resume content.");
  }

  const content = JSON.parse(parsed) as ResumeContent;
  return sanitizeResumeContent(content);
}

function ResumePdf({ profile, content }: { profile: ProfileRow; content: ResumeContent }) {
  const headerParts = [
    toTrimmedString(profile.email),
    toTrimmedString(profile.phone),
    toTrimmedString(profile.location),
    toTrimmedString(profile.linkedin_url),
    toTrimmedString(profile.portfolio_url),
  ].filter(Boolean);

  const skillSection =
    content.skills.length > 0
      ? createElement(
          View,
          { style: styles.section },
          createElement(Text, { style: styles.sectionTitle }, "Core Skills"),
          createElement(Text, { style: styles.chips }, content.skills.join(" • ")),
        )
      : null;

  const experienceSection =
    content.experience.length > 0
      ? createElement(
          View,
          { style: styles.section },
          createElement(Text, { style: styles.sectionTitle }, "Professional Experience"),
          ...content.experience.map((item, index) =>
            createElement(
              View,
              { key: `${item.company}-${item.title}-${index}` },
              createElement(
                Text,
                { style: styles.roleHeader },
                `${item.title || "Role"}${item.company ? ` — ${item.company}` : ""}`,
              ),
              item.dates ? createElement(Text, { style: styles.roleMeta }, item.dates) : null,
              ...item.bullets.slice(0, 4).map((bullet, bulletIndex) =>
                createElement(Text, { key: `${index}-${bulletIndex}`, style: styles.listItem }, `• ${bullet}`),
              ),
            ),
          ),
        )
      : null;

  const educationSection = content.education
    ? createElement(
        View,
        { style: styles.section },
        createElement(Text, { style: styles.sectionTitle }, "Education"),
        createElement(Text, { style: styles.paragraph }, content.education),
      )
    : null;

  const targetRolesSection = content.target_roles
    ? createElement(
        View,
        { style: styles.section },
        createElement(Text, { style: styles.sectionTitle }, "Target Roles"),
        createElement(Text, { style: styles.paragraph }, content.target_roles),
      )
    : null;

  return createElement(
    Document,
    null,
    createElement(
      Page,
      { size: "A4", style: styles.page },
      createElement(Text, { style: styles.headerName }, toTrimmedString(profile.full_name) || "Candidate"),
      headerParts.length > 0 ? createElement(Text, { style: styles.headerLine }, headerParts.join(" • ")) : null,
      createElement(
        View,
        { style: styles.section },
        createElement(Text, { style: styles.sectionTitle }, "Professional Summary"),
        createElement(Text, { style: styles.paragraph }, content.summary),
      ),
      skillSection,
      experienceSection,
      educationSection,
      targetRolesSection,
    ),
  );
}

export async function POST() {
  try {
    const insforge = await createInsforgeServer();
    const {
      data: { user },
    } = await insforge.auth.getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!openrouterApiKey) {
      return NextResponse.json(
        { error: "OpenRouter API key is not configured. Please contact support." },
        { status: 500 },
      );
    }

    await capturePosthogEvent(user.id, "resume_pdf_generation_started", {
      source: "profile",
    });
    console.info("[resume/generate] started", { userId: user.id });

    const { data: profile, error: profileError } = await insforge.database
      .from("profiles")
      .select(
        "id, full_name, email, phone, location, linkedin_url, portfolio_url, current_title, years_experience, skills, industries, work_experience, education, job_titles_seeking, remote_preference",
      )
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      throw new Error("Could not load your profile. Please save your profile and try again.");
    }

    if (!hasMinimumProfileData(profile as ProfileRow)) {
      return NextResponse.json(
        {
          error:
            "Your profile needs more information before generating a resume. Add your name and at least one of: current title, skills, or work experience.",
        },
        { status: 400 },
      );
    }

    console.info("[resume/generate] profile_loaded", { userId: user.id });
    const resumeContent = await generateResumeWithAI(profile as ProfileRow);
    console.info("[resume/generate] ai_content_generated", { userId: user.id });

    const pdfBuffer = await renderToBuffer(
      createElement(ResumePdf, { profile: profile as ProfileRow, content: resumeContent }) as ReactElement<DocumentProps>,
    );
    console.info("[resume/generate] pdf_rendered", { userId: user.id, size: pdfBuffer.length });

    const filePath = `resumes/${user.id}/resume.pdf`;
    const pdfBlob = new Blob([Uint8Array.from(pdfBuffer)], { type: "application/pdf" });
    const { error: uploadError } = await insforge.storage.from("resumes").upload(filePath, pdfBlob);

    if (uploadError) {
      throw uploadError;
    }

    const { data: publicUrlData } = insforge.storage.from("resumes").getPublicUrl(filePath);
    const publicUrl = publicUrlData?.publicUrl;

    if (!publicUrl) {
      throw new Error("Could not create resume URL after upload.");
    }

    const { error: updateError } = await insforge.database
      .from("profiles")
      .update({ resume_pdf_url: publicUrl, updated_at: new Date().toISOString() })
      .eq("id", user.id);

    if (updateError) {
      throw updateError;
    }

    console.info("[resume/generate] completed", { userId: user.id });
    await capturePosthogEvent(user.id, "resume_pdf_generation_succeeded", {
      source: "profile",
    });

    return NextResponse.json({ resume_pdf_url: publicUrl });
  } catch (error) {
    console.error("[resume/generate] failed", error);
    try {
      const insforge = await createInsforgeServer();
      const {
        data: { user },
      } = await insforge.auth.getCurrentUser();
      if (user) {
        await capturePosthogEvent(user.id, "resume_pdf_generation_failed", {
          source: "profile",
        });
      }
    } catch {
      // no-op
    }

    const message =
      error instanceof Error ? error.message : "Failed to generate your resume right now. Please try again.";

    return NextResponse.json(
      {
        error: message,
      },
      { status: 500 },
    );
  }
}