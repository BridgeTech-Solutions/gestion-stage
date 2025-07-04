
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Header } from "@/components/layout/header"
import { Calendar, CalendarDays, Save, ArrowLeft, User, GraduationCap } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

interface Stagiaire {
  id: string
  user_id: string
  users: {
    name: string
    email: string
  }
  specialite: string
  niveau: string
  tuteur_id: string
  tuteur?: {
    name: string
    email: string
  }
}

interface Evaluation {
  stagiaire_id: string
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
}

export default function NouvelleEvaluationPage() {
  const [user, setUser] = useState<any>(null)
  const [stagiaires, setStagiaires] = useState<Stagiaire[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  const { toast } = useToast()

  const [evaluation, setEvaluation] = useState<Evaluation>({
    stagiaire_id: "",
    periode_debut: "",
    periode_fin: "",
    type: "mi_parcours",
    note_globale: 10,
    competences_techniques: 10,
    competences_relationnelles: 10,
    autonomie: 10,
    ponctualite: 10,
    motivation: 10,
    commentaires: "",
    points_forts: "",
    axes_amelioration: "",
    objectifs_suivants: "",
    recommandations: "",
    statut: "brouillon"
  })

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
        await loadStagiaires()
        setLoading(false)
      } catch (error) {
        console.error("Erreur auth:", error)
        router.push("/auth/login")
      }
    }

    checkAuth()
  }, [router, supabase])

  const loadStagiaires = async () => {
    try {
      console.log("🔄 Chargement des stagiaires...")
      
      const response = await fetch('/api/rh/stagiaires', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      console.log("📡 Réponse API stagiaires status:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("❌ Erreur réponse stagiaires:", errorText)
        throw new Error(`Erreur ${response.status}: ${errorText}`)
      }

      const data = await response.json()
      console.log("📋 Données reçues stagiaires:", data)

      if (data.success && (data.stagiaires || data.data)) {
        // Utiliser data.stagiaires en priorité, sinon data.data
        const stagiairesList = data.stagiaires || data.data || []
        
        // Transformer les données pour correspondre à l'interface
        const stagiairesMapped = stagiairesList.map((s: any) => ({
          id: s.id,
          user_id: s.user_id,
          users: s.users || { name: "Nom non défini", email: "Email non défini" },
          specialite: s.entreprise || "Non définie",
          niveau: s.poste || "Non défini",
          tuteur_id: s.tuteur_id,
          tuteur: s.tuteur
        }))
        
        console.log("✅ Stagiaires mappés:", stagiairesMapped)
        setStagiaires(stagiairesMapped)
      } else {
        console.log("❌ Aucun stagiaire trouvé dans la réponse:", data)
        setStagiaires([])
      }
    } catch (error) {
      console.error("Erreur chargement stagiaires:", error)
      toast({
        title: "Erreur",
        description: "Impossible de charger les stagiaires",
        variant: "destructive",
      })
      setStagiaires([])
    }
  }

  const updateEvaluation = (field: keyof Evaluation, value: any) => {
    setEvaluation(prev => {
      const updated = { ...prev, [field]: value }
      
      // Calculer automatiquement la note globale
      if (['competences_techniques', 'competences_relationnelles', 'autonomie', 'ponctualite', 'motivation'].includes(field)) {
        const total = (
          updated.competences_techniques +
          updated.competences_relationnelles +
          updated.autonomie +
          updated.ponctualite +
          updated.motivation
        ) / 5
        updated.note_globale = Math.round(total * 10) / 10
      }
      
      return updated
    })
  }

  const handleSave = async () => {
    if (!evaluation.stagiaire_id || !evaluation.periode_debut || !evaluation.periode_fin) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      })
      return
    }

    setSaving(true)
    try {
      const response = await fetch('/api/evaluations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(evaluation),
      })

      if (!response.ok) {
        throw new Error("Erreur lors de la sauvegarde")
      }

      toast({
        title: "Succès",
        description: "Évaluation créée avec succès",
      })

      router.push("/rh/evaluations")
    } catch (error) {
      console.error("Erreur sauvegarde:", error)
      toast({
        title: "Erreur",
        description: "Erreur lors de la sauvegarde",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const selectedStagiaire = stagiaires.find(s => s.id === evaluation.stagiaire_id)

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

      <main className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Nouvelle évaluation</h1>
              <p className="text-gray-600">Créer une évaluation pour un stagiaire</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Sélection du stagiaire */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informations du stagiaire
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="stagiaire">Stagiaire *</Label>
                <Select value={evaluation.stagiaire_id} onValueChange={(value) => updateEvaluation("stagiaire_id", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un stagiaire" />
                  </SelectTrigger>
                  <SelectContent>
                    {stagiaires.map((stagiaire) => (
                      <SelectItem key={stagiaire.id} value={stagiaire.id}>
                        {stagiaire.users?.name || "Nom non défini"} - {stagiaire.specialite}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedStagiaire && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Informations du stagiaire</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Nom:</span> {selectedStagiaire.users?.name || "Non défini"}
                    </div>
                    <div>
                      <span className="font-medium">Email:</span> {selectedStagiaire.users?.email || "Non défini"}
                    </div>
                    <div>
                      <span className="font-medium">Entreprise:</span> {selectedStagiaire.specialite}
                    </div>
                    <div>
                      <span className="font-medium">Poste:</span> {selectedStagiaire.niveau}
                    </div>
                    {selectedStagiaire.tuteur && (
                      <div>
                        <span className="font-medium">Tuteur:</span> {selectedStagiaire.tuteur.name}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Informations générales */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5" />
                Informations générales
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Type d'évaluation</Label>
                  <Select value={evaluation.type} onValueChange={(value) => updateEvaluation("type", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mi_parcours">Mi-parcours</SelectItem>
                      <SelectItem value="finale">Finale</SelectItem>
                      <SelectItem value="auto_evaluation">Auto-évaluation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="statut">Statut</Label>
                  <Select value={evaluation.statut} onValueChange={(value) => updateEvaluation("statut", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="brouillon">Brouillon</SelectItem>
                      <SelectItem value="en_cours">En cours</SelectItem>
                      <SelectItem value="finalisee">Finalisée</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="periode_debut">Période de début *</Label>
                  <Input
                    id="periode_debut"
                    type="date"
                    value={evaluation.periode_debut}
                    onChange={(e) => updateEvaluation("periode_debut", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="periode_fin">Période de fin *</Label>
                  <Input
                    id="periode_fin"
                    type="date"
                    value={evaluation.periode_fin}
                    onChange={(e) => updateEvaluation("periode_fin", e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Critères d'évaluation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Critères d'évaluation
              </CardTitle>
              <CardDescription>
                Notez chaque critère sur 20. La note globale sera calculée automatiquement.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-3xl font-bold text-blue-600">{evaluation.note_globale}/20</div>
                <div className="text-sm text-gray-600">Note globale</div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Compétences techniques ({evaluation.competences_techniques}/20)</Label>
                  <Slider
                    value={[evaluation.competences_techniques]}
                    onValueChange={(value) => updateEvaluation("competences_techniques", value[0])}
                    max={20}
                    step={1}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Compétences relationnelles ({evaluation.competences_relationnelles}/20)</Label>
                  <Slider
                    value={[evaluation.competences_relationnelles]}
                    onValueChange={(value) => updateEvaluation("competences_relationnelles", value[0])}
                    max={20}
                    step={1}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Autonomie ({evaluation.autonomie}/20)</Label>
                  <Slider
                    value={[evaluation.autonomie]}
                    onValueChange={(value) => updateEvaluation("autonomie", value[0])}
                    max={20}
                    step={1}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Ponctualité ({evaluation.ponctualite}/20)</Label>
                  <Slider
                    value={[evaluation.ponctualite]}
                    onValueChange={(value) => updateEvaluation("ponctualite", value[0])}
                    max={20}
                    step={1}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Motivation ({evaluation.motivation}/20)</Label>
                  <Slider
                    value={[evaluation.motivation]}
                    onValueChange={(value) => updateEvaluation("motivation", value[0])}
                    max={20}
                    step={1}
                    className="mt-2"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Commentaires */}
          <Card>
            <CardHeader>
              <CardTitle>Commentaires et observations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="commentaires">Commentaires généraux</Label>
                <Textarea
                  id="commentaires"
                  value={evaluation.commentaires}
                  onChange={(e) => updateEvaluation("commentaires", e.target.value)}
                  placeholder="Commentaires généraux sur la performance du stagiaire..."
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="points_forts">Points forts</Label>
                <Textarea
                  id="points_forts"
                  value={evaluation.points_forts}
                  onChange={(e) => updateEvaluation("points_forts", e.target.value)}
                  placeholder="Quels sont les points forts du stagiaire ?"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="axes_amelioration">Axes d'amélioration</Label>
                <Textarea
                  id="axes_amelioration"
                  value={evaluation.axes_amelioration}
                  onChange={(e) => updateEvaluation("axes_amelioration", e.target.value)}
                  placeholder="Quels sont les axes d'amélioration ?"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="objectifs_suivants">Objectifs pour la suite</Label>
                <Textarea
                  id="objectifs_suivants"
                  value={evaluation.objectifs_suivants}
                  onChange={(e) => updateEvaluation("objectifs_suivants", e.target.value)}
                  placeholder="Quels sont les objectifs pour la suite du stage ?"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="recommandations">Recommandations</Label>
                <Textarea
                  id="recommandations"
                  value={evaluation.recommandations}
                  onChange={(e) => updateEvaluation("recommandations", e.target.value)}
                  placeholder="Recommandations pour l'avenir..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={() => router.back()}>
              Annuler
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              <Save className="mr-2 h-4 w-4" />
              {saving ? "Enregistrement..." : "Créer l'évaluation"}
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
