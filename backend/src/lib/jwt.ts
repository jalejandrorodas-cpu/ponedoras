import jwt from "jsonwebtoken";
import { Rol } from "@prisma/client";

export interface JwtPayload {
  userId: string;
  organizacionId: string;
  rol: Rol;
}

const SECRET = process.env.JWT_SECRET;
if (!SECRET) {
  throw new Error("Falta JWT_SECRET en las variables de entorno.");
}

export function firmarToken(payload: JwtPayload): string {
  return jwt.sign(payload, SECRET as string, {
    expiresIn: (process.env.JWT_EXPIRES_IN || "8h") as jwt.SignOptions["expiresIn"],
  });
}

export function verificarToken(token: string): JwtPayload {
  return jwt.verify(token, SECRET as string) as JwtPayload;
}
