import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  // Reiniciar secuencias antes de insertar datos
  try {
    await prisma.$executeRawUnsafe(`ALTER SEQUENCE users_id_seq RESTART WITH 1;`)
  } catch (error) {
    console.warn("Advertencia: No se pudieron reiniciar las secuencias. Esto es normal en la primera ejecución.")
  }

  // Insertar usuarios de prueba
  try {
    await prisma.users.create({
      data: {
        username: "test",
        email: "test@example.com",
        password: "test",
        created_at: new Date("2024-10-28T07:25:33Z"),
        updated_at: new Date("2025-04-04T01:19:43Z")
      }
    })
    
    // Usuario adicional
    await prisma.users.create({
      data: {
        username: "1",
        email: "user1@example.com",
        password: "1",
        created_at: new Date(),
        updated_at: new Date()
      }
    })
  } catch (error) {
    console.warn("Uno o más usuarios ya existen, omitiendo creación.")
  }
}

main()
  .then(() => {
    console.log("✅ Datos insertados correctamente.")
  })
  .catch((e) => {
    console.error("❌ Error en el seed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
export{}