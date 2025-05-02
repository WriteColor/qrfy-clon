"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Home, QrCode, Plus, LogOut, ChevronRight, ChevronLeft, Menu, User } from "lucide-react"

import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"
import { notify } from "@/components/ui/notification"

interface SidebarProps {
  user: {
    id: number
    username: string
    email: string
  }
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { resolvedTheme, setTheme } = useTheme()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const sidebarRef = useRef<HTMLDivElement>(null)

  // Necesario para evitar problemas de hidratación con next-themes
  useEffect(() => {
    setMounted(true)
  }, [])

  // Cerrar sidebar al hacer clic fuera de ella en móvil
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node) &&
        window.innerWidth < 768 &&
        isMobileOpen
      ) {
        setIsMobileOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isMobileOpen])

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

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      })
      notify("success", "Sesión cerrada", "Has cerrado sesión correctamente")
      router.push("/login")
    } catch (error) {
      console.error("Error logging out:", error)
      notify("error", "Error", "No se pudo cerrar sesión")
    }
  }

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark")
  }

  return (
    <>
      {/* Mobile Menu Toggle - Only visible when sidebar is closed */}
      {!isMobileOpen && (
        <div className="fixed top-4 left-4 z-50 md:hidden">
          <Button
            variant="outline"
            size="icon"
            className="rounded-full bg-background shadow-md"
            onClick={() => setIsMobileOpen(true)}
          >
            <Menu size={20} />
          </Button>
        </div>
      )}

      {/* Mobile Sidebar */}
      <div
        ref={sidebarRef}
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 md:hidden transition-transform duration-300 ease-in-out transform bg-card shadow-xl",
          isMobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center px-4">
            <div className="flex items-center gap-2">
              <QrCode className="h-6 w-6 text-primary" />
              <span className="text-lg font-bold">QR Dashboard</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <nav className="space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={cn(
                    "flex items-center rounded-lg px-3 py-2 transition-all duration-300 ease-in-out",
                    pathname === item.href
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground dark:text-foreground",
                    isCollapsed ? "justify-center" : "justify-start",
                  )}
                >
                  <div className={cn("flex items-center", isCollapsed ? "justify-center" : "")}>
                    <item.icon
                      className={cn("h-5 w-5 flex-shrink-0", isCollapsed && "transform scale-110")}
                    />
                    <span
                      className={cn(
                        "ml-3 transition-all duration-300 ease-in-out whitespace-nowrap overflow-hidden",
                        isCollapsed ? "w-0 opacity-0 absolute" : "w-auto opacity-100 relative",
                      )}
                    >
                      {item.title}
                    </span>
                  </div>
                </Link>
              ))}
            </nav>
          </div>

          <div className="border-t p-4">
            <div className="flex items-center gap-3 rounded-lg px-3 py-2">
              <Avatar>
                <AvatarFallback className="bg-primary text-primary-foreground">
                  <User>{user.username.substring(0, 2).toUpperCase()}</User>
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-medium">{user.username}</span>
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-2">
              {mounted && (
                <Button variant="ghost" className="justify-center bg-accent hover:bg-accent/70 text-white" onClick={toggleTheme}>
                  {resolvedTheme === "dark" ? (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="mr-2 h-5 w-5"
                      >
                        <circle cx="12" cy="12" r="4" />
                        <path d="M12 2v2" />
                        <path d="M12 20v2" />
                        <path d="m4.93 4.93 1.41 1.41" />
                        <path d="m17.66 17.66 1.41 1.41" />
                        <path d="M2 12h2" />
                        <path d="M20 12h2" />
                        <path d="m6.34 17.66-1.41 1.41" />
                        <path d="m19.07 4.93-1.41 1.41" />
                      </svg>
                      Modo claro
                    </>
                  ) : (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="mr-2 h-5 w-5"
                      >
                        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                      </svg>
                      Modo oscuro
                    </>
                  )}
                </Button>
              )}
              <Button
                className="justify-center bg-rose-600 ease-in-out hover:bg-rose-400"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-5 w-5" />
                Cerrar sesión
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenedor principal que incluye la sidebar y reserva su espacio */}
      <div className="flex md:flex-row">
        {/* Desktop Sidebar - Ahora con position: fixed y altura completa */}
        <div
          className={cn(
            "hidden md:block fixed top-0 left-0 h-screen border-r bg-card z-30 transition-all duration-200 ease-out",
            isCollapsed ? "w-20" : "w-64",
          )}
        >
          <div className="flex h-full flex-col">
            <div className="flex h-16 items-center justify-between px-4">
              <div
                className={cn(
                  "flex items-center gap-2 transition-all duration-300",
                  isCollapsed && "justify-center w-full",
                )}
              >
                <QrCode className="h-6 w-6 text-primary transition-transform duration-300" />
                <span
                  className={cn(
                    "text-lg font-bold transition-all duration-300 ease-in-out overflow-hidden",
                    isCollapsed ? "w-0 opacity-0 absolute" : "w-auto opacity-100 relative",
                  )}
                >
                  QR Dashboard
                </span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto py-6">
              <nav className="space-y-2 px-2">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center rounded-lg px-3 py-2 transition-all duration-300 ease-in-out",
                      pathname === item.href
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground dark:text-foreground",
                      isCollapsed ? "justify-center" : "justify-start",
                    )}
                  >
                    <div className={cn("flex items-center", isCollapsed ? "justify-center" : "")}>
                      <item.icon
                        className={cn("h-5 w-5 flex-shrink-0", isCollapsed && "transform scale-110")}
                      />
                      <span
                        className={cn(
                          "ml-3 transition-all duration-300 ease-in-out whitespace-nowrap overflow-hidden",
                          isCollapsed ? "w-0 opacity-0 absolute" : "w-auto opacity-100 relative",
                        )}
                      >
                        {item.title}
                      </span>
                    </div>
                  </Link>
                ))}
              </nav>
            </div>

            <div className="border-t p-4">
              <div className="transition-all duration-300 ease-in-out">
                {isCollapsed ? (
                  <div className="flex flex-col items-center gap-4 transition-opacity duration-300 ease-in-out">
                    <Avatar
                      className="cursor-pointer transform transition-transform duration-300 hover:scale-105"
                      onClick={() => setIsCollapsed(false)}
                    >
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {user.username.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {mounted && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={toggleTheme}
                        className="rounded-full dark:text-foreground"
                      >
                        {resolvedTheme === "dark" ? (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-5 w-5"
                          >
                            <circle cx="12" cy="12" r="4" />
                            <path d="M12 2v2" />
                            <path d="M12 20v2" />
                            <path d="m4.93 4.93 1.41 1.41" />
                            <path d="m17.66 17.66 1.41 1.41" />
                            <path d="M2 12h2" />
                            <path d="M20 12h2" />
                            <path d="m6.34 17.66-1.41 1.41" />
                            <path d="m19.07 4.93-1.41 1.41" />
                          </svg>
                        ) : (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-5 w-5"
                          >
                            <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                          </svg>
                        )}
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive dark:text-destructive-foreground"
                      onClick={handleLogout}
                    >
                      <LogOut className="h-5 w-5" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="flex bg-secondary items-center gap-3 rounded-lg px-3 py-2 transition-opacity duration-300 ease-in-out">
                      <Avatar>
                        <AvatarFallback className="bg-inherit">
                          <User className="text-white"></User>
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-sm text-white font-medium">{user.username}</span>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-col gap-2">
                      {mounted && (
                        <Button
                        variant="ghost"
                          className="justify-center bg-accent hover:bg-accent/70 text-white" onClick={toggleTheme}>
                          {resolvedTheme === "dark" ? (
                            <>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="mr-2 h-5 w-5"
                              >
                                <circle cx="12" cy="12" r="4" />
                                <path d="M12 2v2" />
                                <path d="M12 20v2" />
                                <path d="m4.93 4.93 1.41 1.41" />
                                <path d="m17.66 17.66 1.41 1.41" />
                                <path d="M2 12h2" />
                                <path d="M20 12h2" />
                                <path d="m6.34 17.66-1.41 1.41" />
                                <path d="m19.07 4.93-1.41 1.41" />
                              </svg>
                              Modo claro
                            </>
                          ) : (
                            <>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="mr-2 h-5 w-5"
                              >
                                <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                              </svg>
                              Modo oscuro
                            </>
                          )}
                        </Button>
                      )}
                      <Button
                        className="justify-center bg-rose-600 ease-in-out hover:bg-rose-400"
                        onClick={handleLogout}
                      >
                        <LogOut className="mr-2 h-5 w-5" />
                        Cerrar sesión
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Botón de colapsar/desplegar - Ahora con position: fixed */}
          <div
            className="fixed top-4 z-50 transition-all duration-200 ease-out"
            style={{ left: isCollapsed ? "63px" : "240px" }}
          >
            <Button
              variant="default"
              size="icon"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="h-8 w-8 rounded-full bg-card shadow-md border hover:text-white text-foreground transition-all duration-300 ease-in-out"
            >
              <div className="transition-transform duration-300 ease-in-out">
                {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
              </div>
            </Button>
          </div>
        </div>

        {/* Espaciador que reserva el espacio de la sidebar en el layout */}
        <div
          className={cn(
            "hidden md:block flex-shrink-0 transition-all duration-200 ease-out",
            isCollapsed ? "w-20" : "w-64",
          )}
        ></div>
      </div>
    </>
  )
}