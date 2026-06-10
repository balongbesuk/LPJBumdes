import type { Metadata } from "next"
import { Plus_Jakarta_Sans } from "next/font/google"
import "./globals.css"

const fontSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
})

export const metadata: Metadata = {
  title: "BUMDES Barokah Balongbesuk - Sistem Informasi Manajemen",
  description: "Aplikasi internal manajemen BUMDES Barokah Balongbesuk dan otomasi Laporan Pertanggungjawaban (LPJ)",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="id" className={`${fontSans.variable} scroll-smooth`}>
      <body className="font-sans antialiased min-h-screen bg-background text-foreground">
        {children}
      </body>
    </html>
  )
}
