"use client"

import { Button } from "@/components/ui/button"
import { Sun, Moon, Languages, Bell } from "lucide-react"
import { useTheme } from "next-themes"
import Link from "next/link"
import { useAppStore } from "@/lib/store"
import { useTranslation, languages, type Language } from "@/lib/i18n"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

interface HeaderProps {
  user?: {
    name: string
    role: string
  }
  showAuth?: boolean
}

export function Header({ user, showAuth = false }: HeaderProps) {
  const { theme, setTheme } = useTheme()
  const { language, setLanguage, notifications } = useAppStore()
  const { t } = useTranslation(language)

  const unreadNotifications = notifications.filter((n) => !n.read).length

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  const changeLanguage = (newLang: Language) => {
    setLanguage(newLang)
  }

  return (
    <header className="bg-background border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <div className="flex items-center">
            <div className="relative mr-3">
              <div className="w-8 h-8 border-2 border-blue-500 rounded-full flex items-center justify-center">
                <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full"></div>
            </div>
            <div>
              <div className="font-bold text-lg text-foreground">BRIDGE</div>
              <div className="text-sm text-blue-500 font-medium">Technologies</div>
              <div className="text-xs text-muted-foreground">Solutions</div>
            </div>
          </div>
        </Link>

        {!showAuth && (
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-foreground hover:text-blue-500 font-medium">
              {t("home")}
            </Link>
            <Link href="/contacts" className="text-foreground hover:text-blue-500 font-medium">
              {t("contacts")}
            </Link>
            <Link href="/entreprise" className="text-foreground hover:text-blue-500 font-medium">
              {t("company")}
            </Link>
            <Link href="/services" className="text-foreground hover:text-blue-500 font-medium">
              {t("services")}
            </Link>
          </nav>
        )}

        <div className="flex items-center space-x-4">
          {user && <span className="text-sm font-medium text-foreground">{t("home")}</span>}

          {/* Notifications */}
          {user && (
            <Button variant="outline" size="icon" className="relative">
              <Bell className="h-4 w-4" />
              {unreadNotifications > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                >
                  {unreadNotifications}
                </Badge>
              )}
            </Button>
          )}

          {/* Language Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Languages className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {Object.entries(languages).map(([code, lang]) => (
                <DropdownMenuItem
                  key={code}
                  onClick={() => changeLanguage(code as Language)}
                  className={language === code ? "bg-accent" : ""}
                >
                  <span className="mr-2">{lang.flag}</span>
                  {lang.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Theme Toggle */}
          <Button variant="outline" size="icon" onClick={toggleTheme}>
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </header>
  )
}
