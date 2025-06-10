"use client"

import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Sidebar } from "@/components/layout/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, CheckCircle, XCircle } from "lucide-react"
import { mockDemandes } from "@/lib/mock-data"
import Link from "next/link"
import { useState } from "react"

export default function TuteurDemandesPage() {
  const user = { name: "Thomas Martin", role: "tuteur" }
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")

  // Filtrer les demandes pour ce tuteur (id=3)
  const tuteurId = "3" // Thomas Martin
  const demandes = mockDemandes.filter((dem) => dem.tuteurId === tuteurId)

  const filteredDemandes = demandes.filter((demande) => {
    const matchesSearch =
      demande.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      demande.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      demande.stagiaire.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || demande.tuteurDecision === statusFilter
    const matchesType = typeFilter === "all" || demande.type === typeFilter

    return matchesSearch && matchesStatus && matchesType
  })

  return (
    <div className="min-h-screen flex flex-col">
      <Header user={user} />

      <div className="flex flex-1">
        <Sidebar role="tuteur" />

        <main className="flex-1 p-6 bg-gray-50">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold">Validation des demandes</h1>
              <p className="text-gray-600">Gérez et validez les demandes de vos stagiaires</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow mb-6">
            <div className="p-4 border-b border-gray-200">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Rechercher par stagiaire, type ou détails..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                      <div className="flex items-center">
                        <Filter className="mr-2 h-4 w-4" />
                        <SelectValue placeholder="Statut" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les statuts</SelectItem>
                      <SelectItem value="En attente">En attente</SelectItem>
                      <SelectItem value="Validé">Validé</SelectItem>
                      <SelectItem value="Refusé">Refusé</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-[180px]">
                      <div className="flex items-center">
                        <Filter className="mr-2 h-4 w-4" />
                        <SelectValue placeholder="Type" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les types</SelectItem>
                      <SelectItem value="stage_academique">Stage académique</SelectItem>
                      <SelectItem value="stage_professionnel">Stage professionnel</SelectItem>
                      <SelectItem value="conge">Congé</SelectItem>
                      <SelectItem value="prolongation">Prolongation</SelectItem>
                      <SelectItem value="attestation">Attestation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stagiaire
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Détails
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredDemandes.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                        Aucune demande trouvée
                      </td>
                    </tr>
                  ) : (
                    filteredDemandes.map((demande) => (
                      <tr key={demande.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{demande.date}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{demande.stagiaire}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {demande.type.replace("_", " ")}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{demande.details}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge
                            className={`${
                              demande.tuteurDecision === "Validé"
                                ? "bg-green-100 text-green-800"
                                : demande.tuteurDecision === "Refusé"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-orange-100 text-orange-800"
                            }`}
                          >
                            {demande.tuteurDecision || "En attente"}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <Link href={`/tuteur/demandes/${demande.id}`}>
                              <Button variant="ghost" size="sm">
                                Détails
                              </Button>
                            </Link>

                            {demande.tuteurDecision === "En attente" && (
                              <>
                                <Button variant="ghost" size="sm" className="text-green-600">
                                  <CheckCircle className="h-4 w-4 mr-1" /> Valider
                                </Button>
                                <Button variant="ghost" size="sm" className="text-red-600">
                                  <XCircle className="h-4 w-4 mr-1" /> Refuser
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {filteredDemandes.length > 0 && (
              <div className="p-4 flex justify-between items-center border-t border-gray-200">
                <div className="text-sm text-gray-500">
                  Affichage de {filteredDemandes.length} demandes sur {demandes.length}
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" disabled>
                    ‹
                  </Button>
                  <Button variant="outline" size="sm" className="bg-blue-50">
                    1
                  </Button>
                  <Button variant="outline" size="sm">
                    ›
                  </Button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      <Footer />
    </div>
  )
}
