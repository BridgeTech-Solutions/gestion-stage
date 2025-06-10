"use client"

import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Sidebar } from "@/components/layout/sidebar"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, FileText } from "lucide-react"
import { mockDemandes, mockStagiaires } from "@/lib/mock-data"

export default function RHDashboard() {
  const user = { name: "Ressources Humaines", role: "rh" }

  return (
    <div className="min-h-screen flex flex-col">
      <Header user={user} />

      <div className="flex flex-1">
        <Sidebar role="rh" />

        <main className="flex-1 p-6 bg-white">
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-2">Bonjour, bienvenue sur votre tableau de bord</h1>
            <p className="text-gray-600">Ceci est votre tableau de bord qui recence l'ensemble de vos activités</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card className="border border-gray-200 rounded-lg">
              <CardContent className="p-6 text-center">
                <div className="flex items-center justify-center mb-2">
                  <span className="text-3xl font-bold">2</span>
                  <div className="ml-2 w-6 h-6 bg-gray-800 rounded flex items-center justify-center">
                    <Users className="w-4 h-4 text-white" />
                  </div>
                </div>
                <h3 className="font-semibold mb-1">Stagiaires actifs</h3>
                <p className="text-sm text-gray-600">Stagiaire actuellement en entreprise</p>
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
                <h3 className="font-semibold mb-1">Nombre de demande en cours</h3>
                <p className="text-sm text-gray-600">Demande en attente de réponse</p>
              </CardContent>
            </Card>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg mb-6">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold">Suivis des demandes</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Date</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Type</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Décision tuteur</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Détails</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Décision finale</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {mockDemandes.map((demande) => (
                    <tr key={demande.id}>
                      <td className="px-6 py-4 text-sm">{demande.date}</td>
                      <td className="px-6 py-4 text-sm">{demande.type}</td>
                      <td className="px-6 py-4">
                        <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">
                          {demande.tuteurDecision} ▼
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm">{demande.details}</td>
                      <td className="px-6 py-4">
                        {demande.rhDecision === "Validé" ? (
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">validé ▼</Badge>
                        ) : demande.rhDecision === "Refusé" ? (
                          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Refusé ▼</Badge>
                        ) : (
                          <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">En attente ▼</Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 flex justify-center">
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  ‹
                </Button>
                <Button variant="outline" size="sm">
                  1
                </Button>
                <Button variant="outline" size="sm">
                  2
                </Button>
                <Button variant="outline" size="sm">
                  3
                </Button>
                <span className="text-sm text-gray-500">...</span>
                <Button variant="outline" size="sm">
                  30
                </Button>
                <Button variant="outline" size="sm">
                  ›
                </Button>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold">Stagiaires actifs</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Id</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Nom</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Prénom</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">période de stage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {mockStagiaires.map((stagiaire, index) => (
                    <tr key={stagiaire.id}>
                      <td className="px-6 py-4 text-sm">0{index + 1}</td>
                      <td className="px-6 py-4 text-sm">{stagiaire.nom}</td>
                      <td className="px-6 py-4 text-sm">{stagiaire.prenom}</td>
                      <td className="px-6 py-4 text-sm">{stagiaire.periode}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 flex justify-center">
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  ‹
                </Button>
                <Button variant="outline" size="sm">
                  1
                </Button>
                <Button variant="outline" size="sm">
                  2
                </Button>
                <Button variant="outline" size="sm">
                  3
                </Button>
                <span className="text-sm text-gray-500">...</span>
                <Button variant="outline" size="sm">
                  30
                </Button>
                <Button variant="outline" size="sm">
                  ›
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-6 bg-green-100 border border-green-300 rounded-lg p-4">
            <p className="text-green-800 font-medium">Le stagiaire --nom stagiaire-- à bien été enregistré</p>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  )
}
