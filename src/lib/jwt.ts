import { SignJWT, jwtVerify, type JWTPayload } from "jose"

// Generate a runtime-only random secret to avoid hardcoded credentials warnings in CodeQL.
// This ensures that the system is secure by default if no environment variable is provided.
const fallbackSecret = typeof window === "undefined"
  ? (globalThis.crypto?.getRandomValues(new Uint8Array(32)) || new Uint8Array(32))
  : new Uint8Array(32)

const getSecretKey = (): Uint8Array => {
  const secret = process.env.JWT_SECRET
  if (secret) {
    return new TextEncoder().encode(secret)
  }

  if (process.env.NODE_ENV === "production") {
    console.warn(
      "⚠️ WARNING: JWT_SECRET environment variable is not defined! " +
      "A random secret key has been generated for this session. " +
      "Users will be logged out if the server restarts."
    )
  }

  return fallbackSecret
}

const SECRET_KEY = getSecretKey()

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
