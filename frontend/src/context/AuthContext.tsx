import { createContext, useContext, useState, ReactNode } from "react";

export interface UsuarioSesion {
  id: string;
  nombre: string;
  email: string;
  rol: string;
  organizacionId: string;
}

interface AuthContextValue {
  usuario: UsuarioSesion | null;
  iniciarSesion: (token: string, usuario: UsuarioSesion) => void;
  cerrarSesion: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<UsuarioSesion | null>(() => {
    const raw = localStorage.getItem("usuario");
    return raw ? (JSON.parse(raw) as UsuarioSesion) : null;
  });

  function iniciarSesion(token: string, usuario: UsuarioSesion) {
    localStorage.setItem("token", token);
    localStorage.setItem("usuario", JSON.stringify(usuario));
    setUsuario(usuario);
  }

  function cerrarSesion() {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    setUsuario(null);
  }

  return (
    <AuthContext.Provider value={{ usuario, iniciarSesion, cerrarSesion }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}
