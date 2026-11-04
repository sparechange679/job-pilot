"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { BriefcaseBusiness, Sparkles, WandSparkles } from "lucide-react";

import type { Dossier } from "@/lib/research-dossier";

type Props = { jobId: string; company: string; dossier: Dossier | null };

export function CompanyResearch({ jobId, company, dossier }: Props) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function runResearch(): Promise<void> {
    setPending(true);
    setError("");
    try {
      const response = await fetch("/api/agent/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId, retry: Boolean(dossier) }),
      });
      if (!response.ok) {
        const payload: { error?: string } = await response.json();
        throw new Error(payload.error ?? "Company research could not be completed.");
      }
      router.refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Company research could not be completed.");
    } finally {
      setPending(false);
    }
  }

  const lists = dossier ? [
    ["Culture", dossier.culture], ["Your Edge", dossier.yourEdge],
    ["Gaps to Address", dossier.gapsToAddress], ["Smart Questions", dossier.smartQuestions],
    ["Interview Prep", dossier.interviewPrep],
  ] as const : [];

  return (
    <section className="overflow-hidden rounded-[16px] border border-border bg-surface shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]">
      <div className="flex flex-col gap-4 border-b border-border px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-accent-muted text-accent"><WandSparkles className="h-5 w-5" /></span>
          <h2 className="text-[36px] font-semibold text-text-darkest">Company Research</h2>
        </div>
        <button type="button" onClick={runResearch} disabled={pending} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-accent px-5 text-[14px] font-medium text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-60">
          <Sparkles className="h-5 w-5" />{pending ? "Researching…" : dossier ? "Research Again" : "Research Company"}
        </button>
      </div>
      {error && <p role="alert" className="mx-6 mt-4 rounded-lg border border-error p-3 text-[14px] text-error">{error}</p>}
      {pending && <p role="status" className="px-6 pt-4 text-[14px] text-text-secondary">Researching {company}. This may take a minute.</p>}
      {!dossier ? (
        <div className="flex min-h-[260px] flex-col items-center justify-center px-6 py-14 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-surface-secondary text-text-muted"><BriefcaseBusiness className="h-8 w-8" /></div>
          <p className="text-[36px] font-medium text-text-darkest">No research yet</p>
          <p className="mt-2 max-w-[680px] text-[14px] leading-[1.4] text-text-muted">Click “Research Company” to build a dossier from {company}&apos;s public pages and the job posting.</p>
        </div>
      ) : (
        <div className="space-y-6 p-6 text-[14px] leading-[1.5] text-text-darkest">
          <div><h3 className="mb-2 text-[16px] font-semibold">Company Overview</h3><p>{dossier.companyOverview}</p></div>
          <div><h3 className="mb-2 text-[16px] font-semibold">Tech Stack</h3><div className="flex flex-wrap gap-2">{dossier.techStack.map((tech, index) => <span key={`${tech}-${index}`} className="rounded-full bg-accent-muted px-3 py-1 text-accent">{tech}</span>)}</div></div>
          <div><h3 className="mb-2 text-[16px] font-semibold">Why This Role</h3><p>{dossier.whyThisRole}</p></div>
          {lists.map(([label, items]) => <div key={label}><h3 className="mb-2 text-[16px] font-semibold">{label}</h3><ul className="list-disc space-y-1 pl-5">{items.map((item, index) => <li key={`${label}-${index}`}>{item}</li>)}</ul></div>)}
          <div><h3 className="mb-2 text-[16px] font-semibold">Sources</h3>{dossier.sources.length ? <ul className="space-y-1">{dossier.sources.map((url) => <li key={url}><a href={url} target="_blank" rel="noopener noreferrer" className="break-all text-accent underline underline-offset-2">{url}</a></li>)}</ul> : <p className="text-text-secondary">Based on the job posting and your profile; no company pages were available.</p>}</div>
        </div>
      )}
    </section>
  );
}