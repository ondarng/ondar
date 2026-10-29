import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { prisma } from "@/lib/prisma";
import { createSessionToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(`${origin}/?error=missing_code`);
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.redirect(`${origin}/?error=oauth_unavailable`);
  }

  const destinationPlaceholder = new URL("/", origin);
  const response = NextResponse.redirect(destinationPlaceholder);

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return req.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  const isGoogle =
    data?.user?.app_metadata?.provider === "google" ||
    (Array.isArray(data?.user?.app_metadata?.providers) &&
      data?.user?.app_metadata?.providers.includes("google")) ||
    data?.user?.identities?.some((id: any) => id.provider === "google");

  if (error || !data?.user || !data.user.email || !isGoogle) {
    console.error("OAuth code exchange error:", error, data?.user?.app_metadata);
    return NextResponse.redirect(`${origin}/?error=oauth_failed`);
  }

  const email = data.user.email.toLowerCase().trim();
  const googleId = data.user.id;

  // Find or create merchant in Prisma
  let merchant = await prisma.merchant.findUnique({
    where: { email },
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

  // Set secure 30-day session cookie directly on response
  const sessionToken = createSessionToken(merchant.id);
  response.cookies.set("ondar_session", sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 30 * 24 * 60 * 60,
  });

  const destination = merchant.onboardingState === "COMPLETED" ? "/dashboard" : "/onboarding";
  response.headers.set("Location", new URL(destination, origin).toString());
  return response;
}
