import { supabase } from "../supabase/client"
import type { Database } from "../supabase/database.types"

export type Evaluation = Database["public"]["Tables"]["evaluations"]["Row"]
export type EvaluationInsert = Database["public"]["Tables"]["evaluations"]["Insert"]
export type EvaluationUpdate = Database["public"]["Tables"]["evaluations"]["Update"]
export type CompetenceEvaluation = Database["public"]["Tables"]["competences_evaluation"]["Row"]

export const evaluationsService = {
  async getAll(filters?: { stagiaireId?: string; tuteurId?: string }) {
    let query = supabase.from("evaluations").select(`
        *,
        stagiaires (
          id,
          nom,
          prenom
        ),
        users!tuteur_id (
          id,
          name
        ),
        competences_evaluation (*)
      `)

    if (filters?.stagiaireId) {
      query = query.eq("stagiaire_id", filters.stagiaireId)
    }

    if (filters?.tuteurId) {
      query = query.eq("tuteur_id", filters.tuteurId)
    }

    const { data, error } = await query

    if (error) throw new Error(error.message)

    return data
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from("evaluations")
      .select(`
        *,
        stagiaires (
          id,
          nom,
          prenom
        ),
        users!tuteur_id (
          id,
          name
        ),
        competences_evaluation (*)
      `)
      .eq("id", id)
      .single()

    if (error) throw new Error(error.message)

    return data
  },

  async create(evaluation: EvaluationInsert, competences: { nom: string; note: number }[]) {
    // Insérer l'évaluation
    const { data, error } = await supabase
      .from("evaluations")
      .insert({
        ...evaluation,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw new Error(error.message)

    // Insérer les compétences
    if (competences.length > 0) {
      const competencesData = competences.map((comp) => ({
        evaluation_id: data.id,
        nom: comp.nom,
        note: comp.note,
      }))

      const { error: compError } = await supabase.from("competences_evaluation").insert(competencesData)

      if (compError) throw new Error(compError.message)
    }

    // Créer une notification pour le stagiaire
    await supabase.from("notifications").insert({
      user_id: evaluation.stagiaire_id,
      titre: "Nouvelle évaluation",
      message: "Une nouvelle évaluation a été ajoutée à votre profil.",
      type: "info",
      lu: false,
      date: new Date().toISOString(),
      created_at: new Date().toISOString(),
    })

    return data
  },

  async update(id: string, evaluation: EvaluationUpdate, competences?: { id?: string; nom: string; note: number }[]) {
    // Mettre à jour l'évaluation
    const { data, error } = await supabase
      .from("evaluations")
      .update({
        ...evaluation,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) throw new Error(error.message)

    // Mettre à jour les compétences si fournies
    if (competences) {
      // Supprimer les anciennes compétences
      await supabase.from("competences_evaluation").delete().eq("evaluation_id", id)

      // Insérer les nouvelles compétences
      const competencesData = competences.map((comp) => ({
        evaluation_id: id,
        nom: comp.nom,
        note: comp.note,
      }))

      const { error: compError } = await supabase.from("competences_evaluation").insert(competencesData)

      if (compError) throw new Error(compError.message)
    }

    return data
  },

  async delete(id: string) {
    // Supprimer les compétences associées
    await supabase.from("competences_evaluation").delete().eq("evaluation_id", id)

    // Supprimer l'évaluation
    const { error } = await supabase.from("evaluations").delete().eq("id", id)

    if (error) throw new Error(error.message)

    return true
  },
}
