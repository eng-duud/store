import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const AUTH_SECRET = new TextEncoder().encode(process.env.AUTH_SECRET);

async function getSessionToken(req: NextRequest): Promise<Record<string, unknown> | null> {
  try {
    const token = req.cookies.get("authjs.session-token")?.value
      || req.cookies.get("__Secure-authjs.session-token")?.value;
    if (!token) return null;
    const { payload } = await jwtVerify(token, AUTH_SECRET, { algorithms: ["HS256"] });
    return payload as Record<string, unknown>;
  } catch {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const session = await getSessionToken(req);
  const role = session?.role as string | undefined;

  if (pathname.startsWith("/admin")) {
    if (!session) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (role !== "ADMIN" && role !== "EMPLOYEE") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  if (
    pathname.startsWith("/account") ||
    pathname.startsWith("/orders") ||
    pathname === "/checkout"
  ) {
    if (!session) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/account/:path*", "/orders/:path*", "/checkout"],
};
