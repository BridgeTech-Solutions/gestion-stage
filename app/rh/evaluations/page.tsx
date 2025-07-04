"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, FileText, Search, Filter, Eye, Edit, Trash2, Plus } from "lucide-react"
import { Header } from "@/components/layout/header"

interface Evaluation {
  id: string
  type: string
  note_globale: number
  competences_techniques: number
  competences_relationnelles: number
  autonomie: number
  commentaires?: string
  date_evaluation: string
  created_at: string
  stagiaire: {
    id: string
    users: {
      name: string
      email: string
    }
  }
  evaluateur: {
    name: string
    email: string
  }
}

export default function RHEvaluationsPage() {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)

  const router = useRouter()
  const searchParams = useSearchParams()
  const stagiaireFilter = searchParams.get('stagiaire')

  useEffect(() => {
    fetchUser()
  }, [])

  useEffect(() => {
    if (user) {
      fetchEvaluations()
    }
  }, [user])

  useEffect(() => {
    if (user && stagiaireFilter) {
      fetchEvaluations()
    }
  }, [stagiaireFilter])

  const fetchUser = async () => {
    try {
      const response = await fetch("/api/auth/user")
      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
      }
    } catch (error) {
      console.error("Erreur récupération utilisateur:", error)
    }
  }

  const fetchEvaluations = async () => {
    try {
      setLoading(true)
      setError(null)

      let url = "/api/evaluations"
      if (stagiaireFilter) {
        url += `?stagiaire_id=${stagiaireFilter}`
      }

      console.log("🔍 RH - Récupération des évaluations depuis:", url)

      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      console.log("📋 RH - Réponse évaluations:", response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Erreur de communication' }))
        console.error("❌ RH - Erreur response:", errorData)
        throw new Error(errorData.error || `Erreur ${response.status}`)
      }

      const data = await response.json()
      console.log("✅ RH - Données évaluations reçues:", data)

      // Gérer les réponses même en cas d'erreur serveur
      if (data.success === false && data.evaluations) {
        setEvaluations(data.evaluations)
        setError(data.error || "Erreur lors du chargement")
      } else if (data.success) {
        console.log("✅ RH - Évaluations chargées:", data.evaluations?.length || 0)
        setEvaluations(data.evaluations || [])
      } else {
        console.error("❌ RH - Réponse inattendue:", data)
        throw new Error(data.error || "Erreur lors de la récupération")
      }
    } catch (error) {
      console.error("❌ RH - Erreur fetchEvaluations:", error)
      setError(error instanceof Error ? error.message : "Erreur lors du chargement des évaluations")
      // Définir un tableau vide en cas d'erreur
      setEvaluations([])
    } finally {
      setLoading(false)
    }
  }

  const deleteEvaluation = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette évaluation ?")) {
      return
    }

    try {
      const response = await fetch(`/api/evaluations/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression")
      }

      setEvaluations(evaluations.filter(e => e.id !== id))
    } catch (error) {
      console.error("Erreur suppression:", error)
      setError("Erreur lors de la suppression de l'évaluation")
    }
  }

  const filteredEvaluations = evaluations.filter(evaluation => {
    const matchesSearch = evaluation.stagiaire?.users?.name
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase()) ||
      evaluation.evaluateur?.name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase())
    
    const matchesType = typeFilter === "all" || evaluation.type === typeFilter

    return matchesSearch && matchesType
  })

  const getTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      mi_parcours: "Mi-parcours",
      finale: "Finale", 
      auto_evaluation: "Auto-évaluation"
    }
    return types[type] || type
  }

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      mi_parcours: "bg-blue-100 text-blue-800",
      finale: "bg-green-100 text-green-800",
      auto_evaluation: "bg-purple-100 text-purple-800"
    }
    return colors[type] || "bg-gray-100 text-gray-800"
  }

  const getNoteColor = (note: number) => {
    if (note >= 16) return "text-green-600 font-semibold"
    if (note >= 12) return "text-orange-600 font-semibold"
    return "text-red-600 font-semibold"
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span>Chargement...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} />

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Gestion des évaluations</h1>
          <p className="text-gray-600">Superviser et gérer toutes les évaluations des stagiaires</p>
        </div>

        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertDescription className="text-red-700">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-gray-900">{evaluations.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Mi-parcours</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {evaluations.filter(e => e.type === "mi_parcours").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Finales</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {evaluations.filter(e => e.type === "finale").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Note moyenne</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {evaluations.length > 0 
                      ? (evaluations.reduce((sum, e) => sum + e.note_globale, 0) / evaluations.length).toFixed(1)
                      : "0"
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtres et recherche */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Rechercher par nom de stagiaire ou évaluateur..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-48">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Type d'évaluation" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les types</SelectItem>
                    <SelectItem value="mi_parcours">Mi-parcours</SelectItem>
                    <SelectItem value="finale">Finale</SelectItem>
                    <SelectItem value="auto_evaluation">Auto-évaluation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tableau des évaluations */}
        <Card>
          <CardHeader>
            <CardTitle>Liste des évaluations</CardTitle>
            <CardDescription>
              {filteredEvaluations.length} évaluation(s) trouvée(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredEvaluations.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune évaluation</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Aucune évaluation ne correspond à vos critères de recherche.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Stagiaire</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Note globale</TableHead>
                      <TableHead>Compétences techniques</TableHead>
                      <TableHead>Compétences relationnelles</TableHead>
                      <TableHead>Autonomie</TableHead>
                      <TableHead>Évaluateur</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEvaluations.map((evaluation) => (
                      <TableRow key={evaluation.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{evaluation.stagiaire?.users?.name}</div>
                            <div className="text-sm text-gray-500">{evaluation.stagiaire?.users?.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getTypeColor(evaluation.type)}>
                            {getTypeLabel(evaluation.type)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className={getNoteColor(evaluation.note_globale)}>
                            {evaluation.note_globale}/20
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className={getNoteColor(evaluation.competences_techniques)}>
                            {evaluation.competences_techniques}/20
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className={getNoteColor(evaluation.competences_relationnelles)}>
                            {evaluation.competences_relationnelles}/20
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className={getNoteColor(evaluation.autonomie)}>
                            {evaluation.autonomie}/20
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="font-medium">{evaluation.evaluateur?.name}</div>
                            <div className="text-gray-500">{evaluation.evaluateur?.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(evaluation.date_evaluation).toLocaleDateString("fr-FR")}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => router.push(`/rh/evaluations/${evaluation.id}`)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteEvaluation(evaluation.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
