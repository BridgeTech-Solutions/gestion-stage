import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Vérifier l'authentification
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File
    const type = formData.get("type") as string
    const demandeId = formData.get("demande_id") as string
    const isPublic = formData.get("is_public") === "true"

    if (!file) {
      return NextResponse.json({ error: "Aucun fichier fourni" }, { status: 400 })
    }

    // Vérifier la taille du fichier (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "Fichier trop volumineux (max 10MB)" }, { status: 400 })
    }

    // Générer un nom unique pour le fichier
    const timestamp = Date.now()
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const fileName = `${timestamp}_${cleanFileName}`
    const filePath = `${user.id}/${fileName}`

    try {
      // Upload vers Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("documents")
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        console.error("❌ Erreur upload storage:", uploadError)
        return NextResponse.json({ error: "Erreur lors de l'upload" }, { status: 500 })
      }

      // Insérer les métadonnées en base
      const { data: document, error: insertError } = await supabase
        .from("documents")
        .insert({
          nom: file.name,
          type: type || "document",
          type_fichier: file.type,
          taille: file.size,
          chemin_fichier: filePath,
          user_id: user.id,
          demande_id: demandeId || null,
          is_public: isPublic,
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (insertError) {
        // Nettoyer le fichier uploadé en cas d'erreur
        await supabase.storage.from("documents").remove([filePath])
        console.error("❌ Erreur insertion document:", insertError)
        return NextResponse.json({ error: "Erreur lors de l'enregistrement" }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        data: document,
        message: "Document uploadé avec succès"
      })

    } catch (storageError) {
      console.error("💥 Erreur storage:", storageError)
      return NextResponse.json({ error: "Erreur de stockage" }, { status: 500 })
    }

  } catch (error: any) {
    console.error("💥 Erreur upload document:", error)
    return NextResponse.json({ 
      error: "Erreur interne: " + error.message 
    }, { status: 500 })
  }
}

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

    // Récupérer les documents avec une requête sûre
    let documentsQuery

    if (["admin", "rh"].includes(profile.role)) {
      // Admin/RH peuvent voir tous les documents
      documentsQuery = supabase
        .from("documents")
        .select("*")
        .order("created_at", { ascending: false })
    } else {
      // Autres utilisateurs voient leurs documents + publics
      documentsQuery = supabase
        .from("documents")
        .select("*")
        .or(`user_id.eq.${user.id},is_public.eq.true`)
        .order("created_at", { ascending: false })
    }

    const { data: documents, error: documentsError } = await documentsQuery

    if (documentsError) {
      console.error("Erreur récupération documents:", documentsError)
      return NextResponse.json({ error: "Erreur lors de la récupération des documents" }, { status: 500 })
    }

    // Enrichir avec les infos utilisateur en faisant des requêtes séparées
    const enrichedDocuments = []

    if (documents && documents.length > 0) {
      for (const doc of documents) {
        try {
          const { data: docUser } = await supabase
            .from("users")
            .select("name, email")
            .eq("id", doc.user_id)
            .single()

          enrichedDocuments.push({
            ...doc,
            users: docUser || { name: "Utilisateur inconnu", email: "" }
          })
        } catch (error) {
          // Si pas d'utilisateur trouvé, garder le document sans info utilisateur
          enrichedDocuments.push({
            ...doc,
            users: { name: "Utilisateur inconnu", email: "" }
          })
        }
      }
    }

    return NextResponse.json({
      success: true,
      documents: enrichedDocuments,
      data: enrichedDocuments // Pour compatibilité
    })

  } catch (error) {
    console.error("Erreur API documents:", error)
    return NextResponse.json({ 
      error: "Erreur serveur", 
      success: false
    }, { status: 500 })
  }
}
