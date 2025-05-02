import { type NextRequest, NextResponse } from "next/server"
import { getQRCodeByToken, incrementScanCount } from "@/app/actions"

// Añadir esta configuración para indicar que es una ruta dinámica
export const dynamic = "force-dynamic"

export async function GET(request: NextRequest, context: { params: Promise<{ token: string }> }) {
  // Esperar a que se resuelvan los parámetros antes de acceder a ellos
  const params = await context.params
  const token = params.token

  try {
    // Buscar el código QR en la base de datos
    const qrCode = await getQRCodeByToken(token)

    // Si no se encuentra el código QR, redirigir a la página de error
    if (!qrCode) {
      return NextResponse.redirect(new URL("/not-found", request.url))
    }

    // Si el código QR está inactivo, redirigir a la página de error
    if (!qrCode.active) {
      return NextResponse.redirect(new URL("/error?message=Este código QR ha sido desactivado", request.url))
    }

    // Incrementar el contador de escaneos
    await incrementScanCount(token)

    // Redirigir a la URL original
    return NextResponse.redirect(qrCode.url)
  } catch (error) {
    console.error("Error procesando la redirección:", error)
    return NextResponse.redirect(new URL("/error", request.url))
  }
}