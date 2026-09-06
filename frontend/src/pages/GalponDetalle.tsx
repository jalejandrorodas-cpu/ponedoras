import { FormEvent, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api/client";

interface Lote {
  id: string;
  origen: "POLLITA_1_DIA" | "PREPOSTURA";
  edadIngresoSemanas: number;
  fechaIngreso: string;
  avesIniciales: number;
  avesActuales: number;
  estado: string;
}

export function GalponDetalle() {
  const { galponId } = useParams();
  const [lotes, setLotes] = useState<Lote[]>([]);
  const [origen, setOrigen] = useState<Lote["origen"]>("POLLITA_1_DIA");
  const [edadIngresoSemanas, setEdad] = useState("0");
  const [fechaIngreso, setFecha] = useState("");
  const [avesIniciales, setAves] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function cargar() {
    const { data } = await api.get<Lote[]>(`/lotes/galpon/${galponId}`);
    setLotes(data);
  }

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [galponId]);

  async function crear(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!fechaIngreso || !avesIniciales) {
      setError("Completa fecha de ingreso y aves iniciales.");
      return;
    }
    try {
      await api.post("/lotes", {
        galponId,
        origen,
        edadIngresoSemanas: Number(edadIngresoSemanas),
        fechaIngreso: new Date(fechaIngreso).toISOString(),
        avesIniciales: Number(avesIniciales),
      });
      setFecha("");
      setAves("");
      cargar();
    } catch (err: any) {
      setError(err.response?.data?.error || "No se pudo crear el lote.");
    }
  }

  return (
    <div>
      <h1 style={{ fontSize: 20 }}>Lotes</h1>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {lotes.map((l) => (
          <li key={l.id} style={{ padding: "10px 0", borderBottom: "1px solid #eee" }}>
            <Link to={`/lotes/${l.id}/produccion`}>
              Lote desde {new Date(l.fechaIngreso).toLocaleDateString()}
            </Link>{" "}
            <span style={{ fontSize: 12, color: "#777" }}>
              ({l.origen === "POLLITA_1_DIA" ? "Pollita de 1 día" : "Prepostura"}, ingresó a las{" "}
              {l.edadIngresoSemanas} sem., {l.avesActuales} aves, {l.estado})
            </span>
          </li>
        ))}
        {lotes.length === 0 && <p style={{ color: "#777" }}>Sin lotes todavía.</p>}
      </ul>

      <h2 style={{ fontSize: 16, marginTop: 24 }}>Registrar lote nuevo</h2>
      <p style={{ fontSize: 12, color: "#777" }}>
        Si el lote entra ya en prepostura, el calendario se calcula desde la edad real de
        ingreso, no desde una crianza fija de 20 semanas.
      </p>
      <form onSubmit={crear} style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <select value={origen} onChange={(e) => setOrigen(e.target.value as Lote["origen"])}>
          <option value="POLLITA_1_DIA">Pollita de 1 día</option>
          <option value="PREPOSTURA">Pollona en prepostura</option>
        </select>
        <input
          type="number"
          placeholder="Edad de ingreso (semanas)"
          value={edadIngresoSemanas}
          onChange={(e) => setEdad(e.target.value)}
        />
        <input type="date" value={fechaIngreso} onChange={(e) => setFecha(e.target.value)} />
        <input
          type="number"
          placeholder="Aves iniciales"
          value={avesIniciales}
          onChange={(e) => setAves(e.target.value)}
        />
        <button type="submit">Crear lote</button>
      </form>
      {error && <p style={{ color: "crimson", fontSize: 13 }}>{error}</p>}
    </div>
  );
}
