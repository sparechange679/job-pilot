'use server';

import { createInsforgeAuth } from "@/lib/insforge-server";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

const h = await headers();
const origin =
  process.env.NEXT_PUBLIC_APP_URL ??
  `${h.get("x-forwarded-proto") ?? "https"}://${h.get("host")}`;

export async function signInWithOAuth(provider: 'google' | 'github') {
  const auth = await createInsforgeAuth();
  const { data, error } = await auth.signInWithOAuth(provider, {
    redirectTo: `${origin}/api/auth/callback`,
    skipBrowserRedirect: true,
  });

  if (error) return { error: error.message };
  
  if (data?.url) {
    if (data.codeVerifier) {
      const cookieStore = await cookies();
      cookieStore.set("insforge_pkce_verifier", data.codeVerifier, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 10, // 10 minutes
      });
    }
    redirect(data.url);
  }
  
  return { error: "No redirect URL returned" };
}

export async function signOut() {
  const auth = await createInsforgeAuth();
  await auth.signOut();
  redirect("/");
}
