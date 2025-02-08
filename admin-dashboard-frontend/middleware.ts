import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "next-auth/middleware";

export default withAuth(
  async function middleware(req: NextRequest) {
    const path = req.nextUrl.pathname;
    console.log(`Middleware called for path: ${path}`);

    try {
      const session = await getToken({
        req,
        secret: process.env.NEXTAUTH_SECRET,
      });

      const isAuth = !!session;
      console.log(`Path: ${path}, Is Authenticated: ${isAuth}, Session:`, JSON.stringify(session, null, 2));

      // If the user is trying to access the login page while authenticated
      if (path.startsWith("/login")) {
        if (isAuth) {
          console.log("Authenticated user redirected from login to dashboard");
          return NextResponse.redirect(new URL("/dashboard", req.url));
        }
        console.log("Unauthenticated user allowed access to login page");
        return NextResponse.next(); // Allow access to the login page
      }

      // If the user is not authenticated and trying to access a protected route
      if (!isAuth) {
        console.log("Unauthenticated user redirected to login");
        return NextResponse.redirect(new URL("/login", req.url));
      }

      // Allow access to the protected routes
      console.log("Authenticated user allowed access to protected route");
      return NextResponse.next();
    } catch (error) {
      console.error("Error in middleware:", error);
      // In case of an error, redirect to login page
      return NextResponse.redirect(new URL("/login", req.url));
    }
  },
  {
    callbacks: {
      async authorized({ req }) {
        console.log("Authorized callback called");
        return true; // Here you could implement more granular checks if needed
      },
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/analytics/:path*",
    "/users/:path*",
    "/settings/:path*",
    "/login",
  ],
};