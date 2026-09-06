import { FormEvent, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../api/client";

interface Registro {
  id: string;
  fecha: string;
  tipoA: number;
  tipoAA: number;
  tipoAAA: number;
  tipoJumbo: number;
  tipoB: number;
  tipoC: number;
  totiados: number;
  avesVivas: number;
  consumoConcentradoGramos: number;
}

const CAMPOS_HUEVO: { key: keyof Registro; label: string }[] = [
  { key: "tipoA", label: "Tipo A" },
  { key: "tipoAA", label: "Tipo AA" },
  { key: "tipoAAA", label: "Tipo AAA" },
  { key: "tipoJumbo", label: "Jumbo" },
  { key: "tipoB", label: "Tipo B" },
  { key: "tipoC", label: "Tipo C" },
  { key: "totiados", label: "Totiados (rotos)" },
];

function totalHuevos(r: Registro) {
  return (
    r.tipoA + r.tipoAA + r.tipoAAA + r.tipoJumbo + r.tipoB + r.tipoC + r.totiados
  );
}

export function ProduccionForm() {
  const { loteId } = useParams();
  const [registros, setRegistros] = useState<Registro[]>([]);
  const [form, setForm] = useState<Record<string, string>>({
    tipoA: "0",
    tipoAA: "0",
    tipoAAA: "0",
    tipoJumbo: "0",
    tipoB: "0",
    tipoC: "0",
    totiados: "0",
    avesVivas: "",
    consumoConcentradoGramos: "0",
  });
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  async function cargar() {
    const { data } = await api.get<Registro[]>(`/produccion/lote/${loteId}`);
    setRegistros(data);
  }

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loteId]);

  async function guardar(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.avesVivas) {
      setError("Ingresa el número de aves vivas.");
      return;
    }
    setGuardando(true);
    try {
      await api.post("/produccion", {
        loteId,
        fecha: new Date().toISOString(),
        tipoA: Number(form.tipoA),
        tipoAA: Number(form.tipoAA),
        tipoAAA: Number(form.tipoAAA),
        tipoJumbo: Number(form.tipoJumbo),
        tipoB: Number(form.tipoB),
        tipoC: Number(form.tipoC),
        totiados: Number(form.totiados),
        avesVivas: Number(form.avesVivas),
        consumoConcentradoGramos: Number(form.consumoConcentradoGramos),
      });
      setForm((f) => ({ ...f, tipoA: "0", tipoAA: "0", tipoAAA: "0", tipoJumbo: "0", tipoB: "0", tipoC: "0", totiados: "0" }));
      cargar();
    } catch (err: any) {
      setError(err.response?.data?.error || "No se pudo guardar la producción.");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div>
      <h1 style={{ fontSize: 20 }}>Producción diaria</h1>

      <form onSubmit={guardar} style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 320 }}>
        {CAMPOS_HUEVO.map((c) => (
          <label key={c.key} style={{ fontSize: 13 }}>
            {c.label}
            <input
              type="number"
              min={0}
              value={form[c.key as string]}
              onChange={(e) => setForm((f) => ({ ...f, [c.key]: e.target.value }))}
              style={{ display: "block", width: "100%" }}
            />
          </label>
        ))}
        <label style={{ fontSize: 13 }}>
          Aves vivas
          <input
            type="number"
            min={0}
            value={form.avesVivas}
            onChange={(e) => setForm((f) => ({ ...f, avesVivas: e.target.value }))}
            style={{ display: "block", width: "100%" }}
          />
        </label>
        <label style={{ fontSize: 13 }}>
          Consumo de concentrado (gramos)
          <input
            type="number"
            min={0}
            value={form.consumoConcentradoGramos}
            onChange={(e) => setForm((f) => ({ ...f, consumoConcentradoGramos: e.target.value }))}
            style={{ display: "block", width: "100%" }}
          />
        </label>
        {error && <p style={{ color: "crimson", fontSize: 13 }}>{error}</p>}
        <button type="submit" disabled={guardando}>
          {guardando ? "Guardando..." : "Guardar producción"}
        </button>
      </form>

      <h2 style={{ fontSize: 16, marginTop: 24 }}>Historial reciente</h2>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr style={{ textAlign: "left", borderBottom: "1px solid #ccc" }}>
            <th>Fecha</th>
            <th>Total huevos</th>
            <th>Aves vivas</th>
          </tr>
        </thead>
        <tbody>
          {registros.map((r) => (
            <tr key={r.id} style={{ borderBottom: "1px solid #eee" }}>
              <td>{new Date(r.fecha).toLocaleDateString()}</td>
              <td>{totalHuevos(r)}</td>
              <td>{r.avesVivas}</td>
            </tr>
          ))}
          {registros.length === 0 && (
            <tr>
              <td colSpan={3} style={{ color: "#777", padding: "8px 0" }}>
                Aún no hay registros de producción para este lote.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
