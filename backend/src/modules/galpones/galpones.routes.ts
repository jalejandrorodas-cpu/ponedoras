import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../lib/prisma";
import { autenticar, requiereRol } from "../../middleware/auth";

export const galponesRouter = Router();
galponesRouter.use(autenticar);

async function granjaDeLaOrganizacion(granjaId: string, organizacionId: string) {
  return prisma.granja.findFirst({ where: { id: granjaId, organizacionId } });
}

galponesRouter.get("/granja/:granjaId", async (req, res) => {
  const granja = await granjaDeLaOrganizacion(req.params.granjaId, req.auth!.organizacionId);
  if (!granja) return res.status(404).json({ error: "Granja no encontrada." });

  const galpones = await prisma.galpon.findMany({
    where: { granjaId: granja.id, activo: true },
    orderBy: { nombre: "asc" },
  });
  res.json(galpones);
});

const crearGalponSchema = z.object({
  granjaId: z.string().uuid(),
  nombre: z.string().min(1), // libre — "Galpón BB" es válido, el tipo es lo que importa
  tipo: z.enum(["LEVANTE", "POSTURA", "DESCARTE"]),
  capacidad: z.number().int().positive(),
});

galponesRouter.post("/", requiereRol("ADMIN_GRANJA"), async (req, res) => {
  const parsed = crearGalponSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const granja = await granjaDeLaOrganizacion(parsed.data.granjaId, req.auth!.organizacionId);
  if (!granja) return res.status(404).json({ error: "Granja no encontrada." });

  const galpon = await prisma.galpon.create({
    data: {
      granjaId: granja.id,
      organizacionId: req.auth!.organizacionId,
      nombre: parsed.data.nombre,
      tipo: parsed.data.tipo,
      capacidad: parsed.data.capacidad,
    },
  });
  res.status(201).json(galpon);
});

galponesRouter.patch("/:id/desactivar", requiereRol("ADMIN_GRANJA"), async (req, res) => {
  const galpon = await prisma.galpon.findFirst({
    where: { id: req.params.id, organizacionId: req.auth!.organizacionId },
  });
  if (!galpon) return res.status(404).json({ error: "Galpón no encontrado." });

  const actualizado = await prisma.galpon.update({
    where: { id: galpon.id },
    data: { activo: false },
  });
  res.json(actualizado);
});
