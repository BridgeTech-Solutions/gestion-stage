import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { PDFDocument, rgb, StandardFonts } from "pdf-lib"

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const { demandeId, templateType } = await request.json()

    // Récupérer les données de la demande
    const { data: demande, error } = await supabase
      .from("demandes")
      .select(`
        *,
        stagiaire:stagiaires(
          *,
          user:users(*)
        )
      `)
      .eq("id", demandeId)
      .single()

    if (error || !demande) {
      return NextResponse.json({ error: "Demande non trouvée" }, { status: 404 })
    }

    // Générer le document selon le type
    let documentContent: Uint8Array | string = ""
    let fileName = ""

    switch (templateType) {
      case "convention":
        documentContent = generateConventionPDF(demande)
        fileName = `convention_${demande.stagiaire.user.first_name}_${demande.stagiaire.user.last_name}.pdf`
        break
      case "attestation":
        documentContent = await generateAttestationPDF(demande)
        fileName = `attestation_${demande.stagiaire.user.first_name}_${demande.stagiaire.user.last_name}.pdf`
        break
      default:
        return NextResponse.json({ error: "Type de document non supporté" }, { status: 400 })
    }

    if (templateType === "attestation") {
      return new NextResponse(documentContent as Uint8Array, {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename=${fileName}`,
        },
      })
    }

    // Sauvegarder le document généré
    const { data: document, error: docError } = await supabase
      .from("documents")
      .insert({
        user_id: demande.stagiaire.user_id,
        demande_id: demandeId,
        nom: fileName,
        type: templateType,
        taille: documentContent.length,
        chemin: `generated/${fileName}`,
        statut: "genere",
      })
      .select()
      .single()

    if (docError) {
      return NextResponse.json({ error: "Erreur lors de la sauvegarde" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      document,
      downloadUrl: `/api/documents/download/${document.id}`,
    })
  } catch (error) {
    console.error("Erreur génération document:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

function generateConventionPDF(demande: any): string {
  // Logique de génération PDF pour convention
  return `Convention de stage pour ${demande.stagiaire.user.first_name} ${demande.stagiaire.user.last_name}`
}

async function generateAttestationPDF(demande: any) {
  const pdfDoc = await PDFDocument.create()
  const page = pdfDoc.addPage([595, 842]) // A4 portrait
  const { width, height } = page.getSize()
  const font = await pdfDoc.embedFont(StandardFonts.TimesRoman)
  const fontBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold)

  // Encadré
  page.drawRectangle({
    x: 20,
    y: 20,
    width: width - 40,
    height: height - 40,
    borderColor: rgb(0, 0, 0),
    borderWidth: 2,
  })

  // Titre
  page.drawText("République Algérienne Démocratique et Populaire", {
    x: 60,
    y: height - 60,
    size: 12,
    font,
    color: rgb(0, 0, 0),
  })
  page.drawText("Attestation de stage", {
    x: width / 2 - 100,
    y: height - 100,
    size: 28,
    font: fontBold,
    color: rgb(0, 0, 0),
  })

  // Champs dynamiques
  const stagiaire = demande.stagiaire.user
  let y = height - 140
  const line = (txt: string, size = 14, bold = false, offset = 0) => {
    page.drawText(txt, {
      x: 60 + offset,
      y,
      size,
      font: bold ? fontBold : font,
      color: rgb(0, 0, 0),
    })
    y -= size + 8
  }

  line(`Je, soussigné(e) (le responsable de stage) : ${demande.responsable || ""}`)
  line(`Que l’étudiant(e) : ${stagiaire.first_name} ${stagiaire.last_name}    né(e) le ${stagiaire.date_naissance || ""} à ${stagiaire.lieu_naissance || ""}`)
  line(`Inscrit(e) à la Faculté de Technologie, Université Hassiba Benbouali Chlef.`)
  line(`A effectué un stage de fin de formation dans la filière : ${demande.filiere || ""}`)
  line(`A (l’établissement, administration ...) : ${demande.etablissement || ""}`)
  line(`Durant la période de ${demande.date_debut || ""} à ${demande.date_fin || ""}`)
  y -= 10
  line(`Fait à ${demande.lieu || ""} le ${demande.date_attestation || ""}`, 14, false, 200)

  // Signatures
  y -= 40
  line("Le Doyen de la Faculté de Technologie", 12, true, 0)
  line("Le Responsable de l’établissement ou l’administration d’accueil", 12, true, 220)

  // Bas de page
  page.drawText(
    "Cette attestation est délivrée pour servir et faire valoir que de droit",
    { x: 60, y: 40, size: 10, font, color: rgb(0, 0, 0) }
  )

  return await pdfDoc.save()
}
