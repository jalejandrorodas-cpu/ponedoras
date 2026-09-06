import { PrismaClient } from "@prisma/client";

// Cliente único reutilizado en toda la app (evita agotar conexiones en desarrollo).
export const prisma = new PrismaClient();
