import { NextResponse, type NextRequest } from "next/server";
import { isDemoMode } from "@/lib/demo-mode";

const PROTECTED = [/^\/dashboard(?:\/|$)/, /^\/admin(?:\/|$)/, /^\/onboarding(?:\/|$)/];

export function middleware(req: NextRequest) {
  if (isDemoMode) return NextResponse.next();

  const { pathname } = req.nextUrl;
  const needsAuth = PROTECTED.some((re) => re.test(pathname));
  if (!needsAuth) return NextResponse.next();

  const hasAuth = req.cookies.get("bizaffle-auth")?.value === "1";
  if (!hasAuth) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/onboarding"],
};
