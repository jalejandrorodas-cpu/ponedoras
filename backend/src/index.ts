import "dotenv/config";
import express from "express";
import cors from "cors";
import { authRouter } from "./modules/auth/auth.routes";
import { organizacionesRouter } from "./modules/organizaciones/organizaciones.routes";
import { granjasRouter } from "./modules/granjas/granjas.routes";
import { galponesRouter } from "./modules/galpones/galpones.routes";
import { lotesRouter } from "./modules/lotes/lotes.routes";
import { produccionRouter } from "./modules/produccion/produccion.routes";

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));
app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/auth", authRouter);
app.use("/organizaciones", organizacionesRouter);
app.use("/granjas", granjasRouter);
app.use("/galpones", galponesRouter);
app.use("/lotes", lotesRouter);
app.use("/produccion", produccionRouter);

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
app.listen(PORT, () => {
  console.log(`Ponedoras API escuchando en http://localhost:${PORT}`);
});
