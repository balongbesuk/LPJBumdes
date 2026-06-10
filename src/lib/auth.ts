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
 * Also supports legacy SHA-256 hashes for backward compatibility
 * during migration period.
 */
export async function comparePassword(
  plaintext: string,
  storedHash: string
): Promise<boolean> {
  // Bcrypt hashes always start with "$2a$" or "$2b$"
  if (storedHash.startsWith("$2")) {
    return bcrypt.compare(plaintext, storedHash)
  }

  // Legacy SHA-256 fallback (64 hex chars)
  // This allows existing users to login even before their hash is migrated
  const crypto = await import("crypto")
  const sha256Hash = crypto.createHash("sha256").update(plaintext).digest("hex")
  return sha256Hash === storedHash
}

/**
 * Check if a stored hash is using the legacy SHA-256 format.
 * Used to detect and auto-migrate passwords on login.
 */
export function isLegacyHash(hash: string): boolean {
  return !hash.startsWith("$2")
}
