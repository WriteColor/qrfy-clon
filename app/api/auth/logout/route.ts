export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"

import { logout } from "@/lib/auth"

export async function POST() {
  try {
    await logout()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error logging out:", error)

    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
