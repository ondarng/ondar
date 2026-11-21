import { NextRequest, NextResponse } from "next/server";

export function proxy(req: NextRequest) {
  const url = req.nextUrl;
  const rawHost = req.headers.get("x-forwarded-host") || req.headers.get("host") || "";
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "ondar.ng";
  const currentHost = rawHost.split(",")[0].trim().replace(`:${url.port}`, "").replace(/:\d+$/, "");

  if (!currentHost.endsWith(`.${rootDomain}`)) {
    return NextResponse.next();
  }

  const subdomain = currentHost.replace(`.${rootDomain}`, "").toLowerCase().trim();
  if (!subdomain || subdomain === "www" || subdomain === "app") {
    return NextResponse.next();
  }

  // Preserve any search/query params (e.g. ?custom=... or ?reference=...)
  const search = url.search || "";

  // If the pathname already starts with /s/, don't double-prefix it!
  if (url.pathname.startsWith("/s/")) {
    return NextResponse.next();
  }

  // Prevent routing core merchant/auth screens on store subdomains
  const isCoreAppRoute =
    url.pathname.startsWith("/dashboard") ||
    url.pathname.startsWith("/login") ||
    url.pathname.startsWith("/register") ||
    url.pathname.startsWith("/onboarding") ||
    url.pathname.startsWith("/orders") ||
    url.pathname.startsWith("/inventory") ||
    url.pathname.startsWith("/settings") ||
    url.pathname.startsWith("/customers") ||
    url.pathname.startsWith("/more") ||
    url.pathname.startsWith("/admin");

  if (isCoreAppRoute) {
    const targetUrl = new URL(url.pathname + search, `https://${rootDomain}`);
    return NextResponse.redirect(targetUrl);
  }

  if (url.pathname.startsWith("/p/")) {
    const productSlug = url.pathname.slice("/p/".length);
    return NextResponse.rewrite(new URL(`/s/${subdomain}/p/${productSlug}${search}`, req.url));
  }

  if (url.pathname === "/") {
    return NextResponse.rewrite(new URL(`/s/${subdomain}${search}`, req.url));
  }

  return NextResponse.rewrite(new URL(`/s/${subdomain}${url.pathname}${search}`, req.url));
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|icon.png).*)"],
};
