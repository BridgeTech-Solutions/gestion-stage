import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { id } = params

    const { data: { session }, error: authError } = await supabase.auth.getSession()

    if (authError || !session) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    // Récupérer l'évaluation avec tous les détails
    const { data, error } = await supabase
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
      .eq('id', id)
      .single()

    if (error) {
      console.error('❌ Erreur get evaluation:', error)
      return NextResponse.json(
        { error: 'Évaluation non trouvée' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      evaluation: data
    })

  } catch (error) {
    console.error('💥 Erreur evaluation:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { id } = params

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
      .update({
        ...evaluationData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()

    if (error) {
      console.error('❌ Erreur update evaluation:', error)
      return NextResponse.json(
        { error: 'Erreur lors de la mise à jour' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      evaluation: data[0]
    })

  } catch (error) {
    console.error('💥 Erreur update evaluation:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { id } = params

    const { data: { session }, error: authError } = await supabase.auth.getSession()

    if (authError || !session) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const { error } = await supabase
      .from('evaluations')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('❌ Erreur delete evaluation:', error)
      return NextResponse.json(
        { error: 'Erreur lors de la suppression' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Évaluation supprimée avec succès'
    })

  } catch (error) {
    console.error('💥 Erreur delete evaluation:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
