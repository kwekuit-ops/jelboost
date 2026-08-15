import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token    = req.nextauth.token;
    const pathname = req.nextUrl.pathname;
    const isAdmin  = ["ADMIN","SUPER_ADMIN"].includes(token?.role as string);

    // Block non-admins from /admin routes
    if (pathname.startsWith("/admin") && !isAdmin) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // Redirect banned users to error page
    if (token?.error === "AccountBanned") {
      return NextResponse.redirect(new URL("/auth/error?error=AccountBanned", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
  ],
};
