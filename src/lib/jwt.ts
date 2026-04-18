import jwt from "jsonwebtoken";

const SECRET = process.env.NEXTAUTH_SECRET || "adflow2024secret";

export function signToken(payload: Record<string, any>): string {
  return jwt.sign(payload, SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, SECRET);
  } catch {
    return null;
  }
}