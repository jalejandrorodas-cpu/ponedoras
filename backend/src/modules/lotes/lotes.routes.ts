import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../lib/prisma";
import { autenticar, requiereRol } from "../../middleware/auth";

export const lotesRouter = Router();
lotesRouter.use(autenticar);

async function galponDeLaOrganizacion(galponId: string, organizacionId: string) {
  return prisma.galpon.findFirst({ where: { id: galponId, organizacionId } });
}

lotesRouter.get("/galpon/:galponId", async (req, res) => {
  const galpon = await galponDeLaOrganizacion(req.params.galponId, req.auth!.organizacionId);
  if (!galpon) return res.status(404).json({ error: "Galpón no encontrado." });

  const lotes = await prisma.lote.findMany({
    where: { galponId: galpon.id },
    orderBy: { fechaIngreso: "desc" },
  });
  res.json(lotes);
});

const crearLoteSchema = z.object({
  galponId: z.string().uuid(),
  origen: z.enum(["POLLITA_1_DIA", "PREPOSTURA"]),
  edadIngresoSemanas: z.number().int().min(0),
  fechaIngreso: z.string().datetime(),
  avesIniciales: z.number().int().positive(),
});

lotesRouter.post("/", requiereRol("ADMIN_GRANJA", "SUPERVISOR"), async (req, res) => {
  const parsed = crearLoteSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const galpon = await galponDeLaOrganizacion(parsed.data.galponId, req.auth!.organizacionId);
  if (!galpon) return res.status(404).json({ error: "Galpón no encontrado." });

  const lote = await prisma.lote.create({
    data: {
      galponId: galpon.id,
      organizacionId: req.auth!.organizacionId,
      origen: parsed.data.origen,
      edadIngresoSemanas: parsed.data.edadIngresoSemanas,
      fechaIngreso: new Date(parsed.data.fechaIngreso),
      avesIniciales: parsed.data.avesIniciales,
      avesActuales: parsed.data.avesIniciales,
      estado: parsed.data.origen === "POLLITA_1_DIA" ? "EN_CRIANZA" : "ACTIVO",
    },
  });
  res.status(201).json(lote);
});
