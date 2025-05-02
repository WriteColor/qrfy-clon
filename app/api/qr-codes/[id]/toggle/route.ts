export const dynamic = "force-dynamic"

import { type NextRequest, NextResponse } from "next/server"

import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const qrId = Number.parseInt(params.id)

    if (isNaN(qrId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 })
    }

    // Verificar que el QR pertenece al usuario
    const existingQR = await prisma.qr_codes.findUnique({
      where: {
        id: qrId,
        user_id: user.id,
      },
    })

    if (!existingQR) {
      return NextResponse.json({ error: "Código QR no encontrado" }, { status: 404 })
    }

    // Cambiar estado del QR
    const updatedQR = await prisma.qr_codes.update({
      where: { id: qrId },
      data: {
        active: !existingQR.active,
      },
    })

    return NextResponse.json(updatedQR)
  } catch (error) {
    console.error("Error toggling QR code:", error)

    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
