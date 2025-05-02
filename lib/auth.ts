import { compare, hash } from "bcryptjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { v4 as uuidv4 } from "uuid"

import { prisma } from "./prisma"

export async function hashPassword(password: string) {
  return await hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string) {
  return await compare(password, hashedPassword)
}

export async function getSession() {
  try {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get("session_id")?.value

    if (!sessionId) {
      return null
    }

    const session = await prisma.sessions.findUnique({
      where: {
        id: sessionId,
      },
      include: {
        users: true,
      },
    })

    if (!session || session.expires_at < Date.now()) {
      return null
    }

    return session
  } catch (error) {
    console.error("Error getting session:", error)
    return null
  }
}

export async function getCurrentUser() {
  try {
    const session = await getSession()

    if (!session) {
      return null
    }

    return session.users
  } catch (error) {
    console.error("Error getting current user:", error)
    return null
  }
}

export async function requireAuth() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  return user
}

export async function createSession(userId: number, ipAddress: string, userAgent?: string) {
  const sessionId = uuidv4()
  const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000 // 30 days

  await prisma.sessions.create({
    data: {
      id: sessionId,
      user_id: userId,
      ip_address: ipAddress,
      user_agent: userAgent,
      last_activity: Math.floor(Date.now() / 1000),
      expires_at: BigInt(expiresAt),
    },
  })

  ;(await cookies()).set("session_id", sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    path: "/",
  })
}

export async function logout() {
  try {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get("session_id")?.value

    if (sessionId) {
      await prisma.sessions.delete({
        where: {
          id: sessionId,
        },
      })
    }

    cookieStore.delete("session_id")
  } catch (error) {
    console.error("Error logging out:", error)
  }
}