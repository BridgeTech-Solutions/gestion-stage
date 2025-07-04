"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Header } from "@/components/layout/header"
import { ClipboardList, Search, Eye, Edit, Plus } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface Evaluation {
  id: string
  stagiaire_id: string
  evaluateur_id: string
  note_globale: number
  commentaires: string
  competences_techniques: number
  competences_relationnelles: number
  autonomie: number
  ponctualite: number
  motivation: number
  periode_debut: string
  periode_fin: string
  statut: string
  created_at: string
  stagiaire?: {
    id: string
    user_id: string
    specialite: string
    niveau: string
    users: {
      name: string
      email: string
    }
    tuteur?: {
      name: string
      email: string
    }
  }
  evaluateur?: {
    name: string
    email: string
  }
}

export default function RHEvaluationsPage() {
  const [user, setUser] = useState<any>(null)
  const [evaluations, setEvaluations] = useState<Evaluation[]>([])
  const [filteredEvaluations, setFilteredEvaluations] = useState<Evaluation[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()
  const supabase = createClient()
  const { toast } = useToast()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session) {
          router.push("/auth/login")
          return
        }

        const { data: profile, error: profileError } = await supabase
          .from("users")
          .select("*")
          .eq("id", session.user.id)
          .single()

        if (profileError || !profile || profile.role !== "rh" || !profile.is_active) {
          router.push("/auth/login")
          return
        }

        setUser(profile)
        await loadEvaluations()
        setLoading(false)
      } catch (error) {
        console.error("Erreur auth:", error)
        router.push("/auth/login")
      }
    }

    checkAuth()
  }, [router, supabase])

  const loadEvaluations = async () => {
    try {
      const response = await fetch('/api/evaluations', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error("Erreur lors du chargement")
      }

      const data = await response.json()

      if (data.success) {
        setEvaluations(data.evaluations || [])
        setFilteredEvaluations(data.evaluations || [])
      } else {
        setEvaluations([])
        setFilteredEvaluations([])
      }
    } catch (error) {
      console.error("Erreur lors du chargement des évaluations:", error)
      toast({
        title: "Erreur",
        description: "Impossible de charger les évaluations",
        variant: "destructive",
      })
      setEvaluations([])
      setFilteredEvaluations([])
    }
  }

  useEffect(() => {
    let filtered = evaluations

    if (searchQuery) {
      filtered = filtered.filter(
        (evaluation) =>
          evaluation.stagiaire?.users?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          evaluation.stagiaire?.tuteur?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          evaluation.evaluateur?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          evaluation.statut.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    setFilteredEvaluations(filtered)
  }, [evaluations, searchQuery])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR")
  }

  const getStatutBadge = (statut: string) => {
    switch (statut) {
      case 'finalisee':
        return <Badge variant="default">Finalisée</Badge>
      case 'en_cours':
        return <Badge variant="secondary">En cours</Badge>
      case 'brouillon':
        return <Badge variant="outline">Brouillon</Badge>
      default:
        return <Badge variant="outline">{statut}</Badge>
    }
  }

  const getNoteBadge = (note: number) => {
    if (note >= 16) return <Badge className="bg-green-500">Excellent</Badge>
    if (note >= 14) return <Badge className="bg-blue-500">Très bien</Badge>
    if (note >= 12) return <Badge className="bg-yellow-500">Bien</Badge>
    if (note >= 10) return <Badge className="bg-orange-500">Assez bien</Badge>
    return <Badge className="bg-red-500">Insuffisant</Badge>
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} />

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Gestion des évaluations</h1>
          <p className="text-gray-600">Voir et gérer toutes les évaluations des stagiaires</p>
        </div>

        {/* Actions rapides */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Nouvelle évaluation</CardTitle>
              <CardDescription>Créer une nouvelle évaluation</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" onClick={() => router.push("/rh/evaluations/nouvelle")}>
                <Plus className="mr-2 h-4 w-4" />
                Créer évaluation
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Statistiques</CardTitle>
              <CardDescription>Voir les statistiques globales</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" onClick={() => router.push("/rh/evaluations/stats")}>
                <ClipboardList className="mr-2 h-4 w-4" />
                Voir statistiques
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Export</CardTitle>
              <CardDescription>Exporter les données</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                <ClipboardList className="mr-2 h-4 w-4" />
                Exporter
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recherche */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher par stagiaire, tuteur, statut..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Tableau des évaluations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5" />
              Évaluations ({filteredEvaluations.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Stagiaire</TableHead>
                  <TableHead>Tuteur</TableHead>
                  <TableHead>Période</TableHead>
                  <TableHead>Note globale</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Date création</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEvaluations.map((evaluation) => (
                  <TableRow key={evaluation.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{evaluation.stagiaire?.users?.name || "N/A"}</div>
                        <div className="text-sm text-gray-500">{evaluation.stagiaire?.users?.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{evaluation.stagiaire?.tuteur?.name || evaluation.evaluateur?.name || "N/A"}</div>
                        <div className="text-sm text-gray-500">{evaluation.stagiaire?.tuteur?.email || evaluation.evaluateur?.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {formatDate(evaluation.periode_debut)} - {formatDate(evaluation.periode_fin)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{evaluation.note_globale}/20</span>
                        {getNoteBadge(evaluation.note_globale)}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatutBadge(evaluation.statut)}
                    </TableCell>
                    <TableCell>{formatDate(evaluation.created_at)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => router.push(`/rh/evaluations/${evaluation.id}`)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => router.push(`/rh/evaluations/${evaluation.id}/edit`)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredEvaluations.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-gray-500">
                      Aucune évaluation trouvée
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
