import { FormEvent, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";

interface Granja {
  id: string;
  nombre: string;
}

export function Granjas() {
  const [granjas, setGranjas] = useState<Granja[]>([]);
  const [nombre, setNombre] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function cargar() {
    const { data } = await api.get<Granja[]>("/granjas");
    setGranjas(data);
  }

  useEffect(() => {
    cargar();
  }, []);

  async function crear(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await api.post("/granjas", { nombre });
      setNombre("");
      cargar();
    } catch (err: any) {
      setError(err.response?.data?.error || "No se pudo crear la granja.");
    }
  }

  return (
    <div>
      <h1 style={{ fontSize: 20 }}>Tus granjas</h1>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {granjas.map((g) => (
          <li key={g.id} style={{ padding: "10px 0", borderBottom: "1px solid #eee" }}>
            <Link to={`/granjas/${g.id}`}>{g.nombre}</Link>
          </li>
        ))}
        {granjas.length === 0 && <p style={{ color: "#777" }}>Aún no tienes granjas creadas.</p>}
      </ul>

      <h2 style={{ fontSize: 16, marginTop: 24 }}>Crear nueva granja</h2>
      <form onSubmit={crear} style={{ display: "flex", gap: 8 }}>
        <input
          placeholder="Nombre de la granja"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />
        <button type="submit">Crear</button>
      </form>
      {error && <p style={{ color: "crimson", fontSize: 13 }}>{error}</p>}
    </div>
  );
}
