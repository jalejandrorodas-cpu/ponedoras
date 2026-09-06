import { Request, Response, NextFunction } from "express";
import { Rol } from "@prisma/client";
import { verificarToken, JwtPayload } from "../lib/jwt";

// Extiende Express.Request para llevar los datos del usuario autenticado.
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      auth?: JwtPayload;
    }
  }
}

/**
 * Verifica el JWT en el header Authorization: Bearer <token>.
 * Si es válido, deja el payload (userId, organizacionId, rol) en req.auth.
 * A partir de aquí, TODA consulta de datos debe filtrar por req.auth.organizacionId.
 */
export function autenticar(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Falta el token de autenticación." });
  }

  const token = header.slice("Bearer ".length);
  try {
    req.auth = verificarToken(token);
    next();
  } catch {
    return res.status(401).json({ error: "Token inválido o expirado." });
  }
}

/**
 * Restringe una ruta a uno o más roles. Úsese siempre DESPUÉS de `autenticar`.
 * Ej: router.post('/galpones', autenticar, requiereRol('ADMIN_GRANJA'), crearGalpon)
 */
export function requiereRol(...rolesPermitidos: Rol[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.auth) {
      return res.status(401).json({ error: "No autenticado." });
    }
    if (!rolesPermitidos.includes(req.auth.rol)) {
      return res.status(403).json({ error: "No tienes permiso para esta acción." });
    }
    next();
  };
}
