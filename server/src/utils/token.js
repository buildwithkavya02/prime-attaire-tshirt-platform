import crypto from "crypto";
import jwt from "jsonwebtoken";

// Same unpredictable alphabet style as the frontend mock — no ambiguous
// look-alike characters (0/O, 1/I/l) so links are easy to read out loud.
const TOKEN_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";

/**
 * Generates a cryptographically random private-link token.
 * Long enough (14 chars from a 58-char alphabet ≈ 82 bits of entropy) that
 * guessing it is infeasible — this is what stands between a customer and
 * the private studio, so it must never be predictable or sequential.
 */
export function generatePrivateToken(length = 14) {
  const bytes = crypto.randomBytes(length);
  let out = "";
  for (let i = 0; i < length; i++) {
    out += TOKEN_ALPHABET[bytes[i] % TOKEN_ALPHABET.length];
  }
  return out;
}

/** Generates a 4-digit numeric access code. */
export function generateAccessCode() {
  return crypto.randomInt(1000, 10000).toString();
}

export function signAdminToken(admin) {
  return jwt.sign(
    { sub: admin._id.toString(), email: admin.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
}

export function verifyAdminToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}
