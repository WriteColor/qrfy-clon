export const dynamic = "force-dynamic"

import { Suspense } from "react"
import Link from "next/link"
import { Plus, QrCode, Scan } from "lucide-react"

import { requireAuth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { QRCodesList } from "@/components/qr-codes-list"

export default async function DashboardPage() {
  const user = await requireAuth()

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">¡Bienvenido, {user.username}!</h1>
        <p className="text-muted-foreground">Gestiona tus códigos QR desde un solo lugar</p>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Resumen</h2>
        <Button asChild className="bg-primary hover:bg-primary/90">
          <Link href="/qr-codes/new">
            <Plus className="mr-2 h-4 w-4" />
            Crear QR
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="card-hover border-l-4 border-l-primary">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Códigos QR</CardTitle>
            <QrCode className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <Suspense fallback={<Skeleton className="h-7 w-16" />}>
              <QRCodeCount userId={user.id} />
            </Suspense>
          </CardContent>
        </Card>

        <Card className="card-hover border-l-4 border-l-success">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Códigos QR Activos</CardTitle>
            <QrCode className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <Suspense fallback={<Skeleton className="h-7 w-16" />}>
              <ActiveQRCodeCount userId={user.id} />
            </Suspense>
          </CardContent>
        </Card>

        <Card className="card-hover border-l-4 border-l-info">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Escaneos</CardTitle>
            <Scan className="h-4 w-4 text-info" />
          </CardHeader>
          <CardContent>
            <Suspense fallback={<Skeleton className="h-7 w-16" />}>
              <TotalScanCount userId={user.id} />
            </Suspense>
          </CardContent>
        </Card>
      </div>

      <Card className="card-hover">
        <CardHeader>
          <CardTitle>Mis Códigos QR Recientes</CardTitle>
          <CardDescription>Lista de tus códigos QR generados recientemente</CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<QRCodesListSkeleton />}>
            <QRCodesList userId={user.id} limit={5} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}

async function QRCodeCount({ userId }: { userId: number }) {
  const count = await prisma.qr_codes.count({
    where: { user_id: userId },
  })

  return (
    <div className="flex items-baseline gap-2">
      <div className="text-3xl font-bold">{count}</div>
      <div className="text-xs text-muted-foreground">códigos</div>
    </div>
  )
}

async function ActiveQRCodeCount({ userId }: { userId: number }) {
  const count = await prisma.qr_codes.count({
    where: {
      user_id: userId,
      active: true,
    },
  })

  return (
    <div className="flex items-baseline gap-2">
      <div className="text-3xl font-bold">{count}</div>
      <div className="text-xs text-muted-foreground">activos</div>
    </div>
  )
}

async function TotalScanCount({ userId }: { userId: number }) {
  const result = await prisma.qr_codes.aggregate({
    where: { user_id: userId },
    _sum: {
      scan_count: true,
    },
  })

  return (
    <div className="flex items-baseline gap-2">
      <div className="text-3xl font-bold">{result._sum.scan_count || 0}</div>
      <div className="text-xs text-muted-foreground">escaneos</div>
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