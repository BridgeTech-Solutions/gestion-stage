import { supabase } from "../supabase/client"
import type { Database } from "../supabase/database.types"

export type Document = Database["public"]["Tables"]["documents"]["Row"]
export type DocumentInsert = Database["public"]["Tables"]["documents"]["Insert"]
export type DocumentUpdate = Database["public"]["Tables"]["documents"]["Update"]

export const documentsService = {
  async getAll(filters?: { type?: string; stagiaireId?: string; format?: string }) {
    let query = supabase.from("documents").select("*")

    if (filters?.type && filters.type !== "all") {
      query = query.eq("type", filters.type)
    }

    if (filters?.stagiaireId) {
      query = query.eq("stagiaire_id", filters.stagiaireId)
    }

    if (filters?.format && filters.format !== "all") {
      query = query.eq("format", filters.format)
    }

    const { data, error } = await query

    if (error) throw new Error(error.message)

    return data
  },

  async getById(id: string) {
    const { data, error } = await supabase.from("documents").select("*").eq("id", id).single()

    if (error) throw new Error(error.message)

    return data
  },

  async create(document: DocumentInsert) {
    const { data, error } = await supabase
      .from("documents")
      .insert({
        ...document,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw new Error(error.message)

    return data
  },

  async update(id: string, document: DocumentUpdate) {
    const { data, error } = await supabase
      .from("documents")
      .update({
        ...document,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) throw new Error(error.message)

    return data
  },

  async delete(id: string) {
    // Récupérer l'URL du fichier pour le supprimer du stockage
    const { data: document } = await supabase.from("documents").select("url").eq("id", id).single()

    if (document && document.url) {
      const path = document.url.split("/").pop()
      if (path) {
        await supabase.storage.from("documents").remove([path])
      }
    }

    // Supprimer l'entrée de la base de données
    const { error } = await supabase.from("documents").delete().eq("id", id)

    if (error) throw new Error(error.message)

    return true
  },

  async upload(file: File, metadata: Partial<DocumentInsert>) {
    // Générer un nom de fichier unique
    const fileExt = file.name.split(".").pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`
    const filePath = `${metadata.stagiaire_id}/${fileName}`

    // Uploader le fichier
    const { error: uploadError, data } = await supabase.storage.from("documents").upload(filePath, file)

    if (uploadError) throw new Error(uploadError.message)

    // Obtenir l'URL publique
    const { data: publicUrl } = supabase.storage.from("documents").getPublicUrl(filePath)

    // Créer l'entrée dans la base de données
    const { data: document, error } = await supabase
      .from("documents")
      .insert({
        date: new Date().toISOString(),
        nom: metadata.nom || file.name,
        description: metadata.description || "",
        format: (fileExt?.toUpperCase() === "PDF"
          ? "PDF"
          : fileExt?.toUpperCase() === "DOC" || fileExt?.toUpperCase() === "DOCX"
            ? "DOC"
            : "IMG") as any,
        stagiaire_id: metadata.stagiaire_id!,
        type: metadata.type || "autre",
        url: publicUrl.publicUrl,
        taille: `${(file.size / 1024).toFixed(2)} Ko`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      // En cas d'erreur, supprimer le fichier uploadé
      await supabase.storage.from("documents").remove([filePath])
      throw new Error(error.message)
    }

    return document
  },

  async download(id: string) {
    const { data: document } = await supabase.from("documents").select("url, nom").eq("id", id).single()

    if (!document) throw new Error("Document non trouvé")

    // Télécharger le fichier
    const response = await fetch(document.url)
    const blob = await response.blob()

    // Créer un lien de téléchargement
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = document.nom
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)

    return true
  },
}
