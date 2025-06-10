"use client"

import { Button } from "@/components/ui/button"
import { Users, FileText, User, BarChart3, LogOut } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

interface SidebarProps {
  role: "admin" | "rh" | "tuteur" | "stagiaire"
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname()

  const getMenuItems = () => {
    switch (role) {
      case "admin":
        return [
          { href: "/admin", icon: BarChart3, label: "Gestion des membres" },
          { href: "/admin/stagiaires", icon: Users, label: "Gestion des stagiaires" },
          { href: "/admin/templates", icon: FileText, label: "Modèles de documents" },
          { href: "/admin/reports", icon: BarChart3, label: "Rapports" },
          { href: "/admin/profile", icon: User, label: "Mon profil" },
        ]
      case "rh":
        return [
          { href: "/rh", icon: BarChart3, label: "Statistiques" },
          { href: "/rh/documents", icon: FileText, label: "Documents" },
          { href: "/rh/statistiques", icon: BarChart3, label: "Statistiques" },
          { href: "/rh/profile", icon: User, label: "Mon profil" },
        ]
      case "tuteur":
        return [
          { href: "/tuteur", icon: Users, label: "Tuteurs" },
          { href: "/tuteur/demandes", icon: FileText, label: "Demandes" },
          { href: "/tuteur/evaluations", icon: Users, label: "Évaluations" },
          { href: "/tuteur/profile", icon: User, label: "Mon profil" },
        ]
      case "stagiaire":
        return [
          { href: "/stagiaire", icon: Users, label: "Stagiaires" },
          { href: "/stagiaire/documents", icon: FileText, label: "Mes documents" },
          { href: "/stagiaire/demandes", icon: FileText, label: "Demandes" },
          { href: "/stagiaire/profile", icon: User, label: "Mon profil" },
        ]
      default:
        return []
    }
  }

  const menuItems = getMenuItems()
  const roleTitle =
    role === "admin"
      ? "Administrateur"
      : role === "rh"
        ? "Ressources humaines"
        : role === "tuteur"
          ? "Tuteurs"
          : "Stagiaire"

  return (
    <div className="w-64 bg-gray-100 border-r border-gray-200 h-screen flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h2 className="font-semibold text-gray-800">{roleTitle}</h2>
      </div>

      <nav className="flex-1 px-4 py-2">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-3 px-3 py-3 rounded-lg mb-1 transition-colors ${
                isActive ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:bg-gray-200"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-sm">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <Link href="/auth/login">
          <Button variant="outline" className="w-full justify-start" size="sm">
            <LogOut className="h-4 w-4 mr-2" />
            Log Out
          </Button>
        </Link>
      </div>
    </div>
  )
}
