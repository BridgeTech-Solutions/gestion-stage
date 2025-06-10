"use client"

import type React from "react"

import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { mockUsers } from "@/lib/mock-data"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Vérification avec les comptes factices
    const user = mockUsers.find((u) => u.email === email && u.password === password)

    if (user) {
      // Redirection selon le rôle
      switch (user.role) {
        case "admin":
          router.push("/admin")
          break
        case "rh":
          router.push("/rh")
          break
        case "tuteur":
          router.push("/tuteur")
          break
        case "stagiaire":
          router.push("/stagiaire")
          break
        default:
          router.push("/")
      }
    } else {
      setError("Email ou mot de passe incorrect")
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header showAuth />

      <main className="flex-1 flex">
        <div
          className="w-1/2 bg-cover bg-center"
          style={{ backgroundImage: "url('/placeholder.svg?height=600&width=800')" }}
        ></div>

        <div className="w-1/2 bg-gray-100 flex items-center justify-center p-8">
          <div className="w-full max-w-md space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900">Connexion à votre compte Bridge</h2>
            </div>

            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1"
                  required
                />
              </div>

              <div>
                <Label htmlFor="password">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1"
                  required
                />
              </div>

              <Button type="submit" className="w-full bg-black text-white hover:bg-gray-800">
                Se connecter
              </Button>

              <div className="text-center">
                <span className="text-gray-500">ou</span>
              </div>

              <div className="text-center">
                <span className="text-sm text-gray-600">Vous n'avez pas de compte? </span>
                <Link href="/auth/register" className="text-blue-600 hover:underline">
                  S'inscrire
                </Link>
              </div>

              <div className="text-xs text-center text-gray-500">
                En vous connectant vous acceptez nos{" "}
                <a href="#" className="underline">
                  politiques de confidentialité
                </a>{" "}
                et nos{" "}
                <a href="#" className="underline">
                  conditions d'utilisation
                </a>
              </div>
            </form>

            {/* Comptes de test */}
            <div className="mt-8 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-sm mb-2">Comptes de test :</h3>
              <div className="text-xs space-y-1">
                <div>
                  <strong>Admin:</strong> admin@bridge-tech.com / admin123
                </div>
                <div>
                  <strong>RH:</strong> rh@bridge-tech.com / rh123
                </div>
                <div>
                  <strong>Tuteur:</strong> tuteur@bridge-tech.com / tuteur123
                </div>
                <div>
                  <strong>Stagiaire:</strong> stagiaire@bridge-tech.com / stagiaire123
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
