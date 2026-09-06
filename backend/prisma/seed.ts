import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("Cambiar123!", 12);

  const org = await prisma.organizacion.create({
    data: {
      nombre: "Huevos María Isabel",
      nit: "900000000-1",
      usuarios: {
        create: {
          nombre: "María Isabel",
          email: "admin@mariaisabel.test",
          passwordHash,
          rol: "ADMIN_GRANJA",
        },
      },
      granjas: {
        create: {
          nombre: "Granja Santa Isabel",
          galpones: {
            create: [
              { nombre: "Galpón 1", tipo: "POSTURA", capacidad: 1100, organizacionId: "" },
              { nombre: "Galpón BB", tipo: "LEVANTE", capacidad: 3200, organizacionId: "" },
            ],
          },
        },
      },
    },
  });

  // Prisma no permite referenciar organizacionId del padre dentro del create anidado
  // de arriba, así que lo corregimos aquí (más simple que anidar tres niveles a mano).
  await prisma.galpon.updateMany({
    where: { granja: { organizacionId: org.id } },
    data: { organizacionId: org.id },
  });

  console.log("Seed lista.");
  console.log("Login de prueba -> email: admin@mariaisabel.test | password: Cambiar123!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
