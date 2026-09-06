import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../../lib/prisma";
import { firmarToken } from "../../lib/jwt";

export const authRouter = Router();

const registroSchema = z.object({
  nombreOrganizacion: z.string().min(2),
  nit: z.string().optional(),
  nombreAdmin: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres."),
});

/**
 * Alta de una nueva organización (avicultor) con su usuario ADMIN_GRANJA.
 * En el arranque (piloto/beta manual) esto lo ejecuta un admin de Agroactivo;
 * en autoservicio, sería el propio avicultor desde un formulario público.
 */
authRouter.post("/registro", async (req, res) => {
  const parsed = registroSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  const { nombreOrganizacion, nit, nombreAdmin, email, password } = parsed.data;

  const existente = await prisma.usuario.findUnique({ where: { email } });
  if (existente) {
    return res.status(409).json({ error: "Ese correo ya está registrado." });
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const organizacion = await prisma.organizacion.create({
    data: {
      nombre: nombreOrganizacion,
      nit,
      usuarios: {
        create: {
          nombre: nombreAdmin,
          email,
          passwordHash,
          rol: "ADMIN_GRANJA",
        },
      },
    },
    include: { usuarios: true },
  });

  const admin = organizacion.usuarios[0];
  const token = firmarToken({
    userId: admin.id,
    organizacionId: organizacion.id,
    rol: admin.rol,
  });

  res.status(201).json({
    token,
    organizacion: { id: organizacion.id, nombre: organizacion.nombre },
    usuario: { id: admin.id, nombre: admin.nombre, email: admin.email, rol: admin.rol },
  });
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

authRouter.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  const { email, password } = parsed.data;

  const usuario = await prisma.usuario.findUnique({ where: { email } });
  if (!usuario || !usuario.activo) {
    return res.status(401).json({ error: "Credenciales inválidas." });
  }

  const passwordOk = await bcrypt.compare(password, usuario.passwordHash);
  if (!passwordOk) {
    return res.status(401).json({ error: "Credenciales inválidas." });
  }

  const token = firmarToken({
    userId: usuario.id,
    organizacionId: usuario.organizacionId,
    rol: usuario.rol,
  });

  res.json({
    token,
    usuario: {
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol,
      organizacionId: usuario.organizacionId,
    },
  });
});
