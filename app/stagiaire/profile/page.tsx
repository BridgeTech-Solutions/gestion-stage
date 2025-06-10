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

export default function ProfilePage() {
  const user = { name: "Nom stagiaire", role: "stagiaire" }

  const [formData, setFormData] = useState({
    nom: "",
    email: "",
    phone: "",
    adresse: "",
    password: "",
    confirmPassword: "",
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
        <Sidebar role="stagiaire" />

        <main className="flex-1 p-6 bg-white">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <h1 className="text-2xl font-bold mb-2">Profile</h1>
              <p className="text-gray-600">Ceci est votre tableau de bord qui recence l'ensemble de vos activités</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-8">
              <div className="flex flex-col items-center mb-8">
                <div className="relative">
                  <Avatar className="w-32 h-32 mb-4">
                    <AvatarFallback className="bg-gray-300 text-4xl">
                      <img
                        src="/placeholder.svg?height=128&width=128"
                        alt="Profile"
                        className="w-full h-full object-cover rounded-full"
                      />
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    size="icon"
                    className="absolute bottom-2 right-2 rounded-full bg-black text-white hover:bg-gray-800"
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="nom" className="text-sm font-medium">
                      Nom
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
                    <Label htmlFor="password" className="text-sm font-medium">
                      Mot de passe
                    </Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="mt-1 border-2 border-blue-200 rounded-lg"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone" className="text-sm font-medium">
                      Numero de téléphone
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
                    <Label htmlFor="confirmPassword" className="text-sm font-medium">
                      Confirmer Mot de passe
                    </Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="mt-1 border-2 border-blue-200 rounded-lg"
                    />
                  </div>
                </div>

                <div className="flex justify-center pt-6">
                  <Button type="submit" className="bg-black text-white hover:bg-gray-800 px-8">
                    sauvegarder
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
