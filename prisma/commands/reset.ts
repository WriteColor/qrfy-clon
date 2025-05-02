import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    // Borrar todas las tablas primero
    await prisma.users.deleteMany()
    await prisma.sessions.deleteMany()
    await prisma.remember_tokens.deleteMany()
    await prisma.qr_codes.deleteMany()
    
    // Resetear autoincrementables en PostgreSQL
    // PostgreSQL usa secuencias para los autoincrementables
    try {
      await prisma.$executeRawUnsafe(`ALTER SEQUENCE users_id_seq RESTART WITH 1;`)
      await prisma.$executeRawUnsafe(`ALTER SEQUENCE remember_tokens_id_seq RESTART WITH 1;`)
      await prisma.$executeRawUnsafe(`ALTER SEQUENCE qr_codes_id_seq RESTART WITH 1;`)

    } catch (error) {
      console.warn("Advertencia: No se pudieron reiniciar algunas secuencias. Esto es normal en la primera ejecución o si las tablas aún no existen.")
    }

    console.log('✅ Base de datos vaciada y autoincrementables reiniciados.')
  } catch (error) {
    console.error('❌ Error al resetear la base de datos:', error)
    throw error
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error('❌ Error al resetear la base de datos:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
