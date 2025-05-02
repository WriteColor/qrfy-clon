export const dynamic = "force-dynamic"

import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { generateUniqueToken } from "@/lib/qr-utils"

const qrCodeSchema = z.object({
  name: z.string().min(1),
  url: z.string().url(),
})

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = qrCodeSchema.parse(body)

    // Generar token único
    const token = await generateUniqueToken()

    // Crear código QR
    const qrCode = await prisma.qr_codes.create({
      data: {
        user_id: user.id,
        token,
        name: validatedData.name,
        url: validatedData.url,
        active: true,
      },
    })

    return NextResponse.json(qrCode, { status: 201 })
  } catch (error) {
    console.error("Error creating QR code:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Datos inválidos", details: error.errors }, { status: 400 })
    }

    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}