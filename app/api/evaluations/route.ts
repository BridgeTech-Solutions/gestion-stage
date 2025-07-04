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
      console.error("❌ Erreur auth évaluation POST:", authError)
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const evaluationData = await request.json()
    console.log("📋 Données évaluation reçues:", evaluationData)

    // Vérifier que les champs requis sont présents
    if (!evaluationData.stagiaire_id) {
      return NextResponse.json(
        { error: 'ID du stagiaire requis' },
        { status: 400 }
      )
    }

    // Vérifier que le stagiaire existe
    const { data: stagiaireExists, error: stagiaireError } = await supabase
      .from('stagiaires')
      .select('id')
      .eq('id', evaluationData.stagiaire_id)
      .single()

    if (stagiaireError || !stagiaireExists) {
      console.error("❌ Stagiaire non trouvé:", evaluationData.stagiaire_id)
      return NextResponse.json(
        { error: 'Stagiaire non trouvé' },
        { status: 404 }
      )
    }

    // Préparer les données pour l'insertion
    const insertData = {
      stagiaire_id: evaluationData.stagiaire_id,
      evaluateur_id: session.user.id,
      periode_debut: evaluationData.periode_debut,
      periode_fin: evaluationData.periode_fin,
      type: evaluationData.type || 'mi_parcours',
      note_globale: evaluationData.note_globale || 0,
      competences_techniques: evaluationData.competences_techniques || 0,
      competences_relationnelles: evaluationData.competences_relationnelles || 0,
      autonomie: evaluationData.autonomie || 0,
      ponctualite: evaluationData.ponctualite || 0,
      motivation: evaluationData.motivation || 0,
      commentaires: evaluationData.commentaires || '',
      points_forts: evaluationData.points_forts || '',
      axes_amelioration: evaluationData.axes_amelioration || '',
      objectifs_suivants: evaluationData.objectifs_suivants || '',
      recommandations: evaluationData.recommandations || '',
      statut: evaluationData.statut || 'brouillon',
      created_at: new Date().toISOString()
    }

    console.log("💾 Données à insérer:", insertData)

    const { data, error } = await supabase
      .from('evaluations')
      .insert(insertData)
      .select(`
        *,
        stagiaire:stagiaires!inner(
          id,
          user_id,
          specialite,
          niveau,
          users!inner(name, email)
        ),
        evaluateur:users!evaluations_evaluateur_id_fkey(name, email)
      `)

    if (error) {
      console.error('❌ Erreur create evaluation:', error)
      console.error('❌ Détails erreur:', error.message, error.hint, error.details)
      return NextResponse.json(
        { error: 'Erreur lors de la création de l\'évaluation: ' + error.message },
        { status: 500 }
      )
    }

    console.log("✅ Évaluation créée:", data[0])

    return NextResponse.json({
      success: true,
      data: data[0],
      message: 'Évaluation créée avec succès'
    }, { status: 201 })

  } catch (error) {
    console.error('💥 Erreur create evaluation:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
