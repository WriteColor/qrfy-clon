"use server"

import { nanoid } from "nanoid"
import { prisma } from "@/lib/prisma"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"

// Función para generar un token único
export async function generateUniqueToken(length = 6): Promise<string> {
  const generateToken = () => nanoid(length)

  let token = generateToken()
  let exists = true

  while (exists) {
    token = generateToken()
    const existingQr = await prisma.qr_codes.findUnique({
      where: { token },
    })
    exists = !!existingQr
  }

  return token
}

// Obtener la URL base desde los headers de la solicitud
export async function getBaseUrl() {
  const headersList = headers()
  const host = headersList.get("host") || "localhost:3000"
  const protocol = host.includes("localhost") ? "http" : "https"
  return `${protocol}://${host}`
}

// Crear un código QR
export async function createQRCode(name: string, url: string) {
  const user = await getCurrentUser()

  if (!user) {
    throw new Error("No autorizado")
  }

  // Validar URL
  try {
    new URL(url)
  } catch (e) {
    throw new Error("URL inválida")
  }

  // Generar un token único
  const token = await generateUniqueToken()

  // Guardar en la base de datos
  const qrCode = await prisma.qr_codes.create({
    data: {
      user_id: user.id,
      token,
      name,
      url,
      active: true,
    },
  })

  // Obtener la URL base
  const baseUrl = await getBaseUrl()

  // Devolver el código QR creado con la URL completa
  return {
    ...qrCode,
    shortUrl: `${baseUrl}/${token}`,
  }
}

// Actualizar un código QR
export async function updateQRCode(id: number, name: string, url: string) {
  const user = await getCurrentUser()

  if (!user) {
    throw new Error("No autorizado")
  }

  // Validar URL
  try {
    new URL(url)
  } catch (e) {
    throw new Error("URL inválida")
  }

  // Verificar que el QR pertenece al usuario
  const existingQR = await prisma.qr_codes.findUnique({
    where: {
      id,
      user_id: user.id,
    },
  })

  if (!existingQR) {
    throw new Error("Código QR no encontrado")
  }

  // Actualizar el código QR
  const updatedQR = await prisma.qr_codes.update({
    where: { id },
    data: {
      name,
      url,
    },
  })

  revalidatePath("/qr-codes")
  revalidatePath("/dashboard")

  return updatedQR
}

// Eliminar un código QR
export async function deleteQRCode(id: number) {
  const user = await getCurrentUser()

  if (!user) {
    throw new Error("No autorizado")
  }

  // Verificar que el QR pertenece al usuario
  const existingQR = await prisma.qr_codes.findUnique({
    where: {
      id,
      user_id: user.id,
    },
  })

  if (!existingQR) {
    throw new Error("Código QR no encontrado")
  }

  // Eliminar el código QR
  await prisma.qr_codes.delete({
    where: { id },
  })

  revalidatePath("/qr-codes")
  revalidatePath("/dashboard")

  return { success: true }
}

// Cambiar el estado de un código QR (activar/desactivar)
export async function toggleQRCodeStatus(id: number) {
  const user = await getCurrentUser()

  if (!user) {
    throw new Error("No autorizado")
  }

  // Verificar que el QR pertenece al usuario
  const existingQR = await prisma.qr_codes.findUnique({
    where: {
      id,
      user_id: user.id,
    },
  })

  if (!existingQR) {
    throw new Error("Código QR no encontrado")
  }

  // Cambiar el estado del QR
  const updatedQR = await prisma.qr_codes.update({
    where: { id },
    data: {
      active: !existingQR.active,
    },
  })

  revalidatePath("/qr-codes")
  revalidatePath("/dashboard")

  return updatedQR
}

// Obtener un código QR por su token
export async function getQRCodeByToken(token: string) {
  const qrCode = await prisma.qr_codes.findUnique({
    where: { token },
  })

  return qrCode
}

// Incrementar el contador de escaneos
export async function incrementScanCount(token: string) {
  const qrCode = await prisma.qr_codes.update({
    where: { token },
    data: {
      scan_count: {
        increment: 1,
      },
    },
  })

  return qrCode
}

// Obtener todos los códigos QR de un usuario
export async function getUserQRCodes() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  const qrCodes = await prisma.qr_codes.findMany({
    where: { user_id: user.id },
    orderBy: { created_at: "desc" },
  })

  return qrCodes
}
