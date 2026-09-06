import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../lib/prisma";
import { autenticar, requiereRol } from "../../middleware/auth";

export const produccionRouter = Router();
produccionRouter.use(autenticar);

async function loteDeLaOrganizacion(loteId: string, organizacionId: string) {
  return prisma.lote.findFirst({ where: { id: loteId, organizacionId } });
}

function esMismoDia(a: Date, b: Date) {
  return a.toDateString() === b.toDateString();
}

produccionRouter.get("/lote/:loteId", async (req, res) => {
  const lote = await loteDeLaOrganizacion(req.params.loteId, req.auth!.organizacionId);
  if (!lote) return res.status(404).json({ error: "Lote no encontrado." });

  const registros = await prisma.registroProduccion.findMany({
    where: { loteId: lote.id, anulado: false },
    orderBy: { fecha: "desc" },
    take: 60,
  });
  res.json(registros);
});

const registroSchema = z.object({
  loteId: z.string().uuid(),
  fecha: z.string().datetime(),
  tipoA: z.number().int().min(0).default(0),
  tipoAA: z.number().int().min(0).default(0),
  tipoAAA: z.number().int().min(0).default(0),
  tipoJumbo: z.number().int().min(0).default(0),
  tipoB: z.number().int().min(0).default(0),
  tipoC: z.number().int().min(0).default(0),
  totiados: z.number().int().min(0).default(0),
  avesVivas: z.number().int().min(0),
  consumoConcentradoGramos: z.number().int().min(0).default(0),
});

produccionRouter.post(
  "/",
  requiereRol("ADMIN_GRANJA", "SUPERVISOR", "DIGITADOR"),
  async (req, res) => {
    const parsed = registroSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    const lote = await loteDeLaOrganizacion(parsed.data.loteId, req.auth!.organizacionId);
    if (!lote) return res.status(404).json({ error: "Lote no encontrado." });

    const registro = await prisma.registroProduccion.create({
      data: {
        ...parsed.data,
        fecha: new Date(parsed.data.fecha),
        organizacionId: req.auth!.organizacionId,
        creadoPorId: req.auth!.userId,
      },
    });
    res.status(201).json(registro);
  }
);

const edicionSchema = registroSchema.partial().extend({
  motivoEdicion: z.string().min(4, "El motivo de la edición es obligatorio."),
});

/**
 * Política de edición (ver sección 8 de la propuesta):
 * - DIGITADOR/SUPERVISOR: solo pueden editar un registro creado el MISMO día.
 * - ADMIN_GRANJA: puede editar en cualquier momento, pero el motivo es obligatorio.
 * - Nunca se sobrescribe en silencio: motivoEdicion y editadoPor/editadoEn quedan siempre.
 */
produccionRouter.patch("/:id", requiereRol("ADMIN_GRANJA", "SUPERVISOR", "DIGITADOR"), async (req, res) => {
  const parsed = edicionSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const registro = await prisma.registroProduccion.findFirst({
    where: { id: req.params.id, organizacionId: req.auth!.organizacionId, anulado: false },
  });
  if (!registro) return res.status(404).json({ error: "Registro no encontrado." });

  const esAdmin = req.auth!.rol === "ADMIN_GRANJA";
  if (!esAdmin && !esMismoDia(registro.creadoEn, new Date())) {
    return res.status(403).json({
      error: "Solo un administrador de granja puede editar registros de días anteriores.",
    });
  }

  const { motivoEdicion, fecha, ...resto } = parsed.data;
  const actualizado = await prisma.registroProduccion.update({
    where: { id: registro.id },
    data: {
      ...resto,
      ...(fecha ? { fecha: new Date(fecha) } : {}),
      editadoPorId: req.auth!.userId,
      editadoEn: new Date(),
      motivoEdicion,
    },
  });
  res.json(actualizado);
});

// "Eliminar" un registro = anularlo, nunca borrarlo (queda trazabilidad completa).
produccionRouter.patch("/:id/anular", requiereRol("ADMIN_GRANJA"), async (req, res) => {
  const motivo = z.string().min(4).safeParse(req.body?.motivoAnulacion);
  if (!motivo.success) {
    return res.status(400).json({ error: "El motivo de anulación es obligatorio." });
  }

  const registro = await prisma.registroProduccion.findFirst({
    where: { id: req.params.id, organizacionId: req.auth!.organizacionId },
  });
  if (!registro) return res.status(404).json({ error: "Registro no encontrado." });

  const actualizado = await prisma.registroProduccion.update({
    where: { id: registro.id },
    data: { anulado: true, motivoAnulacion: motivo.data },
  });
  res.json(actualizado);
});
