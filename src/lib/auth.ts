import bcrypt from "bcryptjs"

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
