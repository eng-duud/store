import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const AUTH_SECRET = new TextEncoder().encode(process.env.AUTH_SECRET);

const SESSION_COOKIE_NAMES = [
  "authjs.session-token",
  "__Secure-authjs.session-token",
  "next-auth.session-token",
  "__Secure-next-auth.session-token",
];

async function getSessionToken(req: NextRequest): Promise<Record<string, unknown> | null> {
  try {
    let token: string | undefined;
    for (const name of SESSION_COOKIE_NAMES) {
      token = req.cookies.get(name)?.value;
      if (token) break;
    }
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
      const response = NextResponse.redirect(loginUrl);
      response.headers.set("x-middleware-cache", "no-store");
      return response;
    }
    if (role !== "ADMIN" && role !== "EMPLOYEE") {
      const response = NextResponse.redirect(new URL("/", req.url));
      response.headers.set("x-middleware-cache", "no-store");
      return response;
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
      const response = NextResponse.redirect(loginUrl);
      response.headers.set("x-middleware-cache", "no-store");
      return response;
    }
  }

  const response = NextResponse.next();
  response.headers.set("x-middleware-cache", "no-store");
  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/account/:path*", "/orders/:path*", "/checkout"],
};
