import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifyToken, AUTH_COOKIE_NAME } from "@/lib/jwt"

// Define role-based access rules for both page paths and API paths
const routeRules: { path: string; roles: string[] }[] = [
  { path: "/simpan-pinjam", roles: ["ADMIN", "BENDAHARA", "OPERATOR_SP"] },
  { path: "/api/simpan-pinjam", roles: ["ADMIN", "BENDAHARA", "OPERATOR_SP"] },
  
  { path: "/sewa-gedung", roles: ["ADMIN", "BENDAHARA", "OPERATOR_SEWA"] },
  { path: "/api/sewa-gedung", roles: ["ADMIN", "BENDAHARA", "OPERATOR_SEWA"] },
  
  { path: "/sewa-lahan", roles: ["ADMIN", "BENDAHARA", "OPERATOR_SEWA"] },
  { path: "/api/sewa-lahan", roles: ["ADMIN", "BENDAHARA", "OPERATOR_SEWA"] },
  
  { path: "/ppob", roles: ["ADMIN", "BENDAHARA"] },
  { path: "/api/ppob", roles: ["ADMIN", "BENDAHARA"] },
  
  { path: "/persuratan", roles: ["ADMIN", "SEKRETARIS"] },
  { path: "/api/persuratan", roles: ["ADMIN", "SEKRETARIS"] },
  
  { path: "/artikel", roles: ["ADMIN", "SEKRETARIS"] },
  { path: "/api/artikel", roles: ["ADMIN", "SEKRETARIS"] },
  
  { path: "/keuangan", roles: ["ADMIN", "BENDAHARA"] },
  { path: "/api/keuangan", roles: ["ADMIN", "BENDAHARA"] },
  
  { path: "/pengaturan", roles: ["ADMIN"] },
  { path: "/api/pengaturan", roles: ["ADMIN"] }
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 1. Let public and authentication-specific paths pass through
  if (
    pathname === "/" ||
    pathname === "/berita" ||
    pathname.startsWith("/berita/") ||
    pathname.startsWith("/layanan/") ||
    pathname === "/login" ||
    pathname === "/setup" ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/setup") ||
    pathname.includes(".") // static assets or public files
  ) {
    // If user is already logged in, redirect away from /login to dashboard root
    if (pathname === "/login") {
      const token = request.cookies.get(AUTH_COOKIE_NAME)
      if (token) {
        const payload = await verifyToken(token.value)
        if (payload) {
          return NextResponse.redirect(new URL("/dashboard", request.url))
        }
        // Token is invalid/expired, clear it and let them stay on login page
        const response = NextResponse.next()
        response.cookies.delete(AUTH_COOKIE_NAME)
        response.cookies.delete("bumdes_user")
        return response
      }
    }
    return NextResponse.next()
  }

  // 2. Retrieve JWT token from cookie
  const token = request.cookies.get(AUTH_COOKIE_NAME)

  // 3. If no token exists, redirect to login or return unauthorized
  if (!token) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { success: false, error: "Sesi Anda telah berakhir. Silakan masuk kembali." },
        { status: 401 }
      )
    }
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // 4. Verify JWT token
  const payload = await verifyToken(token.value)
  if (!payload) {
    // Token expired or invalid
    const response = pathname.startsWith("/api/")
      ? NextResponse.json({ success: false, error: "Sesi tidak valid atau telah berakhir." }, { status: 401 })
      : NextResponse.redirect(new URL("/login", request.url))
    
    response.cookies.delete(AUTH_COOKIE_NAME)
    response.cookies.delete("bumdes_user")
    return response
  }

  // 5. Check role-based route permissions
  return checkRoleAccess(pathname, payload.role, request)
}

function checkRoleAccess(pathname: string, role: string, request: NextRequest) {
  // Sorting rules by length descending to match the most specific path first
  const matchedRule = routeRules
    .sort((a, b) => b.path.length - a.path.length)
    .find(
      (rule) => pathname === rule.path || pathname.startsWith(rule.path + "/")
    )

  if (matchedRule && !matchedRule.roles.includes(role)) {
    // User does not have authorization for this path
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { success: false, error: "Anda tidak memiliki akses ke fitur ini." },
        { status: 403 }
      )
    }
    // Redirect web page navigation to dashboard home
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public folder files)
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
}
