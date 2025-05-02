"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"

export default function Error() {
  const searchParams = useSearchParams()
  const message = searchParams.get("message") || "Ha ocurrido un error al procesar tu solicitud."

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Error</h1>
        <h2 className="text-2xl">Algo salió mal</h2>
        <p className="text-muted-foreground">{message}</p>
        <Button asChild>
          <Link href="/">Volver al inicio</Link>
        </Button>
      </div>
    </div>
  )
}
