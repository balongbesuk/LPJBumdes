import { SignJWT, jwtVerify, type JWTPayload } from "jose"

// Secret key for JWT signing — encoded as Uint8Array for jose
const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || "bumdes-default-secret-change-in-production"
)

const ISSUER = "bumdes-system"
const AUDIENCE = "bumdes-app"

export interface UserTokenPayload extends JWTPayload {
  sub: string // user ID
  username: string
  name: string
  role: string
}

/**
 * Sign a JWT token with user data.
 * Works in both Edge Runtime (middleware) and Node.js (API routes).
 */
export async function signToken(payload: {
  id: string
  username: string
  name: string
  role: string
}): Promise<string> {
  return new SignJWT({
    username: payload.username,
    name: payload.name,
    role: payload.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.id)
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setIssuedAt()
    .setExpirationTime("7d") // 7 days
    .sign(SECRET_KEY)
}

/**
 * Verify and decode a JWT token.
 * Returns the payload if valid, null if expired/invalid.
 * Works in both Edge Runtime and Node.js.
 */
export async function verifyToken(
  token: string
): Promise<UserTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY, {
      issuer: ISSUER,
      audience: AUDIENCE,
    })
    return payload as UserTokenPayload
  } catch {
    return null
  }
}

/** Cookie configuration for the auth token */
export const AUTH_COOKIE_NAME = "bumdes_token"

export function getAuthCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days in seconds
  }
}
