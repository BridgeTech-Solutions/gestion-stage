"use client"

import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Sidebar } from "@/components/layout/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Filter, MoreHorizontal, FileText, User, Mail, Phone } from "lucide-react"
import { mockStagiaires } from "@/lib/mock-data"
import Link from "next/link"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useState } from "react"

export default function StagiairesPage() {
  const user = { name: "ADMINISTRATEUR", role: "admin" }
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const filteredStagiaires = mockStagiaires.filter((stagiaire) => {
    const matchesSearch =
      stagiaire.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stagiaire.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stagiaire.email.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || stagiaire.statut === statusFilter

    return matchesSearch && matchesStatus
  })

  return (
    <div className="min-h-screen flex flex-col">
      <Header user={user} />

      <div className="flex flex-1">
        <Sidebar role="admin" />

        <main className="flex-1 p-6 bg-gray-50">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold">Gestion des stagiaires</h1>
              <p className="text-gray-600">Gérez tous les stagiaires de la plateforme</p>
            </div>
            <Link href="/admin/stagiaires/new">
              <Button className="bg-blue-500 hover:bg-blue-600">
                <Plus className="mr-2 h-4 w-4" /> Ajouter un stagiaire
              </Button>
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow mb-6">
            <div className="p-4 border-b border-gray-200">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Rechercher un stagiaire..."
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
                      <SelectItem value="actif">Actif</SelectItem>
                      <SelectItem value="termine">Terminé</SelectItem>
                      <SelectItem value="en_attente">En attente</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline">
                    <FileText className="mr-2 h-4 w-4" /> Exporter
                  </Button>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nom
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Formation
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tuteur
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Période
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
                  {filteredStagiaires.map((stagiaire) => (
                    <tr key={stagiaire.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-gray-500" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {stagiaire.prenom} {stagiaire.nom}
                            </div>
                            <div className="text-sm text-gray-500">{stagiaire.departement}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <Mail className="h-4 w-4 mr-2 text-gray-400" />
                          {stagiaire.email}
                        </div>
                        {stagiaire.telephone && (
                          <div className="flex items-center text-sm text-gray-500">
                            <Phone className="h-4 w-4 mr-2 text-gray-400" />
                            {stagiaire.telephone}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{stagiaire.formation}</div>
                        <div className="text-sm text-gray-500">{stagiaire.ecole}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{stagiaire.tuteur}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{stagiaire.periode}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge
                          className={`
                          ${stagiaire.statut === "actif" ? "bg-green-100 text-green-800" : ""}
                          ${stagiaire.statut === "termine" ? "bg-gray-100 text-gray-800" : ""}
                          ${stagiaire.statut === "en_attente" ? "bg-yellow-100 text-yellow-800" : ""}
                        `}
                        >
                          {stagiaire.statut === "actif" ? "Actif" : ""}
                          {stagiaire.statut === "termine" ? "Terminé" : ""}
                          {stagiaire.statut === "en_attente" ? "En attente" : ""}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem>
                              <Link href={`/admin/stagiaires/${stagiaire.id}`} className="flex w-full">
                                Voir le profil
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Link href={`/admin/stagiaires/${stagiaire.id}/edit`} className="flex w-full">
                                Modifier
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <Link href={`/admin/stagiaires/${stagiaire.id}/documents`} className="flex w-full">
                                Documents
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Link href={`/admin/stagiaires/${stagiaire.id}/evaluations`} className="flex w-full">
                                Évaluations
                              </Link>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 flex justify-between items-center border-t border-gray-200">
              <div className="text-sm text-gray-500">
                Affichage de {filteredStagiaires.length} stagiaires sur {mockStagiaires.length}
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
          </div>
        </main>
      </div>

      <Footer />
    </div>
  )
}
