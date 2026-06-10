import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { comparePassword, hashPassword, isLegacyHash } from "@/lib/auth"
import { signToken, AUTH_COOKIE_NAME, getAuthCookieOptions } from "@/lib/jwt"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { username, password } = body

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: "Username and password are required" },
        { status: 400 }
      )
    }

    const user = await db.user.findUnique({
      where: { username }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Username tidak terdaftar" },
        { status: 401 }
      )
    }

    // Verify password (supports both bcrypt and legacy SHA-256)
    const isValid = await comparePassword(password, user.passwordHash)
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: "Password salah" },
        { status: 401 }
      )
    }

    // Auto-migrate legacy SHA-256 hash to bcrypt on successful login
    if (isLegacyHash(user.passwordHash)) {
      const bcryptHash = await hashPassword(password)
      await db.user.update({
        where: { id: user.id },
        data: { passwordHash: bcryptHash },
      })
    }

    // Generate JWT token
    const token = await signToken({
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
    })

    // Build response with user data (for client-side display)
    const response = NextResponse.json({
      success: true,
      data: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role
      }
    })

    // Set secure HttpOnly JWT cookie
    const cookieOptions = getAuthCookieOptions()
    response.cookies.set(AUTH_COOKIE_NAME, token, cookieOptions)

    // Also set legacy cookie for backward compatibility during transition
    // This ensures client-side code that reads bumdes_user still works
    response.cookies.set("bumdes_user", JSON.stringify({
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role
    }), {
      path: "/",
      httpOnly: false,
      maxAge: 60 * 60 * 24 * 7
    })

    return response
  } catch (error: any) {
    console.error("Auth error:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Authentication failed" },
      { status: 500 }
    )
  }
}
