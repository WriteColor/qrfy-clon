import type React from "react"
import { redirect } from "next/navigation"

import { getCurrentUser } from "@/lib/auth"
import { Sidebar } from "@/components/sidebar"

export const dynamic = "force-dynamic"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar user={user} />
      <div className="flex-1 w-full">
        <header className="h-16 border-b bg-background/95 backdrop-blur sticky top-0 z-20 flex items-center px-6 md:px-8">
          <div className="w-full max-w-screen-2xl mx-auto">
            <div className="flex items-center justify-between">
              <div className="md:hidden w-8"></div>
              <div className="flex-1"></div>
            </div>
          </div>
        </header>
        <main className="p-6 md:p-8 bg-background pt-16 md:pt-6">{children}</main>
      </div>
    </div>
  )
}