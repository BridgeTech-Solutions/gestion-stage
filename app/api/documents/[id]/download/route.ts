import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()

    // Vérifier l'authentification
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const { id } = params

    // Récupérer le document
    const { data: document, error: docError } = await supabase
      .from("documents")
      .select("*")
      .eq("id", id)
      .single()

    if (docError || !document) {
      return NextResponse.json({ error: "Document non trouvé" }, { status: 404 })
    }

    // Vérifier les permissions
    const { data: userProfile } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single()

    const canAccess = 
      document.user_id === user.id ||
      document.is_public ||
      userProfile?.role === 'admin' ||
      userProfile?.role === 'rh'

    if (!canAccess) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
    }

    // Télécharger le fichier depuis Supabase Storage
    const filePath = document.chemin_fichier || document.url

    if (!filePath) {
      return NextResponse.json({ error: "Chemin de fichier non trouvé" }, { status: 404 })
    }

    console.log("📁 Tentative de téléchargement:", filePath)

    const { data: fileData, error: downloadError } = await supabase.storage
      .from("documents")
      .download(filePath)

    if (downloadError) {
      console.error("❌ Erreur téléchargement storage:", downloadError)
      return NextResponse.json({ error: "Fichier non trouvé dans le storage" }, { status: 404 })
    }

    // Convertir en buffer pour la réponse
    const buffer = await fileData.arrayBuffer()

    // Déterminer le type MIME
    const getContentType = (filename: string) => {
      const ext = filename.toLowerCase().split('.').pop()
      switch (ext) {
        case 'pdf': return 'application/pdf'
        case 'doc': return 'application/msword'
        case 'docx': return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        case 'jpg':
        case 'jpeg': return 'image/jpeg'
        case 'png': return 'image/png'
        case 'txt': return 'text/plain'
        default: return 'application/octet-stream'
      }
    }

    const contentType = document.type_fichier || getContentType(document.nom)

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${document.nom}"`,
        'Content-Length': buffer.byteLength.toString(),
      },
    })

  } catch (error) {
    console.error("💥 Erreur API download:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
