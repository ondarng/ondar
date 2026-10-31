import { NextRequest, NextResponse } from "next/server";

export function proxy(req: NextRequest) {
  const url = req.nextUrl;
  const hostname = req.headers.get("host") || "";
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "ondar.ng";
  const currentHost = hostname.replace(`:${url.port}`, "");

  if (!currentHost.endsWith(`.${rootDomain}`)) {
    return NextResponse.next();
  }

  const subdomain = currentHost.replace(`.${rootDomain}`, "");
  if (!subdomain || subdomain === "www" || subdomain === "app") {
    return NextResponse.next();
  }

  // If the pathname already starts with /s/, don't double-prefix it!
  if (url.pathname.startsWith("/s/")) {
    return NextResponse.next();
  }

  if (url.pathname.startsWith("/p/")) {
    const productSlug = url.pathname.slice("/p/".length);
    return NextResponse.rewrite(new URL(`/s/${subdomain}/p/${productSlug}`, req.url));
  }

  if (url.pathname === "/") {
    return NextResponse.rewrite(new URL(`/s/${subdomain}`, req.url));
  }

  return NextResponse.rewrite(new URL(`/s/${subdomain}${url.pathname}`, req.url));
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|icon.png).*)"],
};
