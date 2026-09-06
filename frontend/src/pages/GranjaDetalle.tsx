import { FormEvent, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api/client";

interface Galpon {
  id: string;
  nombre: string;
  tipo: "LEVANTE" | "POSTURA" | "DESCARTE";
  capacidad: number;
}

const TIPOS = [
  { value: "LEVANTE", label: "Levante (cría de pollitas)" },
  { value: "POSTURA", label: "Postura" },
  { value: "DESCARTE", label: "Descarte / cuarentena" },
];

export function GranjaDetalle() {
  const { granjaId } = useParams();
  const [galpones, setGalpones] = useState<Galpon[]>([]);
  const [nombre, setNombre] = useState("");
  const [tipo, setTipo] = useState<Galpon["tipo"]>("POSTURA");
  const [capacidad, setCapacidad] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function cargar() {
    const { data } = await api.get<Galpon[]>(`/galpones/granja/${granjaId}`);
    setGalpones(data);
  }

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [granjaId]);

  async function crear(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await api.post("/galpones", {
        granjaId,
        nombre,
        tipo,
        capacidad: Number(capacidad),
      });
      setNombre("");
      setCapacidad("");
      cargar();
    } catch (err: any) {
      setError(err.response?.data?.error || "No se pudo crear el galpón.");
    }
  }

  return (
    <div>
      <p>
        <Link to="/">← Granjas</Link>
      </p>
      <h1 style={{ fontSize: 20 }}>Galpones</h1>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {galpones.map((g) => (
          <li key={g.id} style={{ padding: "10px 0", borderBottom: "1px solid #eee" }}>
            <Link to={`/galpones/${g.id}`}>{g.nombre}</Link>{" "}
            <span style={{ fontSize: 12, color: "#777" }}>
              ({TIPOS.find((t) => t.value === g.tipo)?.label}, cap. {g.capacidad})
            </span>
          </li>
        ))}
        {galpones.length === 0 && <p style={{ color: "#777" }}>Sin galpones todavía.</p>}
      </ul>

      <h2 style={{ fontSize: 16, marginTop: 24 }}>Crear galpón</h2>
      <p style={{ fontSize: 12, color: "#777" }}>
        El nombre es libre — puede ser "Galpón BB" o cualquier otro; el tipo es lo que usa el
        sistema para el calendario y las alertas.
      </p>
      <form onSubmit={crear} style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <input placeholder="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} />
        <select value={tipo} onChange={(e) => setTipo(e.target.value as Galpon["tipo"])}>
          {TIPOS.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
        <input
          type="number"
          placeholder="Capacidad (aves)"
          value={capacidad}
          onChange={(e) => setCapacidad(e.target.value)}
        />
        <button type="submit">Crear</button>
      </form>
      {error && <p style={{ color: "crimson", fontSize: 13 }}>{error}</p>}
    </div>
  );
}
