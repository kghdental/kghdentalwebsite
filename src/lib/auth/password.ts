import bcrypt from "bcryptjs";

/**
 * Hashes a plaintext password using bcrypt with standard salt work factor (12 rounds)
 */
export async function hashPassword(plain: string): Promise<string> {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(plain, salt);
}

/**
 * Verifies a plaintext password against a stored hash (or legacy plaintext)
 */
export async function verifyPassword(plain: string, storedHash: string): Promise<boolean> {
  if (!plain || !storedHash) return false;

  // If already a bcrypt hash (starts with $2a$, $2b$, or $2y$)
  if (
    storedHash.startsWith("$2a$") ||
    storedHash.startsWith("$2b$") ||
    storedHash.startsWith("$2y$")
  ) {
    return bcrypt.compare(plain, storedHash);
  }

  // Backward compatibility: If stored as plaintext in legacy database, verify directly
  return plain === storedHash;
}
