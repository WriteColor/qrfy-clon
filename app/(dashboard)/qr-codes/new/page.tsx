export const dynamic = "force-dynamic"

import { requireAuth } from "@/lib/auth"
import { QRCodeForm } from "@/components/qr-code-form"

export default async function NewQRCodePage() {
  await requireAuth()

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-3xl font-bold tracking-tight">Crear Código QR</h1>
      <QRCodeForm />
    </div>
  )
}