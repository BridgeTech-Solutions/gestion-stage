import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    if (!supabase) {
      console.error("❌ Impossible de créer le client Supabase")
      return NextResponse.json(
        { error: 'Erreur de configuration' },
        { status: 500 }
      )
    }

    const { data: { session }, error: authError } = await supabase.auth.getSession()

    if (authError || !session) {
      console.error("❌ Erreur auth évaluations:", authError)
      return NextResponse.json(
        { 
          success: false,
          error: 'Non autorisé',
          evaluations: []
        },
        { status: 401 }
      )
    }

    console.log("✅ Session trouvée pour évaluations:", session.user.email)

    // Vérifier le rôle de l'utilisateur
    const { data: userProfile, error: profileError } = await supabase
      .from("users")
      .select("role, name")
      .eq("id", session.user.id)
      .single()

    if (profileError || !userProfile) {
      console.error("❌ Erreur profil utilisateur:", profileError)
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      )
    }

    console.log("✅ Rôle utilisateur:", userProfile.role, "Nom:", userProfile.name)

    const { searchParams } = new URL(request.url)
    const stagiaireId = searchParams.get('stagiaire_id')
    const tuteurId = searchParams.get('tuteur_id')

    // Récupérer l'évaluation avec tous les détails
    let query = supabase
      .from('evaluations')
      .select(`
        *,
        stagiaire:stagiaires!inner(
          id,
          user_id,
          specialite,
          niveau,
          users!inner(name, email),
          tuteur:users!stagiaires_tuteur_id_fkey(name, email)
        ),
        evaluateur:users!evaluations_evaluateur_id_fkey(name, email)
      `)
      .order('created_at', { ascending: false })

    // Filtres selon les paramètres
    if (stagiaireId) {
      console.log("🔍 Filtre par stagiaire:", stagiaireId)
      query = query.eq('stagiaire_id', stagiaireId)
    }

    if (tuteurId) {
      console.log("🔍 Filtre par tuteur:", tuteurId)
      query = query.eq('evaluateur_id', tuteurId)
    }

    // Filtres selon le rôle
    if (userProfile.role === 'tuteur') {
      // Les tuteurs ne voient que les évaluations qu'ils ont créées
      console.log("🔍 Filtre tuteur - évaluations créées par:", session.user.id)
      query = query.eq('evaluateur_id', session.user.id)
    } else if (userProfile.role === 'stagiaire') {
      // Les stagiaires ne voient que leurs propres évaluations
      const { data: stagiaireProfile } = await supabase
        .from('stagiaires')
        .select('id')
        .eq('user_id', session.user.id)
        .single()

      if (stagiaireProfile) {
        console.log("🔍 Filtre stagiaire - évaluations pour:", stagiaireProfile.id)
        query = query.eq('stagiaire_id', stagiaireProfile.id)
      }
    } else if (['admin', 'rh'].includes(userProfile.role)) {
      console.log("🔍 Admin/RH - accès à toutes les évaluations")
      // Les admins et RH voient toutes les évaluations (pas de filtre supplémentaire)
    }

    console.log("🔍 Exécution de la requête évaluations...")
    const { data, error } = await query

    if (error) {
      console.error('❌ Erreur get evaluations:', error)
      console.error('❌ Détails erreur:', error.message, error.hint)
      return NextResponse.json(
        { 
          success: false, 
          error: 'Erreur lors de la récupération des évaluations: ' + error.message,
          evaluations: []
        },
        { status: 500 }
      )
    }

    console.log("✅ Évaluations récupérées:", data?.length || 0)

    // Log des données pour debug
    if (data && data.length > 0) {
      console.log("📋 Première évaluation:", JSON.stringify(data[0], null, 2))
    }

    return NextResponse.json({
      success: true,
      evaluations: data || [],
      total: data?.length || 0,
      user_role: userProfile.role
    })

  } catch (error) {
    console.error('💥 Erreur evaluations:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { session }, error: authError } = await supabase.auth.getSession()

    if (authError || !session) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const evaluationData = await request.json()

    const { data, error } = await supabase
      .from('evaluations')
      .insert({
        ...evaluationData,
        evaluateur_id: session.user.id,
        created_at: new Date().toISOString()
      })
      .select()

    if (error) {
      console.error('❌ Erreur create evaluation:', error)
      return NextResponse.json(
        { error: 'Erreur lors de la création de l\'évaluation' },
        { status: 500 }
      )
    }

    return NextResponse.json(data[0], { status: 201 })

  } catch (error) {
    console.error('💥 Erreur create evaluation:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
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
