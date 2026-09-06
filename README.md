# Ponedoras — Agroactivo (Fase 1)

Arranque real de la plataforma multi-granja descrita en la propuesta. Esta primera versión
implementa la **Fase 1 completa** (multi-tenant, autenticación, roles, granja → galpón → lote)
más el primer formulario operativo (**producción diaria**), tal como quedó priorizado en el
roadmap.

## Qué incluye

- Backend en **Node.js + TypeScript + Express + Prisma + PostgreSQL**.
- Aislamiento multi-tenant: toda consulta filtra por `organizacionId` del token JWT, más un
  script opcional de Row-Level Security (`backend/prisma/rls.sql`) como segunda capa de defensa.
- 6 roles (`ADMIN_GRANJA`, `SUPERVISOR`, `DIGITADOR`, `VENDEDOR`, `CONTADOR`, `SUPER_ADMIN`)
  aplicados por middleware en cada ruta.
- Política de edición/anulación de producción tal como quedó definida en la propuesta: nada se
  borra físico, todo cambio retroactivo exige motivo y queda auditado.
- Galpón con `tipo` (Levante/Postura/Descarte) independiente del nombre, y lote con `origen`
  (pollita de 1 día / prepostura) — resuelve los dos puntos que quedaron pendientes del Excel.
- Frontend en **React + Vite + TypeScript**: login, alta de organización, granjas, galpones,
  lotes y el formulario de producción diaria con historial.

## Qué NO incluye todavía (queda para las siguientes fases del roadmap)

Sanidad/vacunación, ventas y despachos, facturación, cartera, gastos y reportes — Fases 2 a 6
de la propuesta. La base multi-tenant y de roles ya construida aquí es la que esos módulos van
a reutilizar, no hay que rehacerla.

## Cómo correrlo en local

Requisitos: Node.js 20+, Docker (para Postgres) o un PostgreSQL propio.

```bash
# 1. Base de datos
docker compose up -d db

# 2. Backend
cd backend
cp .env.example .env      # ajusta DATABASE_URL y JWT_SECRET si hace falta
npm install
npx prisma migrate dev --name init
npx prisma generate
npm run seed               # crea una organización de ejemplo (María Isabel) para probar
npm run dev                # http://localhost:4000

# 3. Frontend (en otra terminal)
cd frontend
cp .env.example .env
npm install
npm run dev                 # http://localhost:5173
```

Login de prueba después de `npm run seed`: `admin@mariaisabel.test` / `Cambiar123!`.

> Nota: en el sandbox donde armé este proyecto no había salida a internet hacia el CDN de
> binarios de Prisma, así que no pude correr `npx prisma generate` completo ni levantar
> Postgres para probar de punta a punta. El código sí quedó validado con TypeScript
> (`npm run typecheck` en el backend, `npx tsc -b` en el frontend, ambos sin errores). En tu
> máquina o servidor con internet normal, los comandos de arriba deberían correr sin problema —
> avísame si algo falla al correrlo tú y lo resolvemos.

## Cómo desplegar a `ponedoras.agroactivocol.com`

Siguiendo la recomendación de infraestructura de la propuesta (sección 12):

1. Levantar un VPS/cloud (DigitalOcean, Railway, Render — 2-4 vCPU / 4-8 GB para el piloto).
2. Base de datos PostgreSQL gestionada (mismo proveedor, o Supabase/Neon) con backups
   automáticos activados.
3. Backend: `npm run build && npm start` detrás de un proceso administrado (pm2, o el propio
   servicio del proveedor), variable `DATABASE_URL` apuntando a la base gestionada.
4. Frontend: `npm run build` genera estáticos en `frontend/dist/`; servirlos desde un CDN o el
   mismo servidor.
5. Apuntar `ponedoras.agroactivocol.com` (registro A o CNAME) al servidor, con certificado SSL
   automático (Let's Encrypt, o el que ofrezca el proveedor).
6. Ejecutar `backend/prisma/rls.sql` contra la base de producción para activar la segunda capa
   de aislamiento entre organizaciones.

## Próximo paso sugerido

Con esto ya se puede: crear la organización piloto, dar de alta granja → galpones (marcando
tipo) → lotes (marcando origen), y empezar a capturar producción diaria real. El siguiente
módulo a construir, según el roadmap, es **Sanidad y vacunación** (Fase 2), seguido de
**Comercial y despachos** (Fase 3).
