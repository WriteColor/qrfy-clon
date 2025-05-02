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
      // Usar una ruta absoluta para evitar bucles de redirección
      return NextResponse.redirect(new URL("/error?message=QR-Code-Not-Found", request.url))
    }

    // Si el código QR está inactivo, redirigir a la página de error
    if (!qrCode.active) {
      return NextResponse.redirect(new URL("/error?message=This-QR-Code-Was-Disactivated", request.url))
    }

    // Verificar si ya existe una cookie para este token
    const hasVisitedCookie = request.cookies.get(`qr_visited_${token}`)
    
    // Obtener la URL de referencia para verificar si viene del dashboard
    const referer = request.headers.get('referer') || '';
    const isDashboardAccess = referer.includes('/dashboard') || 
                             referer.includes('/qr-codes') ||
                             request.url.includes('/dashboard') ||
                             request.url.includes('/qr-codes');
    
    // Crear la respuesta de redirección
    const response = NextResponse.redirect(qrCode.url)
    
    // Solo incrementar el contador si:
    // 1. No existe la cookie (primera visita)
    // 2. No es un acceso desde el dashboard o páginas relacionadas
    if (!hasVisitedCookie && !isDashboardAccess) {
      // Incrementar el contador de escaneos
      await incrementScanCount(token)
      
      // Establecer una cookie para evitar contar recargas como nuevas visitas
      // La cookie expirará después de 1 hora (3600 segundos)
      response.cookies.set({
        name: `qr_visited_${token}`,
        value: "true",
        maxAge: 3600,
        path: "/",
      })
    }

    return response
  } catch (error) {
    console.error("Error procesando la redirección:", error)
    return NextResponse.redirect(new URL("/error", request.url))
  }
}