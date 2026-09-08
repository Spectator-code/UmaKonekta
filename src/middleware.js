import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // If the user tries to access a protected route without being authenticated,
    // NextAuth will automatically redirect them to the sign-in page.
    
    // We can also do role-based checks here if necessary.
    // For now, we just ensure they are logged in.
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        // If token exists, they are authenticated
        return !!token;
      },
    },
  }
);

// Apply middleware to private routes
export const config = {
  matcher: [
    "/farmer-dashboard/:path*",
    "/provider-dashboard/:path*",
    "/admin/:path*",
    "/dispatch-slip/:path*",
    "/sacco-receipt/:path*",
  ],
};
