"use client"

import { useState } from "react"
import { Copy, Download, Power, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { notify } from "@/components/ui/notification"
import { useRouter } from "next/navigation"
import { deleteQRCode, toggleQRCodeStatus } from "@/app/actions"

interface QRCodeActionsProps {
  qrCode: {
    id: number
    token: string
    active: boolean
  }
  scanUrl: string
  qrImageUrl: string
}

export function QRCodeActions({ qrCode, scanUrl, qrImageUrl }: QRCodeActionsProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  const [isToggling, setIsToggling] = useState(false)

  const handleCopyLink = () => {
    navigator.clipboard.writeText(scanUrl)
    notify("success", "Enlace copiado", "El enlace ha sido copiado al portapapeles")
  }

  const handleDownloadQR = async () => {
    try {
      // Obtener la imagen del QR desde la API
      const response = await fetch(qrImageUrl)
      const blob = await response.blob()

      // Crear una URL para el blob
      const url = window.URL.createObjectURL(blob)

      // Crear un enlace para descargar
      const link = document.createElement("a")
      link.href = url
      link.download = `qr-code-${qrCode.token}.png`
      document.body.appendChild(link)
      link.click()

      // Limpiar
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      notify("success", "QR descargado", "La imagen del código QR ha sido descargada")
    } catch (error) {
      console.error("Error downloading QR code:", error)
      notify("error", "Error", "No se pudo descargar el QR")
    }
  }

  const handleToggleActive = async () => {
    try {
      setIsToggling(true)
      await toggleQRCodeStatus(qrCode.id)

      notify(
        "success",
        qrCode.active ? "QR desactivado" : "QR activado",
        qrCode.active ? "El código QR ha sido desactivado" : "El código QR ha sido activado",
      )

      router.refresh()
    } catch (error) {
      console.error("Error toggling QR code:", error)
      notify("error", "Error", "No se pudo cambiar el estado del QR")
    } finally {
      setIsToggling(false)
    }
  }

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      await deleteQRCode(qrCode.id)

      notify("success", "QR eliminado", "El código QR ha sido eliminado permanentemente")

      router.refresh()
    } catch (error) {
      console.error("Error deleting QR code:", error)
      notify("error", "Error", "No se pudo eliminar el QR")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={handleCopyLink}
        className="border-info/30 text-info hover:bg-info/10 hover:text-info dark:border-info/50 dark:text-foreground"
      >
        <Copy className="mr-1 h-3 w-3" />
        Copiar
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={handleDownloadQR}
        className="border-secondary/30 text-secondary hover:bg-secondary/10 hover:text-secondary"
      >
        <Download className="mr-1 h-3 w-3" />
        Descargar
      </Button>

      <Button
        variant={qrCode.active ? "outline" : "default"}
        size="sm"
        onClick={handleToggleActive}
        disabled={isToggling}
        className={
          qrCode.active
            ? "border-warning/30 text-warning hover:bg-warning/10 hover:text-warning"
            : "bg-success hover:bg-success/90 text-success-foreground"
        }
      >
        <Power className="mr-1 h-3 w-3" />
        {qrCode.active ? "Desactivar" : "Activar"}
      </Button>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive dark:border-destructive/50 dark:text-foreground"
          >
            <Trash2 className="mr-1 h-3 w-3" />
            Eliminar
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente este código QR y no podrá ser recuperado.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}