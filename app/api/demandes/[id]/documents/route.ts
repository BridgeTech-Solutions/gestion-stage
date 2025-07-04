
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const { id } = params

    console.log("🔍 Récupération documents pour demande:", id)

    // Vérifier que l'utilisateur a accès à cette demande
    const { data: userProfile } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single()

    if (!userProfile) {
      return NextResponse.json({ error: "Profil utilisateur non trouvé" }, { status: 404 })
    }

    // Récupérer la demande pour vérifier les permissions
    const { data: demande, error: demandeError } = await supabase
      .from("demandes")
      .select(`
        *,
        stagiaire:stagiaires!inner(user_id)
      `)
      .eq("id", id)
      .single()

    if (demandeError || !demande) {
      console.error("❌ Demande non trouvée:", demandeError)
      return NextResponse.json({ 
        error: "Demande non trouvée",
        data: [],
        total: 0
      }, { status: 404 })
    }

    // Vérifier les permissions d'accès
    const canAccess = 
      userProfile.role === 'admin' ||
      userProfile.role === 'rh' ||
      (userProfile.role === 'tuteur' && demande.tuteur_id === user.id) ||
      (userProfile.role === 'stagiaire' && demande.stagiaire?.user_id === user.id)

    if (!canAccess) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
    }

    // Récupérer tous les documents liés à cette demande
    const { data: documents, error: documentsError } = await supabase
      .from("documents")
      .select(`
        id,
        nom,
        type,
        type_fichier,
        taille,
        url,
        chemin_fichier,
        demande_id,
        user_id,
        is_public,
        created_at,
        users!user_id(name, email)
      `)
      .eq("demande_id", id)
      .order("created_at", { ascending: false })

    if (documentsError) {
      console.error("❌ Erreur récupération documents:", documentsError)
      return NextResponse.json({ 
        error: "Erreur lors de la récupération des documents",
        data: [],
        total: 0
      }, { status: 500 })
    }

    console.log("✅ Documents trouvés:", documents?.length || 0)

    // Récupérer aussi les documents via la table de liaison demande_documents
    const { data: documentsLies, error: liaisonError } = await supabase
      .from("demande_documents")
      .select(`
        *,
        document:documents(
          id,
          nom,
          type,
          type_fichier,
          taille,
          url,
          chemin_fichier,
          user_id,
          is_public,
          created_at,
          users!user_id(name, email)
        )
      `)
      .eq("demande_id", id)

    if (!liaisonError && documentsLies) {
      const docsLies = documentsLies
        .filter(dl => dl.document)
        .map(dl => ({
          ...dl.document,
          type_document_demande: dl.type_document,
          obligatoire: dl.obligatoire
        }))

      // Fusionner les documents directs et ceux via liaison
      const allDocuments = [...(documents || []), ...docsLies]
      
      // Dédupliquer par ID
      const uniqueDocuments = allDocuments.filter((doc, index, self) => 
        index === self.findIndex(d => d.id === doc.id)
      )

      return NextResponse.json({
        success: true,
        demande_id: id,
        data: uniqueDocuments,
        total: uniqueDocuments.length
      })
    }

    return NextResponse.json({
      success: true,
      demande_id: id,
      data: documents || [],
      total: documents?.length || 0
    })

  } catch (error) {
    console.error("💥 Erreur API documents demande:", error)
    return NextResponse.json({ 
      error: "Erreur serveur",
      data: [],
      total: 0
    }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const { id } = params
    const { documents, ...rest } = await request.json()
    const documents_requis = Array.isArray(documents) ? documents : []

    // Vérification explicite des champs attendus
    const insertions = documents_requis.map(doc => {
      if (!doc.type) {
        throw new Error("Chaque document doit avoir un champ 'type'")
      }
      return {
        id: crypto.randomUUID(),
        demande_id: id,
        document_id: doc.document_id ?? null,
        type_document: doc.type,
        obligatoire: doc.obligatoire ?? false,
        created_at: new Date().toISOString()
      }
    })

    // Vérifier que la demande appartient à l'utilisateur
    const { data: demande, error: demandeError } = await supabase
      .from("demandes")
      .select(`
        *,
        stagiaire:stagiaires(user_id)
      `)
      .eq("id", id)
      .single()

    if (demandeError || !demande) {
      return NextResponse.json({ error: "Demande non trouvée" }, { status: 404 })
    }

    if (demande.stagiaire?.user_id !== user.id) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
    }

    // Insertion des liaisons document-demande
    const { data: liens, error: liensError } = await supabase
      .from("demande_documents")
      .insert(insertions)
      .select()

    if (liensError) {
      console.error("Erreur insertion liens:", liensError)
      return NextResponse.json({ error: "Erreur lors de l'association des documents" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: liens,
      message: "Documents associés avec succès"
    })

  } catch (error) {
    console.error("Erreur POST documents demande:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
