"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/layout/header"
import { ArrowLeft, BarChart3, TrendingUp, Users, Star } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

interface EvaluationStats {
  total: number
  byStatus: { [key: string]: number }
  byType: { [key: string]: number }
  averageScore: number
  scoreDistribution: { [key: string]: number }
}

export default function RHEvaluationsStatsPage() {
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState<EvaluationStats | null>(null)
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
        await loadStats()
        setLoading(false)
      } catch (error) {
        console.error("Erreur auth:", error)
        router.push("/auth/login")
      }
    }

    checkAuth()
  }, [router, supabase])

  const loadStats = async () => {
    try {
      const response = await fetch('/api/evaluations', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}`)
      }

      const data = await response.json()

      if (data.success && data.evaluations) {
        const evaluations = data.evaluations
        
        // Calculer les statistiques
        const total = evaluations.length
        const byStatus = evaluations.reduce((acc: any, evaluation: any) => {
          acc[evaluation.statut] = (acc[evaluation.statut] || 0) + 1
          return acc
        }, {})
        
        const byType = evaluations.reduce((acc: any, evaluation: any) => {
          acc[evaluation.type] = (acc[evaluation.type] || 0) + 1
          return acc
        }, {})

        const validScores = evaluations.filter((e: any) => e.note_globale > 0)
        const averageScore = validScores.length > 0 
          ? validScores.reduce((sum: number, e: any) => sum + e.note_globale, 0) / validScores.length 
          : 0

        const scoreDistribution = validScores.reduce((acc: any, evaluation: any) => {
          const score = evaluation.note_globale
          if (score >= 16) acc['Excellent'] = (acc['Excellent'] || 0) + 1
          else if (score >= 14) acc['Très bien'] = (acc['Très bien'] || 0) + 1
          else if (score >= 12) acc['Bien'] = (acc['Bien'] || 0) + 1
          else if (score >= 10) acc['Assez bien'] = (acc['Assez bien'] || 0) + 1
          else acc['Insuffisant'] = (acc['Insuffisant'] || 0) + 1
          return acc
        }, {})

        setStats({
          total,
          byStatus,
          byType,
          averageScore: Math.round(averageScore * 100) / 100,
          scoreDistribution
        })
      }
    } catch (error) {
      console.error("Erreur chargement stats:", error)
      toast({
        title: "Erreur",
        description: "Impossible de charger les statistiques",
        variant: "destructive",
      })
    }
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
          <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Statistiques des évaluations</h1>
              <p className="text-gray-600">Vue d'ensemble des évaluations des stagiaires</p>
            </div>
          </div>
        </div>

        {stats && (
          <div className="space-y-6">
            {/* Statistiques générales */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total évaluations</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.total}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Note moyenne</CardTitle>
                  <Star className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.averageScore}/20</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Finalisées</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.byStatus.finalisee || 0}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">En cours</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.byStatus.en_cours || 0}</div>
                </CardContent>
              </Card>
            </div>

            {/* Répartition par statut */}
            <Card>
              <CardHeader>
                <CardTitle>Répartition par statut</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(stats.byStatus).map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between">
                      <span className="capitalize">{status.replace('_', ' ')}</span>
                      <span className="font-bold">{count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Répartition par type */}
            <Card>
              <CardHeader>
                <CardTitle>Répartition par type</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(stats.byType).map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between">
                      <span className="capitalize">{type.replace('_', ' ')}</span>
                      <span className="font-bold">{count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Distribution des notes */}
            <Card>
              <CardHeader>
                <CardTitle>Distribution des notes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(stats.scoreDistribution).map(([range, count]) => (
                    <div key={range} className="flex items-center justify-between">
                      <span>{range}</span>
                      <span className="font-bold">{count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}
