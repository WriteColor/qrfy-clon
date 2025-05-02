"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { notify } from "@/components/ui/notification"
import { Card } from "@/components/ui/card"
import { ensureProtocol, isValidUrl } from "@/lib/qr-utils"
import { createQRCode, updateQRCode } from "@/app/actions"
import { Copy } from "lucide-react"

const formSchema = z.object({
  name: z.string().min(1, {
    message: "El nombre es obligatorio",
  }),
  url: z.string().refine(
    (value) => {
      try {
        // Intentar crear una URL con el valor proporcionado
        const urlWithProtocol = value.startsWith("http") ? value : `https://${value}`
        new URL(urlWithProtocol)
        return true
      } catch (error) {
        return false
      }
    },
    {
      message: "Debe ser una URL válida",
    },
  ),
})

type FormValues = z.infer<typeof formSchema>

interface QRCodeFormProps {
  qrCode?: {
    id: number
    name: string
    url: string
    token: string
  }
}

export function QRCodeForm({ qrCode }: QRCodeFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(qrCode ? `/api/qr-preview/${qrCode.token}` : null)
  const [shortUrl, setShortUrl] = useState<string | null>(null)
  const [baseUrl, setBaseUrl] = useState("")

  useEffect(() => {
    // Obtener la URL base del navegador
    setBaseUrl(window.location.origin)
  }, [])

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: qrCode?.name || "",
      url: qrCode?.url || "",
    },
  })

  // Efecto para formatear la URL al cargar el formulario
  useEffect(() => {
    const currentUrl = form.getValues("url")
    if (currentUrl && !currentUrl.startsWith("http")) {
      form.setValue("url", ensureProtocol(currentUrl))
    }

    // Si hay un código QR, establecer la URL corta
    if (qrCode && baseUrl) {
      setShortUrl(`${baseUrl}/${qrCode.token}`)
    }
  }, [form, qrCode, baseUrl])

  const onSubmit = async (data: FormValues) => {
    try {
      setIsSubmitting(true)

      // Asegurarse de que la URL tenga el protocolo correcto
      const formattedData = {
        ...data,
        url: ensureProtocol(data.url),
      }

      if (qrCode) {
        // Actualizar código QR existente
        await updateQRCode(qrCode.id, formattedData.name, formattedData.url)
        notify("success", "QR actualizado", "El código QR ha sido actualizado correctamente")
      } else {
        // Crear nuevo código QR
        const result = await createQRCode(formattedData.name, formattedData.url)
        // Asegurarse de usar la URL base del navegador para la URL acortada
        setShortUrl(`${baseUrl}/${result.token}`)
        setPreviewUrl(`/api/qr-preview/${result.token}`)
        notify("success", "QR creado", "El código QR ha sido creado correctamente")
      }

      if (!qrCode) {
        // Solo redirigir si estamos creando un nuevo QR
        setTimeout(() => {
          router.push("/qr-codes")
          router.refresh()
        }, 2000)
      }
    } catch (error) {
      console.error("Error saving QR code:", error)
      notify("error", "Error", "No se pudo guardar el código QR")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePreview = async () => {
    let url = form.getValues("url")

    // Asegurarse de que la URL tenga el protocolo correcto
    url = ensureProtocol(url)

    if (!url || !isValidUrl(url)) {
      form.setError("url", {
        type: "manual",
        message: "Ingresa una URL válida para generar la vista previa",
      })
      return
    }

    try {
      const response = await fetch("/api/qr-preview", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      })

      if (!response.ok) {
        throw new Error("Error al generar la vista previa")
      }

      const data = await response.json()
      setPreviewUrl(data.qrImageUrl)
    } catch (error) {
      console.error("Error generating preview:", error)
      notify("error", "Error", "No se pudo generar la vista previa")
    }
  }

  const copyToClipboard = () => {
    if (shortUrl) {
      navigator.clipboard.writeText(shortUrl)
      notify("success", "Enlace copiado", "El enlace ha sido copiado al portapapeles")
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input placeholder="Mi sitio web" {...field} />
                  </FormControl>
                  <FormDescription>Un nombre descriptivo para identificar este código QR</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="ejemplo.com"
                      {...field}
                      onChange={(e) => {
                        // Eliminar http:// o https:// al inicio para evitar duplicados
                        const value = e.target.value.replace(/^https?:\/\//, "")
                        field.onChange(value)
                      }}
                      onBlur={(e) => {
                        // Al perder el foco, asegurarse de que tenga el protocolo
                        const formattedUrl = ensureProtocol(e.target.value)
                        field.onChange(formattedUrl)
                      }}
                    />
                  </FormControl>
                  <FormDescription>La URL a la que redirigirá este código QR</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {shortUrl && (
              <div className="space-y-2">
                <FormLabel>URL acortada</FormLabel>
                <div className="flex items-center gap-2">
                  <Input value={shortUrl} readOnly className="flex-1" />
                  <Button type="button" variant="outline" size="icon" onClick={copyToClipboard}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <FormDescription>Comparte esta URL para acceder directamente al destino</FormDescription>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handlePreview}
                className="border-info/30 text-info hover:bg-info/10 hover:text-info"
              >
                Vista previa
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-primary hover:bg-primary/90">
                {isSubmitting ? (
                  <div className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    {qrCode ? "Actualizando..." : "Creando..."}
                  </div>
                ) : qrCode ? (
                  "Actualizar"
                ) : (
                  "Crear"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>

      <div className="flex flex-col items-center justify-center">
        {previewUrl ? (
          <Card className="flex h-64 w-64 items-center justify-center bg-white p-4 qr-preview-container">
            <Image
              src={previewUrl || "/placeholder.svg"}
              alt="Vista previa del código QR"
              width={200}
              height={200}
              className="h-auto w-auto"
            />
          </Card>
        ) : (
          <div className="flex h-64 w-64 flex-col items-center justify-center rounded-lg border border-dashed p-4 text-center">
            <p className="text-sm text-muted-foreground">
              Ingresa una URL válida y haz clic en "Vista previa" para ver el código QR
            </p>
          </div>
        )}
      </div>
    </div>
  )
}