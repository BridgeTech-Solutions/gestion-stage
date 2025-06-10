import { supabase } from "../supabase/client"
import type { Database } from "../supabase/database.types"

export type Template = Database["public"]["Tables"]["templates"]["Row"]
export type TemplateInsert = Database["public"]["Tables"]["templates"]["Insert"]
export type TemplateUpdate = Database["public"]["Tables"]["templates"]["Update"]

export const templatesService = {
  async getAll(filters?: { type?: string }) {
    let query = supabase.from("templates").select("*")

    if (filters?.type && filters.type !== "all") {
      query = query.eq("type", filters.type)
    }

    const { data, error } = await query

    if (error) throw new Error(error.message)

    return data
  },

  async getById(id: string) {
    const { data, error } = await supabase.from("templates").select("*").eq("id", id).single()

    if (error) throw new Error(error.message)

    return data
  },

  async create(template: TemplateInsert) {
    const { data, error } = await supabase
      .from("templates")
      .insert({
        ...template,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw new Error(error.message)

    return data
  },

  async update(id: string, template: TemplateUpdate) {
    const { data, error } = await supabase
      .from("templates")
      .update({
        ...template,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) throw new Error(error.message)

    return data
  },

  async delete(id: string) {
    const { error } = await supabase.from("templates").delete().eq("id", id)

    if (error) throw new Error(error.message)

    return true
  },

  async generateDocument(templateId: string, data: any) {
    // Récupérer le template
    const { data: template, error } = await supabase.from("templates").select("contenu").eq("id", templateId).single()

    if (error) throw new Error(error.message)

    // Remplacer les variables dans le template
    let content = template.contenu

    Object.keys(data).forEach((key) => {
      const regex = new RegExp(`{{${key}}}`, "g")
      content = content.replace(regex, data[key])
    })

    // Générer le PDF (côté serveur)
    const response = await fetch("/api/generate-pdf", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content }),
    })

    if (!response.ok) {
      throw new Error("Erreur lors de la génération du PDF")
    }

    return response.blob()
  },
}
