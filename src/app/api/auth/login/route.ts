import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import * as crypto from "crypto"

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex")
}

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

    const passwordHash = hashPassword(password)
    if (user.passwordHash !== passwordHash) {
      return NextResponse.json(
        { success: false, error: "Password salah" },
        { status: 401 }
      )
    }

    // Success
    const response = NextResponse.json({
      success: true,
      data: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role
      }
    })

    // Set cookie for middleware role verification
    response.cookies.set("bumdes_user", JSON.stringify({
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role
    }), {
      path: "/",
      httpOnly: false, // client-side access allowed for parsing/deletion on logout
      maxAge: 60 * 60 * 24 * 7 // 7 days
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
