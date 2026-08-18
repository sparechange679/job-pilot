import { createAuthActions } from "@insforge/sdk/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { createInsforgeServer } from "@/lib/insforge-server";
import { createPostHogServer } from "@/lib/posthog-server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("insforge_code");
  const next = requestUrl.searchParams.get("next") ?? "/dashboard";

  if (code) {
    const response = NextResponse.redirect(new URL(next, requestUrl.origin));
    const auth = createAuthActions({
      baseUrl: process.env.NEXT_PUBLIC_INSFORGE_URL!,
      anonKey: process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY!,
      requestCookies: request.cookies,
      responseCookies: response.cookies,
    });

    const codeVerifier = request.cookies.get("insforge_pkce_verifier")?.value;
    const { data, error } = await auth.exchangeOAuthCode(code, codeVerifier);

    if (!error && data?.user) {
      response.cookies.set("insforge_pkce_verifier", "", { path: "/", maxAge: 0 });

      const posthog = createPostHogServer();
      if (posthog) {
        posthog.capture({
          distinctId: data.user.id,
          event: "user_signed_in",
          properties: {
            signup_method: "oauth",
          },
        });
        await posthog.shutdown();
      }
      
      // Ensure profile exists in database
      try {
        const insforge = await createInsforgeServer();
        const { data: profile } = await insforge.database
          .from("profiles")
          .select("id")
          .eq("id", data.user.id)
          .single();

        if (!profile) {
          // Create initial profile
          await insforge.database.from("profiles").insert([{
            id: data.user.id,
            email: data.user.email,
            full_name: data.user.profile?.name || data.user.email?.split('@')[0] || 'User',
            is_complete: false
          }]);
        }
      } catch (dbError) {
        console.error("Error ensuring user profile:", dbError);
        // We still continue as the auth session is valid
      }

      return response;
    }
    
    console.error("OAuth exchange error:", error);
  }

  // return the user to an error page with some instructions
  return NextResponse.redirect(new URL("/login?error=auth-failed", requestUrl.origin));
}
