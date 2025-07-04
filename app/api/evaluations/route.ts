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
        stagiaire:stagiaires(
          id,
          user_id,
          specialite,
          niveau,
          users(name, email)
        ),
        evaluateur:users(name, email)
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
      console.error('❌ Détails erreur:', {
        message: error.message,
        hint: error.hint,
        details: error.details,
        code: error.code
      })
      
      // Si c'est un problème de relation, essayer une requête plus simple
      if (error.code === 'PGRST116' || error.message.includes('foreign key')) {
        console.log("🔄 Tentative de requête simplifiée...")
        const { data: simpleData, error: simpleError } = await supabase
          .from('evaluations')
          .select('*')
          .order('created_at', { ascending: false })
          
        if (simpleError) {
          console.error('❌ Erreur requête simple:', simpleError)
          return NextResponse.json(
            { 
              success: false, 
              error: 'Erreur lors de la récupération des évaluations: ' + simpleError.message,
              evaluations: []
            },
            { status: 500 }
          )
        }
        
        return NextResponse.json({
          success: true,
          evaluations: simpleData || [],
          total: simpleData?.length || 0,
          user_role: userProfile.role,
          warning: 'Données simplifiées - relations non chargées'
        })
      }
      
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
      console.error("❌ Stagiaire ID manquant")
      return NextResponse.json(
        { 
          success: false,
          error: 'ID du stagiaire requis' 
        },
        { status: 400 }
      )
    }

    // Valider les données d'évaluation
    if (!evaluationData.periode_debut || !evaluationData.periode_fin) {
      console.error("❌ Périodes manquantes")
      return NextResponse.json(
        { 
          success: false,
          error: 'Les périodes de début et fin sont requises' 
        },
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

    // Préparer les données pour l'insertion - convertir les valeurs null/undefined
    const insertData = {
      stagiaire_id: evaluationData.stagiaire_id,
      evaluateur_id: session.user.id,
      periode_debut: evaluationData.periode_debut || null,
      periode_fin: evaluationData.periode_fin || null,
      type: evaluationData.type || 'mi_parcours',
      note_globale: Number(evaluationData.note_globale) || 0,
      competences_techniques: Number(evaluationData.competences_techniques) || 0,
      competences_relationnelles: Number(evaluationData.competences_relationnelles) || 0,
      autonomie: Number(evaluationData.autonomie) || 0,
      ponctualite: Number(evaluationData.ponctualite) || 0,
      motivation: Number(evaluationData.motivation) || 0,
      commentaires: evaluationData.commentaires || null,
      points_forts: evaluationData.points_forts || null,
      axes_amelioration: evaluationData.axes_amelioration || null,
      objectifs_suivants: evaluationData.objectifs_suivants || null,
      recommandations: evaluationData.recommandations || null,
      statut: evaluationData.statut || 'brouillon'
    }

    console.log("💾 Données à insérer:", insertData)

    const { data, error } = await supabase
      .from('evaluations')
      .insert(insertData)
      .select('*')

    if (error) {
      console.error('❌ Erreur create evaluation:', error)
      console.error('❌ Détails erreur:', {
        message: error.message,
        hint: error.hint,
        details: error.details,
        code: error.code
      })
      
      // Retourner des erreurs plus spécifiques
      if (error.code === '23503') {
        return NextResponse.json(
          { 
            success: false,
            error: 'Clé étrangère invalide - vérifiez que le stagiaire et l\'évaluateur existent',
            code: error.code 
          },
          { status: 400 }
        )
      }
      
      if (error.code === '23505') {
        return NextResponse.json(
          { 
            success: false,
            error: 'Une évaluation existe déjà pour ce stagiaire dans cette période',
            code: error.code 
          },
          { status: 409 }
        )
      }
      
      return NextResponse.json(
        { 
          success: false,
          error: 'Erreur lors de la création de l\'évaluation: ' + error.message,
          details: error.hint || 'Aucun détail supplémentaire'
        },
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
