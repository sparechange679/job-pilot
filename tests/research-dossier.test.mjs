import assert from "node:assert/strict";
import { test } from "node:test";

import { dossierSchema } from "../lib/research-dossier.ts";

const dossier = {
  companyOverview: "Builds payment tools.",
  techStack: ["TypeScript"],
  culture: ["Distributed teams"],
  whyThisRole: "To expand the platform.",
  yourEdge: ["Experience with APIs"],
  gapsToAddress: ["Be transparent about infrastructure experience"],
  smartQuestions: ["How do teams share ownership?"],
  interviewPrep: ["Review API design"],
  sources: ["https://company.example.org/about"],
};

test("accepts a complete nine-field dossier", () => {
  assert.equal(dossierSchema.parse(dossier).companyOverview, dossier.companyOverview);
});

test("rejects missing sections, invalid sources and empty narrative fields", () => {
  const { smartQuestions, ...missing } = dossier;
  assert.equal(dossierSchema.safeParse(missing).success, false);
  assert.equal(dossierSchema.safeParse({ ...dossier, sources: ["javascript:alert(1)"] }).success, false);
  assert.equal(dossierSchema.safeParse({ ...dossier, companyOverview: "" }).success, false);
  assert.deepEqual(smartQuestions, dossier.smartQuestions);
});