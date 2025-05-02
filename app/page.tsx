import { redirect } from "next/navigation"

import { getCurrentUser } from "@/lib/auth"

// Añadir esta configuración para indicar que es una ruta dinámica
export const dynamic = "force-dynamic"

export default async function Home() {
  const user = await getCurrentUser()

  if (user) {
    redirect("/dashboard")
  } else {
    redirect("/login")
  }
}
