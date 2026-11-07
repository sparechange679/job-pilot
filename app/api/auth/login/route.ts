import {createAuthActions} from "@insforge/sdk/ssr";
import {NextResponse, type NextRequest} from "next/server";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
    const url = new URL(request.url);
    const provider = url.searchParams.get("provider");
    const origin = process.env.NEXT_PUBLIC_APP_URL ?? url.origin;

    if (provider !== "google" && provider !== "github") {
        return NextResponse.redirect(new URL("/login?error=invalid-provider", origin));
    }

    try {
        const scratch = NextResponse.next();
        const auth = createAuthActions({
            baseUrl: process.env.NEXT_PUBLIC_INSFORGE_URL!,
            anonKey: process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY!,
            requestCookies: request.cookies,
            responseCookies: scratch.cookies,
        });

        const {data, error} = await auth.signInWithOAuth(provider, {
            redirectTo: `${origin}/api/auth/callback`,
            skipBrowserRedirect: true,
        });

        if (error || !data?.url) {
            console.error("[auth/login] signInWithOAuth error:", error);
            return NextResponse.redirect(new URL("/login?error=auth-failed", origin));
        }

        const response = NextResponse.redirect(data.url);
        if (data.codeVerifier) {
            response.cookies.set("insforge_pkce_verifier", data.codeVerifier, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                path: "/",
                maxAge: 60 * 10,
            });
        }
        return response;
    } catch (error) {
        console.error("[auth/login] threw:", error);
        return NextResponse.redirect(new URL("/login?error=auth-failed", origin));
    }
}