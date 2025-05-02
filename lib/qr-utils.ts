import { customAlphabet } from "nanoid"

// Crear un generador de tokens alfanuméricos (sin caracteres ambiguos)
const nanoid = customAlphabet("23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz", 6)

export function isValidUrl(url: string): boolean {
  try {
    // Asegurarse de que la URL tenga un protocolo
    const urlWithProtocol = url.startsWith("http://") || url.startsWith("https://") ? url : `https://${url}`

    new URL(urlWithProtocol)
    return true
  } catch (error) {
    return false
  }
}

export function ensureProtocol(url: string): string {
  if (!url) return url
  return url.startsWith("http://") || url.startsWith("https://") ? url : `https://${url}`
}

// Función para generar un token único
export async function generateUniqueToken(length = 6): Promise<string> {
  const generateToken = () => nanoid(length)

  const token = generateToken()
  return token
}
