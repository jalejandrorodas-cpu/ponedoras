import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);
  const { iniciarSesion } = useAuth();
  const navigate = useNavigate();

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError("Ingresa correo y contraseña.");
      return;
    }
    setCargando(true);
    try {
      const { data } = await api.post("/auth/login", { email, password });
      iniciarSesion(data.token, data.usuario);
      navigate("/");
    } catch (err: any) {
      setError(err.response?.data?.error || "No se pudo iniciar sesión.");
    } finally {
      setCargando(false);
    }
  }

  return (
    <div style={{ fontFamily: "sans-serif", maxWidth: 360, margin: "80px auto" }}>
      <h1 style={{ fontSize: 20 }}>Ponedoras — Agroactivo</h1>
      <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <input
          type="email"
          placeholder="Correo"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p style={{ color: "crimson", fontSize: 13 }}>{error}</p>}
        <button type="submit" disabled={cargando}>
          {cargando ? "Entrando..." : "Entrar"}
        </button>
      </form>
      <p style={{ fontSize: 13, marginTop: 12 }}>
        ¿Tu granja aún no tiene cuenta? <Link to="/registro">Crear organización</Link>
      </p>
    </div>
  );
}
