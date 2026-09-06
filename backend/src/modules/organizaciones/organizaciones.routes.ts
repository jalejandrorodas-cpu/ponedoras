import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../../lib/prisma";
import { autenticar, requiereRol } from "../../middleware/auth";

export const organizacionesRouter = Router();
organizacionesRouter.use(autenticar);

organizacionesRouter.get("/me", async (req, res) => {
  const organizacion = await prisma.organizacion.findUnique({
    where: { id: req.auth!.organizacionId },
  });
  res.json(organizacion);
});

organizacionesRouter.get("/usuarios", requiereRol("ADMIN_GRANJA"), async (req, res) => {
  const usuarios = await prisma.usuario.findMany({
    where: { organizacionId: req.auth!.organizacionId },
    select: { id: true, nombre: true, email: true, rol: true, activo: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });
  res.json(usuarios);
});

const crearUsuarioSchema = z.object({
  nombre: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  rol: z.enum(["ADMIN_GRANJA", "SUPERVISOR", "DIGITADOR", "VENDEDOR", "CONTADOR"]),
});

// Solo un ADMIN_GRANJA invita gente a su propia organización — nunca se elige
// libremente a qué organización pertenece un usuario nuevo desde este endpoint.
organizacionesRouter.post("/usuarios", requiereRol("ADMIN_GRANJA"), async (req, res) => {
  const parsed = crearUsuarioSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const existente = await prisma.usuario.findUnique({ where: { email: parsed.data.email } });
  if (existente) return res.status(409).json({ error: "Ese correo ya está registrado." });

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  const usuario = await prisma.usuario.create({
    data: {
      organizacionId: req.auth!.organizacionId,
      nombre: parsed.data.nombre,
      email: parsed.data.email,
      passwordHash,
      rol: parsed.data.rol,
    },
    select: { id: true, nombre: true, email: true, rol: true, activo: true },
  });
  res.status(201).json(usuario);
});

// Nunca se borra un usuario (para no perder la autoría de su historial): se desactiva.
organizacionesRouter.patch(
  "/usuarios/:id/desactivar",
  requiereRol("ADMIN_GRANJA"),
  async (req, res) => {
    const usuario = await prisma.usuario.findFirst({
      where: { id: req.params.id, organizacionId: req.auth!.organizacionId },
    });
    if (!usuario) return res.status(404).json({ error: "Usuario no encontrado." });

    const actualizado = await prisma.usuario.update({
      where: { id: usuario.id },
      data: { activo: false },
      select: { id: true, nombre: true, email: true, rol: true, activo: true },
    });
    res.json(actualizado);
  }
);
