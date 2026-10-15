import OpenAI from "openai";
import { PDFParse } from "pdf-parse";
import { NextResponse } from "next/server";
import { createInsforgeServer } from "@/lib/insforge-server";

export const runtime = "nodejs";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const extractionSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    full_name: { type: "string" },
    email: { type: "string" },
    phone: { type: "string" },
    location: { type: "string" },
    linkedin_url: { type: "string" },
    portfolio_url: { type: "string" },
    work_authorization: {
      type: "string",
      enum: ["Citizen", "Green Card", "Visa", ""]
    },
    current_title: { type: "string" },
    experience_level: {
      type: "string",
      enum: ["Junior", "Mid-level", "Senior", "Lead", ""]
    },
    years_experience: { type: "string" },
    skills: {
      type: "array",
      items: { type: "string" }
    },
    industries: {
      type: "array",
      items: { type: "string" }
    },
    work_experience: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          company: { type: "string" },
          title: { type: "string" },
          start_date: { type: "string" },
          end_date: { type: "string" },
          currently_working: { type: "boolean" },
          responsibilities: { type: "string" }
        },
        required: ["company", "title", "start_date", "end_date", "currently_working", "responsibilities"]
      }
    },
    education: {
      type: "object",
      additionalProperties: false,
      properties: {
        degree: { type: "string" },
        field: { type: "string" },
        institution: { type: "string" },
        graduation_year: { type: "string" }
      },
      required: ["degree", "field", "institution", "graduation_year"]
    },
    job_titles_seeking: {
      type: "array",
      items: { type: "string" }
    },
    remote_preference: {
      type: "string",
      enum: ["Remote", "Hybrid", "On-site", "Any", ""]
    },
    salary_expectation: { type: "string" },
    preferred_locations: {
      type: "array",
      items: { type: "string" }
    }
  },
  required: [
    "full_name",
    "email",
    "phone",
    "location",
    "linkedin_url",
    "portfolio_url",
    "work_authorization",
    "current_title",
    "experience_level",
    "years_experience",
    "skills",
    "industries",
    "work_experience",
    "education",
    "job_titles_seeking",
    "remote_preference",
    "salary_expectation",
    "preferred_locations"
  ]
};

export async function POST(request: Request) {
  try {
    const insforge = await createInsforgeServer();
    const {
      data: { user }
    } = await insforge.auth.getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "OPENAI_API_KEY is not configured." }, { status: 500 });
    }

    const formData = await request.formData();
    const file = formData.get("resume");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Please upload a valid PDF file." }, { status: 400 });
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json({ error: "Please upload a valid PDF file." }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // pdf-parse v2: use the PDFParse class instead of a default-export function
    const parser = new PDFParse({ data: buffer });
    let extractedText = "";
    try {
      const pdfData = await parser.getText();
      extractedText = (pdfData.text ?? "").trim();
    } finally {
      await parser.destroy(); // free memory
    }

    if (extractedText.length < 50) {
      return NextResponse.json(
          { error: "Could not extract text from this PDF. Please try a different file." },
          { status: 400 }
      );
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "resume_profile_extraction",
          strict: true,
          schema: extractionSchema
        }
      },
      messages: [
        {
          role: "system",
          content:
              "Extract profile information from resume text. Return valid JSON that exactly matches the schema. Use empty strings or empty arrays when data is unknown."
        },
        {
          role: "user",
          content: extractedText
        }
      ]
    });

    const parsed = completion.choices[0]?.message?.content;
    if (!parsed) {
      return NextResponse.json({ error: "Could not extract profile details from resume." }, { status: 500 });
    }

    const profileData = JSON.parse(parsed);
    return NextResponse.json({ data: profileData });
  } catch (error) {
    console.error("Resume extraction failed:", error);
    return NextResponse.json({ error: "Failed to extract profile data from resume." }, { status: 500 });
  }
}