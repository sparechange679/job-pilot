import { z } from "zod";

export const dossierSchema = z.object({
  companyOverview: z.string().min(1),
  techStack: z.array(z.string()),
  culture: z.array(z.string()),
  whyThisRole: z.string().min(1),
  yourEdge: z.array(z.string()),
  gapsToAddress: z.array(z.string()),
  smartQuestions: z.array(z.string()),
  interviewPrep: z.array(z.string()),
  sources: z.array(z.url({ protocol: /^https$/ })),
});

export type Dossier = z.infer<typeof dossierSchema>;