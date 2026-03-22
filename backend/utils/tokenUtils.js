import crypto from "node:crypto";

export function hashToken(rawToken) {
  return crypto.createHash("sha256").update(String(rawToken)).digest("hex");
}

export function createRandomToken({ bytes = 32 } = {}) {
  const token = crypto.randomBytes(bytes).toString("hex");
  const tokenHash = hashToken(token);
  return { token, tokenHash };
}
