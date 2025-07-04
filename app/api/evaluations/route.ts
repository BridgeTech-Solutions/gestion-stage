
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Vérifier l'authentification
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    // Récupérer le profil utilisateur
    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: "Profil non trouvé" }, { status: 404 })
    }

    // Récupérer les évaluations selon le rôle
    let evaluationsQuery

    if (["admin", "rh"].includes(profile.role)) {
      // Admin/RH peuvent voir toutes les évaluations
      evaluationsQuery = supabase
        .from("evaluations")
        .select(`
          *,
          stagiaire:stagiaires(
            id,
            entreprise,
            poste,
            users!inner(name, email)
          ),
          tuteur:users!tuteur_id(name, email)
        `)
        .order("created_at", { ascending: false })
    } else if (profile.role === "tuteur") {
      // Tuteurs voient leurs évaluations
      evaluationsQuery = supabase
        .from("evaluations")
        .select(`
          *,
          stagiaire:stagiaires(
            id,
            entreprise,
            poste,
            users!inner(name, email)
          ),
          tuteur:users!tuteur_id(name, email)
        `)
        .eq("tuteur_id", user.id)
        .order("created_at", { ascending: false })
    } else if (profile.role === "stagiaire") {
      // Stagiaires voient leurs évaluations
      const { data: stagiaireProfile } = await supabase
        .from("stagiaires")
        .select("id")
        .eq("user_id", user.id)
        .single()

      if (stagiaireProfile) {
        evaluationsQuery = supabase
          .from("evaluations")
          .select(`
            *,
            stagiaire:stagiaires(
              id,
              entreprise,
              poste,
              users!inner(name, email)
            ),
            tuteur:users!tuteur_id(name, email)
          `)
          .eq("stagiaire_id", stagiaireProfile.id)
          .order("created_at", { ascending: false })
      } else {
        return NextResponse.json({ 
          success: true, 
          data: [],
          total: 0 
        })
      }
    } else {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
    }

    const { data: evaluations, error: evaluationsError } = await evaluationsQuery

    if (evaluationsError) {
      console.error("Erreur récupération évaluations:", evaluationsError)
      return NextResponse.json({ 
        error: "Erreur lors de la récupération des évaluations" 
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: evaluations || [],
      total: evaluations?.length || 0
    })

  } catch (error) {
    console.error("Erreur API évaluations:", error)
    return NextResponse.json({ 
      error: "Erreur serveur" 
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Vérifier l'authentification
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const body = await request.json()
    const { stagiaire_id, tuteur_id, ...evaluationData } = body

    // Créer l'évaluation
    const { data: evaluation, error: evaluationError } = await supabase
      .from("evaluations")
      .insert({
        ...evaluationData,
        stagiaire_id,
        tuteur_id: tuteur_id || user.id,
        created_by: user.id,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (evaluationError) {
      console.error("Erreur création évaluation:", evaluationError)
      return NextResponse.json({ 
        error: "Erreur lors de la création de l'évaluation" 
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: evaluation,
      message: "Évaluation créée avec succès"
    })

  } catch (error) {
    console.error("Erreur création évaluation:", error)
    return NextResponse.json({ 
      error: "Erreur serveur" 
    }, { status: 500 })
  }
}
