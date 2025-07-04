
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Header } from "@/components/layout/header"
import { ArrowLeft, Edit, Calendar, Star, User, GraduationCap, FileText, Trash2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

interface Evaluation {
  id: string
  stagiaire_id: string
  evaluateur_id: string
  periode_debut: string
  periode_fin: string
  type: string
  note_globale: number
  competences_techniques: number
  competences_relationnelles: number
  autonomie: number
  ponctualite: number
  motivation: number
  commentaires: string
  points_forts: string
  axes_amelioration: string
  objectifs_suivants: string
  recommandations: string
  statut: string
  created_at: string
  updated_at: string
  stagiaire: {
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
  evaluateur: {
    name: string
    email: string
  }
}

export default function EvaluationDetailPage({ params }: { params: { id: string } }) {
  const [user, setUser] = useState<any>(null)
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null)
  const [loading, setLoading] = useState(true)
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
        await loadEvaluation()
        setLoading(false)
      } catch (error) {
        console.error("Erreur auth:", error)
        router.push("/auth/login")
      }
    }

    checkAuth()
  }, [router, supabase, params.id])

  const loadEvaluation = async () => {
    try {
      const response = await fetch(`/api/evaluations/${params.id}`)
      const data = await response.json()

      if (data.success) {
        setEvaluation(data.evaluation)
      } else {
        toast({
          title: "Erreur",
          description: "Évaluation non trouvée",
          variant: "destructive",
        })
        router.push("/rh/evaluations")
      }
    } catch (error) {
      console.error("Erreur:", error)
      toast({
        title: "Erreur",
        description: "Impossible de charger l'évaluation",
        variant: "destructive",
      })
      router.push("/rh/evaluations")
    }
  }

  const handleDelete = async () => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette évaluation ?")) {
      return
    }

    try {
      const response = await fetch(`/api/evaluations/${params.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast({
          title: "Succès",
          description: "Évaluation supprimée avec succès",
        })
        router.push("/rh/evaluations")
      } else {
        throw new Error("Erreur lors de la suppression")
      }
    } catch (error) {
      console.error("Erreur:", error)
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'évaluation",
        variant: "destructive",
      })
    }
  }

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

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'mi_parcours':
        return <Badge className="bg-blue-100 text-blue-800">Mi-parcours</Badge>
      case 'finale':
        return <Badge className="bg-green-100 text-green-800">Finale</Badge>
      case 'auto_evaluation':
        return <Badge className="bg-purple-100 text-purple-800">Auto-évaluation</Badge>
      default:
        return <Badge variant="outline">{type}</Badge>
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

  if (!evaluation) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Évaluation non trouvée</h2>
          <Button onClick={() => router.push("/rh/evaluations")} className="mt-4">
            Retour aux évaluations
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} />

      <main className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Évaluation de {evaluation.stagiaire.users.name}</h1>
                <p className="text-gray-600">
                  {evaluation.stagiaire.specialite} - {evaluation.stagiaire.niveau}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => router.push(`/rh/evaluations/${evaluation.id}/edit`)}>
                <Edit className="h-4 w-4 mr-2" />
                Modifier
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                <Trash2 className="h-4 w-4 mr-2" />
                Supprimer
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Informations générales */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informations générales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Stagiaire</h4>
                  <p className="text-lg">{evaluation.stagiaire.users.name}</p>
                  <p className="text-sm text-gray-600">{evaluation.stagiaire.users.email}</p>
                  <p className="text-sm text-gray-600">{evaluation.stagiaire.specialite}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Évaluateur</h4>
                  <p className="text-lg">{evaluation.evaluateur.name}</p>
                  <p className="text-sm text-gray-600">{evaluation.evaluateur.email}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Période</h4>
                  <p className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {formatDate(evaluation.periode_debut)} - {formatDate(evaluation.periode_fin)}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Type et Statut</h4>
                  <div className="flex items-center gap-2">
                    {getTypeBadge(evaluation.type)}
                    {getStatutBadge(evaluation.statut)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Notes et évaluation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-6">
                <div className="text-6xl font-bold text-blue-600">{evaluation.note_globale}</div>
                <div className="text-xl text-gray-600">/ 20</div>
                <div className="mt-2">{getNoteBadge(evaluation.note_globale)}</div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Compétences techniques</span>
                    <span className="font-semibold">{evaluation.competences_techniques}/20</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Compétences relationnelles</span>
                    <span className="font-semibold">{evaluation.competences_relationnelles}/20</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Autonomie</span>
                    <span className="font-semibold">{evaluation.autonomie}/20</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Ponctualité</span>
                    <span className="font-semibold">{evaluation.ponctualite}/20</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Motivation</span>
                    <span className="font-semibold">{evaluation.motivation}/20</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Commentaires */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Commentaires et observations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {evaluation.commentaires && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Commentaires généraux</h4>
                  <p className="text-gray-700 whitespace-pre-wrap">{evaluation.commentaires}</p>
                </div>
              )}

              {evaluation.points_forts && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Points forts</h4>
                  <p className="text-gray-700 whitespace-pre-wrap">{evaluation.points_forts}</p>
                </div>
              )}

              {evaluation.axes_amelioration && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Axes d'amélioration</h4>
                  <p className="text-gray-700 whitespace-pre-wrap">{evaluation.axes_amelioration}</p>
                </div>
              )}

              {evaluation.objectifs_suivants && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Objectifs pour la suite</h4>
                  <p className="text-gray-700 whitespace-pre-wrap">{evaluation.objectifs_suivants}</p>
                </div>
              )}

              {evaluation.recommandations && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Recommandations</h4>
                  <p className="text-gray-700 whitespace-pre-wrap">{evaluation.recommandations}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Métadonnées */}
          <Card>
            <CardHeader>
              <CardTitle>Informations système</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Créée le:</span> {formatDate(evaluation.created_at)}
                </div>
                <div>
                  <span className="font-medium">Modifiée le:</span> {formatDate(evaluation.updated_at)}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
