import { Link, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function Layout() {
  const { usuario, cerrarSesion } = useAuth();

  return (
    <div style={{ fontFamily: "sans-serif", maxWidth: 900, margin: "0 auto", padding: 16 }}>
      <nav
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid #ddd",
          paddingBottom: 12,
          marginBottom: 24,
        }}
      >
        <div style={{ display: "flex", gap: 16 }}>
          <Link to="/">Granjas</Link>
        </div>
        <div style={{ fontSize: 14, color: "#555" }}>
          {usuario?.nombre} · {usuario?.rol}{" "}
          <button onClick={cerrarSesion} style={{ marginLeft: 8 }}>
            Cerrar sesión
          </button>
        </div>
      </nav>
      <Outlet />
    </div>
  );
}
