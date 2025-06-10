import { supabase } from "../supabase/client"
import type { Database } from "../supabase/database.types"

export type Stagiaire = Database["public"]["Tables"]["stagiaires"]["Row"]
export type StagiaireInsert = Database["public"]["Tables"]["stagiaires"]["Insert"]
export type StagiaireUpdate = Database["public"]["Tables"]["stagiaires"]["Update"]

export const stagiairesService = {
  async getAll(filters?: { status?: string; search?: string; department?: string }) {
    let query = supabase.from("stagiaires_view").select("*")

    if (filters?.status && filters.status !== "all") {
      query = query.eq("statut", filters.status)
    }

    if (filters?.department) {
      query = query.eq("departement", filters.department)
    }

    if (filters?.search) {
      query = query.or(`nom.ilike.%${filters.search}%,prenom.ilike.%${filters.search}%,email.ilike.%${filters.search}%`)
    }

    const { data, error } = await query

    if (error) throw new Error(error.message)

    return data
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from("stagiaires")
      .select(`
        *,
        users!tuteur_id (name),
        evaluations (
          id,
          date,
          commentaire,
          note_globale,
          competences_evaluation (*)
        ),
        documents (*)
      `)
      .eq("id", id)
      .single()

    if (error) throw new Error(error.message)

    return data
  },

  async create(stagiaire: StagiaireInsert) {
    const { data, error } = await supabase
      .from("stagiaires")
      .insert({
        ...stagiaire,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw new Error(error.message)

    return data
  },

  async update(id: string, stagiaire: StagiaireUpdate) {
    const { data, error } = await supabase
      .from("stagiaires")
      .update({
        ...stagiaire,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) throw new Error(error.message)

    return data
  },

  async delete(id: string) {
    // Supprimer les documents associés
    await supabase.from("documents").delete().eq("stagiaire_id", id)

    // Supprimer les évaluations associées
    const { data: evaluations } = await supabase.from("evaluations").select("id").eq("stagiaire_id", id)

    if (evaluations) {
      for (const evaluation of evaluations) {
        await supabase.from("competences_evaluation").delete().eq("evaluation_id", evaluation.id)
      }

      await supabase.from("evaluations").delete().eq("stagiaire_id", id)
    }

    // Supprimer les demandes associées
    const { data: demandes } = await supabase.from("demandes").select("id").eq("stagiaire_id", id)

    if (demandes) {
      for (const demande of demandes) {
        await supabase.from("commentaires").delete().eq("demande_id", demande.id)
      }

      await supabase.from("demandes").delete().eq("stagiaire_id", id)
    }

    // Supprimer le stagiaire
    const { error } = await supabase.from("stagiaires").delete().eq("id", id)

    if (error) throw new Error(error.message)

    return true
  },

  async getByTuteurId(tuteurId: string) {
    const { data, error } = await supabase.from("stagiaires").select("*").eq("tuteur_id", tuteurId)

    if (error) throw new Error(error.message)

    return data
  },

  async search(term: string, status?: string) {
    const { data, error } = await supabase.rpc("search_stagiaires", {
      search_term: term,
      status_filter: status,
    })

    if (error) throw new Error(error.message)

    return data
  },
}
