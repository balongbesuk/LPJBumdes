import { NextResponse } from "next/server"
import { AUTH_COOKIE_NAME } from "@/lib/jwt"

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: "Berhasil keluar dari sistem"
  })

  // Clear JWT token cookie
  response.cookies.set(AUTH_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0, // Expire immediately
  })

  // Clear legacy cookie
  response.cookies.set("bumdes_user", "", {
    path: "/",
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: 0,
  })

  return response
}
