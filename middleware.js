import { NextResponse } from "next/server";
import { verifyAdminToken, ADMIN_COOKIE } from "./lib/auth";

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Never let search engines index anything under /admin.
  const response = pathname.startsWith("/admin")
    ? applyNoIndex(NextResponse.next())
    : NextResponse.next();

  const isProtectedPage = pathname.startsWith("/admin/dashboard");
  const isProtectedApi =
    (pathname.startsWith("/api/anime") &&
      ["POST", "PUT", "DELETE", "PATCH"].includes(request.method)) ||
    pathname === "/api/admin/import-anilist";

  if (isProtectedPage || isProtectedApi) {
    const token = request.cookies.get(ADMIN_COOKIE)?.value;
    const valid = token && (await verifyAdminToken(token));

    if (!valid) {
      if (isProtectedApi) {
        return applyNoIndex(
          NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        );
      }
      const loginUrl = new URL("/admin", request.url);
      return applyNoIndex(NextResponse.redirect(loginUrl));
    }
  }

  return response;
}

function applyNoIndex(res) {
  res.headers.set("X-Robots-Tag", "noindex, nofollow");
  return res;
}

export const config = {
  matcher: ["/admin/:path*", "/api/anime/:path*", "/api/admin/import-anilist"]
};
