import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../lib/prisma";
import { autenticar, requiereRol } from "../../middleware/auth";

export const granjasRouter = Router();
granjasRouter.use(autenticar);

// Toda consulta filtra SIEMPRE por la organización del token — nunca por un id que
// venga del cliente. Así una granja de otro avicultor nunca es alcanzable ni por error.

granjasRouter.get("/", async (req, res) => {
  const granjas = await prisma.granja.findMany({
    where: { organizacionId: req.auth!.organizacionId, activa: true },
    orderBy: { nombre: "asc" },
  });
  res.json(granjas);
});

granjasRouter.get("/:id", async (req, res) => {
  const granja = await prisma.granja.findFirst({
    where: { id: req.params.id, organizacionId: req.auth!.organizacionId },
    include: { galpones: { where: { activo: true } } },
  });
  if (!granja) return res.status(404).json({ error: "Granja no encontrada." });
  res.json(granja);
});

const crearGranjaSchema = z.object({ nombre: z.string().min(2) });

granjasRouter.post("/", requiereRol("ADMIN_GRANJA"), async (req, res) => {
  const parsed = crearGranjaSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const granja = await prisma.granja.create({
    data: { nombre: parsed.data.nombre, organizacionId: req.auth!.organizacionId },
  });
  res.status(201).json(granja);
});

// "Eliminar" una granja = desactivarla. Nunca se borra físico porque puede tener
// historial de producción/ventas colgado (ver política de edición de la propuesta).
granjasRouter.patch("/:id/desactivar", requiereRol("ADMIN_GRANJA"), async (req, res) => {
  const granja = await prisma.granja.findFirst({
    where: { id: req.params.id, organizacionId: req.auth!.organizacionId },
  });
  if (!granja) return res.status(404).json({ error: "Granja no encontrada." });

  const actualizada = await prisma.granja.update({
    where: { id: granja.id },
    data: { activa: false },
  });
  res.json(actualizada);
});
