import NextAuth from "next-auth";
import authConfig from "@/auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  if (pathname.startsWith("/api/admin")) {
    if (!session) {
      return Response.json(
        { success: false, error: "Unauthorized access" },
        { status: 401 }
      );
    }
    if (session.user?.role !== "ADMIN" && session.user?.role !== "EMPLOYEE") {
      return Response.json(
        { success: false, error: "Forbidden: Admin or Employee role required" },
        { status: 403 }
      );
    }
  }

  if (pathname.startsWith("/admin")) {
    if (!session) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return Response.redirect(loginUrl);
    }
    if (session.user?.role !== "ADMIN" && session.user?.role !== "EMPLOYEE") {
      return Response.redirect(new URL("/", req.url));
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
      return Response.redirect(loginUrl);
    }
  }
});

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
    "/account/:path*",
    "/orders/:path*",
    "/checkout",
  ],
};
