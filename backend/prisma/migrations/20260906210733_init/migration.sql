-- CreateEnum
CREATE TYPE "Rol" AS ENUM ('SUPER_ADMIN', 'ADMIN_GRANJA', 'SUPERVISOR', 'DIGITADOR', 'VENDEDOR', 'CONTADOR');

-- CreateEnum
CREATE TYPE "TipoGalpon" AS ENUM ('LEVANTE', 'POSTURA', 'DESCARTE');

-- CreateEnum
CREATE TYPE "OrigenLote" AS ENUM ('POLLITA_1_DIA', 'PREPOSTURA');

-- CreateEnum
CREATE TYPE "EstadoLote" AS ENUM ('EN_CRIANZA', 'ACTIVO', 'DESCARTADO');

-- CreateTable
CREATE TABLE "organizaciones" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "nit" TEXT,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "organizaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL,
    "organizacionId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "rol" "Rol" NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "granjas" (
    "id" TEXT NOT NULL,
    "organizacionId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "granjas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "galpones" (
    "id" TEXT NOT NULL,
    "granjaId" TEXT NOT NULL,
    "organizacionId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "tipo" "TipoGalpon" NOT NULL,
    "capacidad" INTEGER NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "galpones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lotes" (
    "id" TEXT NOT NULL,
    "galponId" TEXT NOT NULL,
    "organizacionId" TEXT NOT NULL,
    "origen" "OrigenLote" NOT NULL,
    "edadIngresoSemanas" INTEGER NOT NULL,
    "fechaIngreso" TIMESTAMP(3) NOT NULL,
    "avesIniciales" INTEGER NOT NULL,
    "avesActuales" INTEGER NOT NULL,
    "estado" "EstadoLote" NOT NULL DEFAULT 'EN_CRIANZA',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lotes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "registros_produccion" (
    "id" TEXT NOT NULL,
    "loteId" TEXT NOT NULL,
    "organizacionId" TEXT NOT NULL,
    "fecha" DATE NOT NULL,
    "tipoA" INTEGER NOT NULL DEFAULT 0,
    "tipoAA" INTEGER NOT NULL DEFAULT 0,
    "tipoAAA" INTEGER NOT NULL DEFAULT 0,
    "tipoJumbo" INTEGER NOT NULL DEFAULT 0,
    "tipoB" INTEGER NOT NULL DEFAULT 0,
    "tipoC" INTEGER NOT NULL DEFAULT 0,
    "totiados" INTEGER NOT NULL DEFAULT 0,
    "avesVivas" INTEGER NOT NULL,
    "consumoConcentradoGramos" INTEGER NOT NULL DEFAULT 0,
    "creadoPorId" TEXT NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "editadoPorId" TEXT,
    "editadoEn" TIMESTAMP(3),
    "motivoEdicion" TEXT,
    "anulado" BOOLEAN NOT NULL DEFAULT false,
    "motivoAnulacion" TEXT,

    CONSTRAINT "registros_produccion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE INDEX "usuarios_organizacionId_idx" ON "usuarios"("organizacionId");

-- CreateIndex
CREATE INDEX "granjas_organizacionId_idx" ON "granjas"("organizacionId");

-- CreateIndex
CREATE INDEX "galpones_granjaId_idx" ON "galpones"("granjaId");

-- CreateIndex
CREATE INDEX "galpones_organizacionId_idx" ON "galpones"("organizacionId");

-- CreateIndex
CREATE INDEX "lotes_galponId_idx" ON "lotes"("galponId");

-- CreateIndex
CREATE INDEX "lotes_organizacionId_idx" ON "lotes"("organizacionId");

-- CreateIndex
CREATE INDEX "registros_produccion_loteId_idx" ON "registros_produccion"("loteId");

-- CreateIndex
CREATE INDEX "registros_produccion_organizacionId_idx" ON "registros_produccion"("organizacionId");

-- CreateIndex
CREATE INDEX "registros_produccion_fecha_idx" ON "registros_produccion"("fecha");

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_organizacionId_fkey" FOREIGN KEY ("organizacionId") REFERENCES "organizaciones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "granjas" ADD CONSTRAINT "granjas_organizacionId_fkey" FOREIGN KEY ("organizacionId") REFERENCES "organizaciones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "galpones" ADD CONSTRAINT "galpones_granjaId_fkey" FOREIGN KEY ("granjaId") REFERENCES "granjas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lotes" ADD CONSTRAINT "lotes_galponId_fkey" FOREIGN KEY ("galponId") REFERENCES "galpones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registros_produccion" ADD CONSTRAINT "registros_produccion_loteId_fkey" FOREIGN KEY ("loteId") REFERENCES "lotes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registros_produccion" ADD CONSTRAINT "registros_produccion_creadoPorId_fkey" FOREIGN KEY ("creadoPorId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
