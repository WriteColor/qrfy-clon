export const dynamic = "force-dynamic"

import type React from "react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { LoginForm } from "@/components/login-form"

export default async function LoginPage() {
  const user = await getCurrentUser()

  if (user) {
    redirect("/dashboard")
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Left side - Branding */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-primary to-purple-600 text-white p-8 flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-12">
            <QrCodeIcon className="h-8 w-8" />
            <h1 className="text-2xl font-bold">QR Dashboard</h1>
          </div>
          <div className="max-w-md">
            <h2 className="text-4xl font-bold mb-6">Bienvenido de nuevo</h2>
            <p className="text-lg opacity-90">
              Accede a tu cuenta para gestionar tus códigos QR, ver estadísticas y mucho más.
            </p>
          </div>
        </div>
        <div className="space-y-6">
          <div className="flex items-start space-x-4">
            <div className="bg-white/20 p-2 rounded-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                <path d="M5 7 3 5l2-2" />
                <path d="M9 5h10" />
                <path d="M17 13H7" />
                <path d="M11 21h6" />
                <path d="M17 17h2a2 2 0 0 0 2-2v-5" />
                <path d="M14 2c1.82 1.97 2 5.5 2 9 0 3.5-.18 7.03-2 9" />
                <path d="M10 2C8.18 3.97 8 7.5 8 11c0 3.5.18 7.03 2 9" />
              </svg>
            </div>
            <div>
              <h3 className="font-medium">Fácil de usar</h3>
              <p className="text-sm opacity-80">Crea y gestiona códigos QR en segundos</p>
            </div>
          </div>
          <div className="flex items-start space-x-4">
            <div className="bg-white/20 p-2 rounded-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                <path d="M12 2v20" />
                <path d="m17 5-5-3-5 3" />
                <path d="m17 19-5 3-5-3" />
                <path d="M2 12h20" />
                <path d="m5 17 3-5-3-5" />
                <path d="m19 17-3-5 3-5" />
              </svg>
            </div>
            <div>
              <h3 className="font-medium">Estadísticas detalladas</h3>
              <p className="text-sm opacity-80">Analiza el rendimiento de tus códigos QR</p>
            </div>
          </div>
          <div className="flex items-start space-x-4">
            <div className="bg-white/20 p-2 rounded-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                <path d="m9 12 2 2 4-4" />
              </svg>
            </div>
            <div>
              <h3 className="font-medium">Seguro y confiable</h3>
              <p className="text-sm opacity-80">Tus datos están protegidos en todo momento</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center md:text-left">
            <div className="flex items-center gap-2 justify-center md:justify-start md:hidden mb-8">
              <QrCodeIcon className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold">QR Dashboard</h1>
            </div>
            <h2 className="text-2xl font-bold tracking-tight">Iniciar sesión</h2>
            <p className="text-sm text-muted-foreground mt-2">Ingresa tus credenciales para acceder a tu cuenta</p>
          </div>

          <LoginForm />

          <div className="text-center md:text-left">
            <p className="text-sm text-muted-foreground">
              ¿No tienes una cuenta?{" "}
              <Link href="/register" className="text-primary font-medium hover:underline">
                Regístrate
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function QrCodeIcon(props: React.SVGProps<SVGSVGElement>) {
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