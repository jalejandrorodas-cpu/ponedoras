import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";

export function Registro() {
  const [nombreOrganizacion, setNombreOrganizacion] = useState("");
  const [nombreAdmin, setNombreAdmin] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);
  const { iniciarSesion } = useAuth();
  const navigate = useNavigate();

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setCargando(true);
    try {
      const { data } = await api.post("/auth/registro", {
        nombreOrganizacion,
        nombreAdmin,
        email,
        password,
      });
      iniciarSesion(data.token, { ...data.usuario, organizacionId: data.organizacion.id });
      navigate("/");
    } catch (err: any) {
      setError(err.response?.data?.error?.formErrors?.[0] || err.response?.data?.error || "No se pudo crear la cuenta.");
    } finally {
      setCargando(false);
    }
  }

  return (
    <div style={{ fontFamily: "sans-serif", maxWidth: 380, margin: "60px auto" }}>
      <h1 style={{ fontSize: 20 }}>Crear organización</h1>
      <p style={{ fontSize: 13, color: "#555" }}>
        Este formulario crea tu organización (avicultor) y tu usuario administrador. Durante el
        piloto, este alta la hace un admin de Agroactivo contigo al lado — más adelante será
        autoservicio.
      </p>
      <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <input
          placeholder="Nombre de la granja/organización"
          value={nombreOrganizacion}
          onChange={(e) => setNombreOrganizacion(e.target.value)}
        />
        <input
          placeholder="Tu nombre"
          value={nombreAdmin}
          onChange={(e) => setNombreAdmin(e.target.value)}
        />
        <input
          type="email"
          placeholder="Correo"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Contraseña (mín. 8 caracteres)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p style={{ color: "crimson", fontSize: 13 }}>{error}</p>}
        <button type="submit" disabled={cargando}>
          {cargando ? "Creando..." : "Crear organización"}
        </button>
      </form>
      <p style={{ fontSize: 13, marginTop: 12 }}>
        ¿Ya tienes cuenta? <Link to="/login">Entrar</Link>
      </p>
    </div>
  );
}
