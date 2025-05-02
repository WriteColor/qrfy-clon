// scripts/showAllData.ts
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  const usuarios = await prisma.users.findMany({ include: { sessions: true, remember_tokens: true, qr_codes: true } })
  const sesiones = await prisma.sessions.findMany()
  const tokens = await prisma.remember_tokens.findMany()
  const qrcodes = await prisma.qr_codes.findMany()

  console.log("\n👤 Usuarios:")
  console.dir(usuarios, { depth: null })

  console.log("\n🔐 Tokens:")
  console.dir(tokens, { depth: null })

  console.log("\n🌐 Sesiones:")
  console.dir(sesiones, { depth: null })
  
  console.log("\n📊 QR Codes:")
  console.dir(qrcodes, { depth: null })

  await prisma.$disconnect()
}

main().catch((e) => {
  console.error("❌ Error mostrando los datos:", e)
  prisma.$disconnect()
  process.exit(1)
})
