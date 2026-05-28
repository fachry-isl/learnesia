import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ADMIN_PATH = process.env.NEXT_PUBLIC_ADMIN_PATH || "/admin";
const IS_OBFUSCATED = ADMIN_PATH !== "/admin";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // When obfuscation is active, block any direct /admin or /admin/* access → 404
  const isDirectAdminPath = pathname === "/admin" || pathname.startsWith("/admin/");
  if (IS_OBFUSCATED && isDirectAdminPath) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Only apply auth logic to the configured admin path
  const isAdminPath = pathname === ADMIN_PATH || pathname.startsWith(`${ADMIN_PATH}/`);
  if (!isAdminPath) {
    return NextResponse.next();
  }

  // Allow the login page through without auth
  const loginPath = `${ADMIN_PATH}/login`;
  if (pathname === loginPath || pathname.startsWith(`${loginPath}/`)) {
    return NextResponse.next();
  }

  // Require auth for all other admin routes
  const accessToken = request.cookies.get("accessToken")?.value;
  if (!accessToken) {
    const url = request.nextUrl.clone();
    url.pathname = loginPath;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  // Broad matcher — exclude Next.js internals and static assets only
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
