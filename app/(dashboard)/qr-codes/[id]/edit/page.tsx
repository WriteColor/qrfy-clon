export const dynamic = "force-dynamic"

import { notFound } from "next/navigation"

import { requireAuth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { QRCodeForm } from "@/components/qr-code-form"

interface EditQRCodePageProps {
  params: Promise<{
    id: string
  }>
}

export default async function EditQRCodePage({ params }: EditQRCodePageProps) {
  const user = await requireAuth()
  // Esperar a que se resuelvan los parámetros antes de acceder a ellos
  const resolvedParams = await params
  const qrId = Number.parseInt(resolvedParams.id)

  if (isNaN(qrId)) {
    notFound()
  }

  const qrCode = await prisma.qr_codes.findUnique({
    where: {
      id: qrId,
      user_id: user.id,
    },
  })

  if (!qrCode) {
    notFound()
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-3xl font-bold tracking-tight">Editar Código QR</h1>
      <QRCodeForm qrCode={qrCode} />
    </div>
  )
}