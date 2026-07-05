import { SignJWT, jwtVerify } from "jose";

// jose (not jsonwebtoken) is used deliberately: Next.js middleware runs on
// the Edge runtime, which doesn't have Node's `crypto` module that
// jsonwebtoken depends on. jose uses Web Crypto, so it works in both
// regular API routes and middleware.

const SECRET = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET || "change-this-secret"
);

export const ADMIN_COOKIE = "anime_admin_session";

export async function createAdminToken() {
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(SECRET);
}

export async function verifyAdminToken(token) {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload.role === "admin";
  } catch {
    return false;
  }
}
