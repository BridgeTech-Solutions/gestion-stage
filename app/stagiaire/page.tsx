"use client"

import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Sidebar } from "@/components/layout/sidebar"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Calendar, FileText, Users, CheckCircle } from "lucide-react"
import { mockDemandes } from "@/lib/mock-data"
import Link from "next/link"

export default function StagiaireDashboard() {
  const user = { name: "Nom stagiaire", role: "stagiaire" }

  return (
    <div className="min-h-screen flex flex-col">
      <Header user={user} />

      <div className="flex flex-1">
        <Sidebar role="stagiaire" />

        <main className="flex-1 p-6 bg-white">
          <div className="mb-6">
            <div className="flex items-center space-x-4 mb-4">
              <Avatar className="w-16 h-16">
                <AvatarFallback className="bg-gray-300 text-2xl">S</AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold">Bonjour, --Nom stagiaire--</h1>
                <p className="text-gray-600">Ceci est votre tableau de bord qui recence l'ensemble de vos activités</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="border border-gray-200 rounded-lg">
              <CardContent className="p-6 text-center">
                <div className="flex items-center justify-center mb-2">
                  <span className="text-3xl font-bold">2</span>
                  <div className="ml-2 w-6 h-6 bg-gray-800 rounded flex items-center justify-center">
                    <Users className="w-4 h-4 text-white" />
                  </div>
                </div>
                <h3 className="font-semibold mb-1">Demande en Cours</h3>
                <p className="text-sm text-gray-600">Demande en cours de traitement</p>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 rounded-lg">
              <CardContent className="p-6 text-center">
                <div className="flex items-center justify-center mb-2">
                  <span className="text-3xl font-bold">5</span>
                  <div className="ml-2 w-6 h-6 bg-gray-800 rounded flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                </div>
                <h3 className="font-semibold mb-1">Demande en validées</h3>
                <p className="text-sm text-gray-600">Vos demandes approuvées</p>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 rounded-lg">
              <CardContent className="p-6 text-center">
                <div className="flex items-center justify-center mb-2">
                  <span className="text-3xl font-bold">5</span>
                  <div className="ml-2 w-6 h-6 bg-gray-800 rounded flex items-center justify-center">
                    <FileText className="w-4 h-4 text-white" />
                  </div>
                </div>
                <h3 className="font-semibold mb-1">Documents</h3>
                <p className="text-sm text-gray-600">Les documents que vous nous avez fournis</p>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 rounded-lg">
              <CardContent className="p-6 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Calendar className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="font-semibold mb-1">Jours restants</h3>
                <div className="text-3xl font-bold">70 jours</div>
              </CardContent>
            </Card>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold">Suivis des demandes</h2>
              <Link href="/stagiaire/demande/new">
                <Button className="bg-blue-500 hover:bg-blue-600 text-white">Effectuer une demande</Button>
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Date</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Type</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Statut</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {mockDemandes.map((demande) => (
                    <tr key={demande.id}>
                      <td className="px-6 py-4 text-sm">{demande.date}</td>
                      <td className="px-6 py-4 text-sm">{demande.type}</td>
                      <td className="px-6 py-4">
                        <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">{demande.statut}</Badge>
                      </td>
                      <td className="px-6 py-4 text-sm">{demande.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-6 bg-green-100 border border-green-300 rounded-lg p-4">
            <p className="text-green-800 font-medium">Notification</p>
            <p className="text-green-700">Votre demande à été envoyé avec succès</p>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  )
}
