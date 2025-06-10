"use client"

import type React from "react"

import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Sidebar } from "@/components/layout/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Camera } from "lucide-react"
import { useState } from "react"

export default function TuteurProfilePage() {
  const user = { name: "Thomas Martin", role: "tuteur" }

  const [formData, setFormData] = useState({
    nom: "Thomas Martin",
    email: "tuteur@bridge-tech.com",
    phone: "0123456788",
    adresse: "456 Avenue des Développeurs, Paris",
    password: "",
    confirmPassword: "",
    department: "Développement",
    position: "Lead Developer",
    specialite: "Développement Web Full-Stack",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Profile updated:", formData)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header user={user} />

      <div className="flex flex-1">
        <Sidebar role="tuteur" />

        <main className="flex-1 p-6 bg-white">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <h1 className="text-2xl font-bold mb-2">Mon profil</h1>
              <p className="text-gray-600">Gérez vos informations personnelles et professionnelles</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-8">
              <div className="flex flex-col items-center mb-8">
                <div className="relative">
                  <Avatar className="w-32 h-32 mb-4">
                    <AvatarFallback className="bg-green-100 text-green-600 text-4xl">TM</AvatarFallback>
                  </Avatar>
                  <Button
                    size="icon"
                    className="absolute bottom-2 right-2 rounded-full bg-black text-white hover:bg-gray-800"
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                </div>
                <h2 className="text-xl font-bold">{formData.nom}</h2>
                <p className="text-gray-600">{formData.position}</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="nom" className="text-sm font-medium">
                      Nom complet
                    </Label>
                    <Input
                      id="nom"
                      name="nom"
                      value={formData.nom}
                      onChange={handleChange}
                      className="mt-1 border-2 border-blue-200 rounded-lg"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-sm font-medium">
                      Email
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="mt-1 border-2 border-blue-200 rounded-lg"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone" className="text-sm font-medium">
                      Numéro de téléphone
                    </Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      className="mt-1 border-2 border-blue-200 rounded-lg"
                    />
                  </div>

                  <div>
                    <Label htmlFor="adresse" className="text-sm font-medium">
                      Adresse
                    </Label>
                    <Input
                      id="adresse"
                      name="adresse"
                      value={formData.adresse}
                      onChange={handleChange}
                      className="mt-1 border-2 border-blue-200 rounded-lg"
                    />
                  </div>

                  <div>
                    <Label htmlFor="department" className="text-sm font-medium">
                      Département
                    </Label>
                    <Input
                      id="department"
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      className="mt-1 border-2 border-blue-200 rounded-lg"
                    />
                  </div>

                  <div>
                    <Label htmlFor="position" className="text-sm font-medium">
                      Poste
                    </Label>
                    <Input
                      id="position"
                      name="position"
                      value={formData.position}
                      onChange={handleChange}
                      className="mt-1 border-2 border-blue-200 rounded-lg"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="specialite" className="text-sm font-medium">
                      Spécialité
                    </Label>
                    <Input
                      id="specialite"
                      name="specialite"
                      value={formData.specialite}
                      onChange={handleChange}
                      className="mt-1 border-2 border-blue-200 rounded-lg"
                    />
                  </div>

                  <div>
                    <Label htmlFor="password" className="text-sm font-medium">
                      Nouveau mot de passe
                    </Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="mt-1 border-2 border-blue-200 rounded-lg"
                      placeholder="Laisser vide pour ne pas changer"
                    />
                  </div>

                  <div>
                    <Label htmlFor="confirmPassword" className="text-sm font-medium">
                      Confirmer le mot de passe
                    </Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="mt-1 border-2 border-blue-200 rounded-lg"
                      placeholder="Confirmer le nouveau mot de passe"
                    />
                  </div>
                </div>

                <div className="flex justify-center pt-6">
                  <Button type="submit" className="bg-black text-white hover:bg-gray-800 px-8">
                    Sauvegarder
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  )
}
