"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Header } from "@/components/layout/header"
import { User, Mail, Calendar, BookOpen, FileText, ClipboardList, ArrowLeft, MessageSquare, Star } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"

// Interfaces pour typer les données
interface Stagiaire {
  user_id: string
  users: {
    name: string
    email: string
    phone?: string
  }
  specialite: string
  niveau: string
  date_debut: string
  date_fin: string
  status: string
  etablissement?: string
  description?: string
}

interface Evaluation {
  id: string
  type: string
  note_globale?: number
  date_evaluation: string
  commentaires?: string
}

interface Document {
  id: string
  nom: string
  type: string
  date_upload: string
  taille?: number
  url?: string
}

export default function StagiaireDetailPage() {
  // États pour stocker les infos utilisateur, stagiaire, évaluations, documents, etc.
  const [user, setUser] = useState<any>(null)
  const [stagiaire, setStagiaire] = useState<Stagiaire | null>(null)
  const [evaluations, setEvaluations] = useState<Evaluation[]>([])
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)

  const router = useRouter()
  const params = useParams()
  const supabase = createClient()
  const { toast } = useToast()

  // Effet pour vérifier l'authentification et charger le stagiaire
  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session) {
        router.push("/auth/login")
        return
      }

      const { data: profile } = await supabase.from("users").select("*").eq("id", session.user.id).single()
      if (!profile || profile.role !== "tuteur") {
        router.push("/auth/login")
        return
      }

      setUser(profile)
      await loadStagiaire()
      setLoading(false)
    }

    checkAuth()
  }, [router, supabase, params.id])

  // Effet pour charger les documents du stagiaire quand il est chargé
  useEffect(() => {
    if (stagiaire?.user_id) {
      loadDocuments()
    }
  }, [stagiaire])

  // Effet pour charger les évaluations quand l'utilisateur et le stagiaire sont chargés
  useEffect(() => {
    if (user?.id && params.id) {
      loadEvaluations()
    }
  }, [user, params.id])

  // Fonction pour charger les infos du stagiaire
  const loadStagiaire = async () => {
    try {
      const { data, error } = await supabase
        .from("stagiaires")
        .select(`
          *,
          users:users!stagiaires_user_id_fkey(name, email, phone)
        `)
        .eq("id", params.id)
        .single()

      if (error) throw error
      setStagiaire(data)
    } catch (error) {
      console.error("Erreur lors du chargement du stagiaire:", error)
      toast({
        title: "Erreur",
        description: "Impossible de charger les informations du stagiaire",
        variant: "destructive",
      })
    }
  }

  // Fonction pour charger les évaluations du stagiaire
  const loadEvaluations = async () => {
    try {
      const { data, error } = await supabase
        .from("evaluations")
        .select("*")
        .eq("stagiaire_id", params.id)
        .eq("evaluateur_id", user?.id)
        .order("date_evaluation", { ascending: false })

      if (error) throw error
      setEvaluations(data || [])
    } catch (error) {
      console.error("Erreur lors du chargement des évaluations:", error)
    }
  }

  // Fonction pour charger les documents du stagiaire
  const loadDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .eq("user_id", stagiaire?.user_id)
        .order("updated_at", { ascending: false })

      if (error) throw error
      setDocuments(data || [])
    } catch (error) {
      console.error("Erreur lors du chargement des documents:", error)
    }
  }

  // Fonction utilitaire pour obtenir la couleur du badge selon le statut
  const getStatusColor = (status: string) => {
    switch (status) {
      case "actif":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "termine":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "suspendu":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "annule":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  // Calcule la progression du stage en pourcentage
  const calculateProgress = () => {
    if (!stagiaire) return 0
    const start = new Date(stagiaire.date_debut)
    const end = new Date(stagiaire.date_fin)
    const now = new Date()

    if (now < start) return 0
    if (now > end) return 100

    const total = end.getTime() - start.getTime()
    const elapsed = now.getTime() - start.getTime()
    return Math.round((elapsed / total) * 100)
  }

  // Formate une date pour affichage
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR")
  }

  // Formate la taille d'un fichier pour affichage
  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "N/A"
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i]
  }

  // Affiche un loader pendant le chargement
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header de la page */}
      <Header user={user} />

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Bouton retour et titre */}
        <div className="mb-8">
          <Button variant="ghost" onClick={() => router.back()} className="mb-4 transition-transform duration-300 hover:scale-105">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{stagiaire?.users?.name}</h1>
              <p className="text-gray-600 dark:text-gray-400">
                {stagiaire?.specialite} - {stagiaire?.niveau}
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => router.push(`/tuteur/stagiaires/${params.id}/evaluation`)}
                className="transition-transform duration-300 hover:scale-105"
              >
                <ClipboardList className="mr-2 h-4 w-4" />
                Nouvelle évaluation
              </Button>
              <Button variant="outline" className="transition-transform duration-300 hover:scale-105">
                <MessageSquare className="mr-2 h-4 w-4" />
                Contacter
              </Button>
            </div>
          </div>
        </div>

        {/* Informations générales */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Card infos personnelles */}
          <Card className="lg:col-span-2 transition-all duration-300 hover:scale-85 hover:shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informations personnelles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                  <p className="font-medium flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {stagiaire?.users?.email}
                  </p>
                </div>
                {stagiaire?.users?.phone && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Téléphone</p>
                    <p className="font-medium">{stagiaire.users.phone}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Établissement</p>
                  <p className="font-medium">{stagiaire?.etablissement || "Non renseigné"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Statut</p>
                  <Badge className={getStatusColor(stagiaire?.status || "")}>{stagiaire?.status}</Badge>
                </div>
              </div>
              {stagiaire?.description && (
                <div className="mt-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Description</p>
                  <p className="mt-1">{stagiaire.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Card progression */}
          <Card className="transition-all duration-300 hover:scale-85 hover:shadow-xl" style={{ animationDelay: "0.1s" }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Progression du stage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Progression</span>
                    <span>{calculateProgress()}%</span>
                  </div>
                  <Progress value={calculateProgress()} className="h-2" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Date de début</p>
                  <p className="font-medium">{stagiaire?.date_debut && formatDate(stagiaire.date_debut)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Date de fin</p>
                  <p className="font-medium">{stagiaire?.date_fin && formatDate(stagiaire.date_fin)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Onglets pour évaluations et documents */}
        <Tabs defaultValue="evaluations" className="space-y-4">
          <TabsList>
            <TabsTrigger value="evaluations">Évaluations</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>

          {/* Onglet Évaluations */}
          <TabsContent value="evaluations">
            <Card className="transition-all duration-300 hover:scale-85 hover:shadow-xl" style={{ animationDelay: "0.2s" }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardList className="h-5 w-5" />
                  Évaluations ({evaluations.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {evaluations.length === 0 ? (
                  <div className="text-center py-8">
                    <ClipboardList className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Aucune évaluation</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Commencez par créer une évaluation pour ce stagiaire.
                    </p>
                    <div className="mt-6">
                      <Button
                        onClick={() => router.push(`/tuteur/stagiaires/${params.id}/evaluation`)}
                        className="transition-transform duration-300 hover:scale-105"
                      >
                        <ClipboardList className="mr-2 h-4 w-4" />
                        Nouvelle évaluation
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {evaluations.map((evaluation) => (
                      <div
                        key={evaluation.id}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg animate-fade-in-up"
                        style={{ animationDelay: "0.25s" }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold">{evaluation.type.replace("_", " ")}</h3>
                          <div className="flex items-center gap-2">
                            {evaluation.note_globale && (
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 text-yellow-500" />
                                <span className="font-medium">{evaluation.note_globale}/20</span>
                              </div>
                            )}
                            <span className="text-sm text-gray-500">{formatDate(evaluation.date_evaluation)}</span>
                          </div>
                        </div>
                        {evaluation.commentaires && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">{evaluation.commentaires}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Documents */}
          <TabsContent value="documents">
            <Card className="transition-all duration-300 hover:scale-[1.03] hover:shadow-xl animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Documents ({documents.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {documents.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Aucun document</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Aucun document n'a été téléchargé pour ce stagiaire.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {documents.map((document) => (
                      <div
                        key={document.id}
                        className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-lg animate-fade-in-up"
                        style={{ animationDelay: "0.35s" }}
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="font-medium">{document.nom}</p>
                            <p className="text-sm text-gray-500">
                              {document.type} • {formatFileSize(document.taille)} • {formatDate(document.date_upload)}
                            </p>
                          </div>
                        </div>
                        {/* Bouton de téléchargement */}
                        {document.url ? (
                          <a
                            href={document.url}
                            download={document.nom}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200 rounded hover:bg-green-200 dark:hover:bg-green-800 transition"
                          >
                            Télécharger
                          </a>
                        ) : (
                          <span className="text-xs text-gray-400">Non disponible</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
