import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { prisma } from "@/lib/prisma";
import { createSessionToken } from "@/lib/auth";
import { getRequestOrigin } from "@/lib/urls";

export async function GET(req: NextRequest) {
  const origin = getRequestOrigin(req);
  const { searchParams } = new URL(req.url);

  const code = searchParams.get("code");
  const next = searchParams.get("next");
  const errorParam = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  // Determine fallback route based on where user originated
  const errorBase = next === "/dashboard" ? `${origin}/login` : `${origin}/login`;

  // 1. Handle error returned by OAuth provider or Supabase
  if (errorParam) {
    console.error("OAuth error received in callback:", errorParam, errorDescription);
    const redirectUrl = new URL(errorBase);
    redirectUrl.searchParams.set("error", errorDescription || errorParam);
    return NextResponse.redirect(redirectUrl);
  }

  // 2. Check for missing code
  if (!code) {
    const redirectUrl = new URL(errorBase);
    redirectUrl.searchParams.set("error", "missing_code");
    return NextResponse.redirect(redirectUrl);
  }

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("Supabase environment variables missing in auth callback");
      const redirectUrl = new URL(errorBase);
      redirectUrl.searchParams.set("error", "oauth_unavailable");
      return NextResponse.redirect(redirectUrl);
    }

    const cookieStore = await cookies();
    const cookiesToSetLater: Array<{ name: string; value: string; options?: any }> = [];

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Handled if invoked from read-only context
          }
          cookiesToSetLater.push(...cookiesToSet);
        },
      },
    });

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error || !data?.user || !data.user.email) {
      console.error("OAuth code exchange error:", error, data?.user);
      const redirectUrl = new URL(errorBase);
      redirectUrl.searchParams.set("error", error?.message || "oauth_failed");
      return NextResponse.redirect(redirectUrl);
    }

    const email = data.user.email.toLowerCase().trim();
    const googleId = data.user.id;

    // Check if database URL is configured
    if (!process.env.DATABASE_URL) {
      console.error("DATABASE_URL is missing in environment variables on Vercel!");
      const redirectUrl = new URL(errorBase);
      redirectUrl.searchParams.set(
        "error",
        "Database is not connected. Please verify DATABASE_URL is configured in Vercel settings."
      );
      return NextResponse.redirect(redirectUrl);
    }

    // Find or create merchant in Prisma
    let merchant = await prisma.merchant.findFirst({
      where: {
        OR: [
          { googleId },
          { email },
        ],
      },
    });

    if (!merchant) {
      merchant = await prisma.merchant.create({
        data: {
          email,
          googleId,
          onboardingStep: 1,
          onboardingState: "IN_PROGRESS",
        },
      });
    } else if (!merchant.googleId) {
      merchant = await prisma.merchant.update({
        where: { id: merchant.id },
        data: { googleId },
      });
    }

    // Determine redirection destination
    const destination = merchant.onboardingState === "COMPLETED" ? (next || "/dashboard") : "/onboarding";
    const redirectResponse = NextResponse.redirect(new URL(destination, origin));

    // Mirror any Supabase cookies to redirectResponse
    const isHttps = origin.startsWith("https:");
    cookiesToSetLater.forEach(({ name, value, options }) => {
      try {
        redirectResponse.cookies.set(name, value, {
          ...options,
          secure: isHttps ? options?.secure : false,
        });
      } catch {
        // Ignore cookie options mismatch
      }
    });

    // Set secure 30-day session cookie
    const sessionToken = createSessionToken(merchant.id);
    const sessionCookieOptions = {
      httpOnly: true,
      secure: isHttps,
      sameSite: "lax" as const,
      path: "/",
      maxAge: 30 * 24 * 60 * 60,
    };

    redirectResponse.cookies.set("ondar_session", sessionToken, sessionCookieOptions);

    try {
      cookieStore.set("ondar_session", sessionToken, sessionCookieOptions);
    } catch {
      // If not permitted
    }

    return redirectResponse;
  } catch (err: any) {
    console.error("Unexpected error in /api/auth/callback:", err);
    const redirectUrl = new URL(errorBase);
    redirectUrl.searchParams.set(
      "error",
      err?.message || "Failed to complete Google authentication. Please try again."
    );
    return NextResponse.redirect(redirectUrl);
  }
}
