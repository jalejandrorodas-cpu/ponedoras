-- Row-Level Security — refuerzo de aislamiento multi-tenant a nivel de base de datos.
-- Esto es una segunda capa de defensa: aunque un bug en la app olvide filtrar por
-- organizacion_id, Postgres igual bloquea el acceso cruzado entre tenants.
--
-- Cómo se usa: en cada conexión, la app debe ejecutar
--   SET app.current_org_id = '<uuid-de-la-organizacion-del-usuario-autenticado>';
-- antes de correr cualquier consulta (ver src/lib/prisma.ts).
--
-- Ejecutar después de `prisma migrate` (las tablas ya deben existir).

ALTER TABLE granjas ENABLE ROW LEVEL SECURITY;
ALTER TABLE galpones ENABLE ROW LEVEL SECURITY;
ALTER TABLE lotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE registros_produccion ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_granjas ON granjas
  USING (organizacion_id::text = current_setting('app.current_org_id', true));

CREATE POLICY tenant_isolation_galpones ON galpones
  USING (organizacion_id::text = current_setting('app.current_org_id', true));

CREATE POLICY tenant_isolation_lotes ON lotes
  USING (organizacion_id::text = current_setting('app.current_org_id', true));

CREATE POLICY tenant_isolation_registros_produccion ON registros_produccion
  USING (organizacion_id::text = current_setting('app.current_org_id', true));

CREATE POLICY tenant_isolation_usuarios ON usuarios
  USING (organizacion_id::text = current_setting('app.current_org_id', true));

-- Nota: el SUPER_ADMIN (Agroactivo) necesita saltarse esto para el panel consolidado.
-- La forma limpia es una conexión de base de datos separada (rol de Postgres distinto)
-- que no tenga RLS aplicado, usada únicamente por el módulo de reportes consolidados,
-- nunca por el resto de la app.
