import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/lib/theme-provider"
import { NotificationCenter } from "@/components/ui/notifications"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Bridge Technologies Solutions - Gestion des Stagiaires",
  description: "Plateforme de gestion des stagiaires avec demandes en ligne",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          {children}
          <NotificationCenter />
        </ThemeProvider>
      </body>
    </html>
  )
}
