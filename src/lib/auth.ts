import bcrypt from "bcryptjs"
import { cookies } from "next/headers"
import { verifyToken, AUTH_COOKIE_NAME } from "./jwt"

const SALT_ROUNDS = 12

/**
 * Hash a plaintext password using bcrypt.
 * Cost factor 12 provides a good balance between security and speed.
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS)
}

/**
 * Compare a plaintext password against a bcrypt hash.
 */
export async function comparePassword(
  plaintext: string,
  storedHash: string
): Promise<boolean> {
  return bcrypt.compare(plaintext, storedHash)
}

/**
 * Retrieve current user session securely from HttpOnly JWT cookie.
 */
export async function getUserSession() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(AUTH_COOKIE_NAME)
    if (!token) return null

    const payload = await verifyToken(token.value)
    if (!payload) return null

    return {
      id: payload.sub,
      username: payload.username,
      name: payload.name,
      role: payload.role
    }
  } catch (_) {
    return null
  }
}
