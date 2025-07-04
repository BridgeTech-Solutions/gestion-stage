
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { path, filename } = await request.json()

    if (!path) {
      return NextResponse.json({ error: 'Chemin du fichier requis' }, { status: 400 })
    }

    // Télécharger le fichier depuis le bucket
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('documents')
      .download(path)

    if (downloadError) {
      console.error('Erreur téléchargement storage:', downloadError)
      return NextResponse.json({ error: 'Fichier non trouvé' }, { status: 404 })
    }

    // Convertir en buffer
    const buffer = await fileData.arrayBuffer()

    // Déterminer le type MIME basé sur l'extension
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

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': getContentType(filename || path),
        'Content-Disposition': `attachment; filename="${filename || path}"`,
        'Content-Length': buffer.byteLength.toString(),
      },
    })

  } catch (error) {
    console.error('Erreur API download-from-storage:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
