import type React from "react"
import Link from "next/link"
import Image from "next/image"
import { Edit, ExternalLink } from "lucide-react"

import { prisma } from "@/lib/prisma"
import { formatDate, truncateUrl } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { QRCodeActions } from "@/components/qr-code-actions"
import { getBaseUrl } from "@/app/actions"

interface QRCodesListProps {
  userId: number
  limit?: number
}

export async function QRCodesList({ userId, limit }: QRCodesListProps) {
  const qrCodes = await prisma.qr_codes.findMany({
    where: { user_id: userId },
    orderBy: { created_at: "desc" },
    take: limit,
  })

  // Obtener la URL base del servidor
  const baseUrl = await getBaseUrl()

  if (qrCodes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <div className="rounded-full bg-muted p-4 mb-4">
          <QRCodeIcon className="h-10 w-10 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium">No tienes códigos QR</h3>
        <p className="text-sm text-muted-foreground mt-1 mb-4">Crea tu primer código QR para comenzar</p>
        <Button asChild className="bg-primary hover:bg-primary/90">
          <Link href="/qr-codes/new">Crear QR</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {qrCodes.map((qr) => {
        // Usar la URL de la API para obtener la imagen del QR
        const qrImageUrl = `/api/qr-preview/${qr.token}`
        // Construir la URL de escaneo con el dominio completo
        const scanUrl = `${baseUrl}/${qr.token}`

        return (
          <div key={qr.id} className="flex flex-col gap-4 rounded-lg border p-4 md:flex-row card-hover">
            <div className="flex items-center justify-center">
              <div className="qr-preview-container relative h-32 w-32 overflow-hidden rounded-lg border bg-white p-1">
                <Image
                  src={qrImageUrl || "/placeholder.svg"}
                  alt={`QR Code for ${qr.name}`}
                  width={128}
                  height={128}
                  className="h-full w-full object-contain"
                />
              </div>
            </div>

            <div className="flex flex-1 flex-col justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{qr.name}</h3>
                  <Badge
                    className={qr.active ? "bg-success text-success-foreground" : ""}
                  >
                    {qr.active ? "Activo" : "Inactivo"}
                  </Badge>
                </div>

                <p className="text-sm text-muted-foreground">URL: {truncateUrl(qr.url)}</p>

                <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                  <span>Creado: {formatDate(qr.created_at)}</span>
                  <span>•</span>
                  <span>Escaneos: {qr.scan_count}</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 mt-2">
                <QRCodeActions qrCode={qr} scanUrl={scanUrl} qrImageUrl={qrImageUrl} />

                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="border-primary/30 text-primary hover:bg-primary/10 hover:text-primary"
                >
                  <Link href={`/qr-codes/${qr.id}/edit`}>
                    <Edit className="mr-1 h-3 w-3" />
                    Editar
                  </Link>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="border-info/30 text-info hover:bg-info/10 hover:text-info"
                >
                  <Link href={scanUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-1 h-3 w-3" />
                    Abrir
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        )
      })}

      {limit && qrCodes.length >= limit && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            asChild
            className="border-primary/30 text-primary hover:bg-primary/10 hover:text-primary"
          >
            <Link href="/qr-codes">Ver todos</Link>
          </Button>
        </div>
      )}
    </div>
  )
}

function QRCodeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="5" height="5" x="3" y="3" rx="1" />
      <rect width="5" height="5" x="16" y="3" rx="1" />
      <rect width="5" height="5" x="3" y="16" rx="1" />
      <path d="M21 16h-3a2 2 0 0 0-2 2v3" />
      <path d="M21 21v.01" />
      <path d="M12 7v3a2 2 0 0 1-2 2H7" />
      <path d="M3 12h.01" />
      <path d="M12 3h.01" />
      <path d="M12 16v.01" />
      <path d="M16 12h1" />
      <path d="M21 12v.01" />
      <path d="M12 21v-1" />
    </svg>
  )
}