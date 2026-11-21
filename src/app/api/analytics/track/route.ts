import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function categorizeReferrer(rawReferrer: string | null | undefined): string {
  if (!rawReferrer || typeof rawReferrer !== "string") {
    return "Direct";
  }

  const trimmed = rawReferrer.trim().toLowerCase();
  if (!trimmed || trimmed === "null" || trimmed === "undefined") {
    return "Direct";
  }

  try {
    const url = new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);
    const host = url.hostname.toLowerCase();

    if (host.includes("instagram.com") || host.includes("l.instagram.com")) {
      return "Instagram";
    }
    if (host.includes("whatsapp.com") || host.includes("wa.me") || host.includes("chat.whatsapp.com")) {
      return "WhatsApp";
    }
    if (host.includes("tiktok.com")) {
      return "TikTok";
    }
    if (host.includes("twitter.com") || host.includes("t.co") || host.includes("x.com")) {
      return "X (Twitter)";
    }
    if (host.includes("google.com") || host.includes("google.com.ng") || host.includes("google.")) {
      return "Google";
    }
    if (host.includes("facebook.com") || host.includes("fb.me") || host.includes("m.facebook.com")) {
      return "Facebook";
    }
    if (host.includes("youtube.com") || host.includes("youtu.be")) {
      return "YouTube";
    }
    if (host.includes("linkedin.com") || host.includes("lnkd.in")) {
      return "LinkedIn";
    }
    if (host.includes("ondar.ng") || host.includes("localhost")) {
      return "Direct";
    }

    return host.replace(/^www\./, "");
  } catch {
    if (trimmed.includes("instagram")) return "Instagram";
    if (trimmed.includes("whatsapp")) return "WhatsApp";
    if (trimmed.includes("tiktok")) return "TikTok";
    if (trimmed.includes("twitter") || trimmed.includes("t.co")) return "X (Twitter)";
    return "Direct";
  }
}

export async function POST(req: NextRequest) {
  try {
    let body: any = {};
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("application/json") || contentType.includes("text/plain")) {
      try {
        const text = await req.text();
        if (text) {
          body = JSON.parse(text);
        }
      } catch {
        body = {};
      }
    }

    const { merchantSlug, path, referrer, visitorId } = body;

    if (!merchantSlug || typeof merchantSlug !== "string") {
      return NextResponse.json({ error: "Missing merchantSlug" }, { status: 400 });
    }

    const profile = await prisma.businessProfile.findUnique({
      where: { slug: merchantSlug.toLowerCase().trim() },
      select: { merchantId: true },
    });

    if (!profile) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    const categorizedSource = categorizeReferrer(referrer);
    const cleanVisitorId =
      visitorId && typeof visitorId === "string" && visitorId.length > 3
        ? visitorId.slice(0, 100)
        : `anon_${Math.random().toString(36).slice(2, 11)}`;

    const cleanPath = typeof path === "string" && path.length > 0 ? path.slice(0, 255) : "/";
    const userAgent = req.headers.get("user-agent")?.slice(0, 255) || null;

    // Record visitor beacon
    await prisma.storeVisit.create({
      data: {
        merchantId: profile.merchantId,
        visitorId: cleanVisitorId,
        path: cleanPath,
        referrer: categorizedSource,
        userAgent,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    // Non-blocking: analytics tracking should never fail loudly
    console.warn("Analytics tracking beacon warning:", err);
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
