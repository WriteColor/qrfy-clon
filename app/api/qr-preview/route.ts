export const dynamic = "force-dynamic"

import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import QRCode from "qrcode"

import { isValidUrl } from "@/lib/qr-utils"

const previewSchema = z.object({
  url: z.string().url(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = previewSchema.parse(body)

    if (!isValidUrl(validatedData.url)) {
      return NextResponse.json({ error: "URL inválida" }, { status: 400 })
    }

    // Generar la imagen QR
    const qrImageBuffer = await QRCode.toBuffer(validatedData.url, {
      errorCorrectionLevel: "H",
      margin: 1,
      width: 300,
      color: {
        dark: "#000000",
        light: "#ffffff",
      },
    })

    // Convertir el buffer a base64 para devolverlo como data URL
    const qrImageBase64 = qrImageBuffer.toString("base64")
    const qrImageUrl = `data:image/png;base64,${qrImageBase64}`

    return NextResponse.json({ qrImageUrl })
  } catch (error) {
    console.error("Error generating QR preview:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Datos inválidos", details: error.errors }, { status: 400 })
    }

    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}