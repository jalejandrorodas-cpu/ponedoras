import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { RutaProtegida } from "./components/RutaProtegida";
import { Layout } from "./components/Layout";
import { Login } from "./pages/Login";
import { Registro } from "./pages/Registro";
import { Granjas } from "./pages/Granjas";
import { GranjaDetalle } from "./pages/GranjaDetalle";
import { GalponDetalle } from "./pages/GalponDetalle";
import { ProduccionForm } from "./pages/ProduccionForm";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />

          <Route element={<RutaProtegida />}>
            <Route element={<Layout />}>
              <Route path="/" element={<Granjas />} />
              <Route path="/granjas/:granjaId" element={<GranjaDetalle />} />
              <Route path="/galpones/:galponId" element={<GalponDetalle />} />
              <Route path="/lotes/:loteId/produccion" element={<ProduccionForm />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
