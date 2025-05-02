"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Plus, QrCode } from "lucide-react"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

interface NavProps {
  mobile?: boolean
}

export function DashboardNav({ mobile }: NavProps) {
  const pathname = usePathname()

  const navItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: Home,
    },
    {
      title: "Mis QR",
      href: "/qr-codes",
      icon: QrCode,
    },
    {
      title: "Crear QR",
      href: "/qr-codes/new",
      icon: Plus,
    },
  ]

  return (
    <nav className={cn("flex gap-4", mobile && "flex-col")}>
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            buttonVariants({ variant: "ghost" }),
            pathname === item.href ? "bg-muted hover:bg-muted" : "hover:bg-transparent hover:underline",
            "justify-start",
          )}
        >
          <item.icon className="mr-2 h-4 w-4" />
          {item.title}
        </Link>
      ))}
    </nav>
  )
}
