export const dynamic = "force-dynamic"

import { type NextRequest, NextResponse } from "next/server"
import QRCode from "qrcode"

import { prisma } from "@/lib/prisma"
import { getBaseUrl } from "@/app/actions"

export async function GET(request: NextRequest, { params }: { params: { token: string } }) {
  try {
    const { token } = params

    const qrCode = await prisma.qr_codes.findUnique({
      where: { token },
    })

    if (!qrCode) {
      return NextResponse.json({ error: "Código QR no encontrado" }, { status: 404 })
    }

    // Obtener la URL base
    const baseUrl = await getBaseUrl()
    const scanUrl = `${baseUrl}/${token}`

    // Generar la imagen QR
    const qrImageBuffer = await QRCode.toBuffer(scanUrl, {
      errorCorrectionLevel: "H",
      margin: 1,
      width: 300,
      color: {
        dark: "#000000",
        light: "#ffffff",
      },
    })

    // Devolver la imagen como respuesta
    return new NextResponse(qrImageBuffer, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=86400",
      },
    })
  } catch (error) {
    console.error("Error generating QR image:", error)

    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}