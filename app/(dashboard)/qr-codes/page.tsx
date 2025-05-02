export const dynamic = "force-dynamic"

import { Suspense } from "react"
import Link from "next/link"
import { Plus } from "lucide-react"

import { requireAuth } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { QRCodesList } from "@/components/qr-codes-list"
import { Skeleton } from "@/components/ui/skeleton"

export default async function QRCodesPage() {
  const user = await requireAuth()

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mis Códigos QR</h1>
          <p className="text-muted-foreground mt-1">Gestiona todos tus códigos QR</p>
        </div>
        <Button asChild className="bg-primary hover:bg-primary/90">
          <Link href="/qr-codes/new">
            <Plus className="mr-2 h-4 w-4" />
            Crear QR
          </Link>
        </Button>
      </div>

      <Suspense fallback={<QRCodesListSkeleton />}>
        <QRCodesList userId={user.id} />
      </Suspense>
    </div>
  )
}

function QRCodesListSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="h-12 w-12" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
      ))}
    </div>
  )
}