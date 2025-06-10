import { supabase } from "../supabase/client"
import type { Database } from "../supabase/database.types"

export type Demande = Database["public"]["Tables"]["demandes"]["Row"]
export type DemandeInsert = Database["public"]["Tables"]["demandes"]["Insert"]
export type DemandeUpdate = Database["public"]["Tables"]["demandes"]["Update"]
export type Commentaire = Database["public"]["Tables"]["commentaires"]["Row"]

export const demandesService = {
  async getAll(filters?: { status?: string; type?: string; stagiaireId?: string; tuteurId?: string }) {
    let query = supabase.from("demandes_view").select("*")

    if (filters?.status && filters.status !== "all") {
      query = query.eq("statut", filters.status)
    }

    if (filters?.type && filters.type !== "all") {
      query = query.eq("type", filters.type)
    }

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
      .from("demandes")
      .select(`
        *,
        stagiaires (
          id,
          nom,
          prenom,
          email
        ),
        users!tuteur_id (
          id,
          name
        ),
        commentaires (
          id,
          message,
          date,
          users (
            id,
            name,
            role
          )
        )
      `)
      .eq("id", id)
      .single()

    if (error) throw new Error(error.message)

    return data
  },

  async create(demande: DemandeInsert) {
    const { data, error } = await supabase
      .from("demandes")
      .insert({
        ...demande,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw new Error(error.message)

    // Créer une notification pour le tuteur
    if (demande.tuteur_id) {
      await supabase.from("notifications").insert({
        user_id: demande.tuteur_id,
        titre: "Nouvelle demande",
        message: `Une nouvelle demande de type ${demande.type} a été soumise et requiert votre attention.`,
        type: "info",
        lu: false,
        date: new Date().toISOString(),
        created_at: new Date().toISOString(),
      })
    }

    return data
  },

  async update(id: string, demande: DemandeUpdate) {
    const { data, error } = await supabase
      .from("demandes")
      .update({
        ...demande,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) throw new Error(error.message)

    return data
  },

  async delete(id: string) {
    // Supprimer les commentaires associés
    await supabase.from("commentaires").delete().eq("demande_id", id)

    // Supprimer la demande
    const { error } = await supabase.from("demandes").delete().eq("id", id)

    if (error) throw new Error(error.message)

    return true
  },

  async addComment(demandeId: string, userId: string, message: string) {
    const { data, error } = await supabase
      .from("commentaires")
      .insert({
        demande_id: demandeId,
        user_id: userId,
        message,
        date: new Date().toISOString(),
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw new Error(error.message)

    // Récupérer la demande pour les notifications
    const { data: demande } = await supabase
      .from("demandes")
      .select("stagiaire_id, tuteur_id")
      .eq("id", demandeId)
      .single()

    if (demande) {
      // Notifier l'autre partie (stagiaire ou tuteur)
      const notifyUserId = userId === demande.stagiaire_id ? demande.tuteur_id : demande.stagiaire_id

      if (notifyUserId) {
        await supabase.from("notifications").insert({
          user_id: notifyUserId,
          titre: "Nouveau commentaire",
          message: "Un nouveau commentaire a été ajouté à une demande.",
          type: "info",
          lu: false,
          date: new Date().toISOString(),
          created_at: new Date().toISOString(),
        })
      }
    }

    return data
  },

  async approve(id: string, userId: string, role: string, comment?: string) {
    // Déterminer quel champ mettre à jour en fonction du rôle
    const updateField = role === "tuteur" ? "tuteur_decision" : "rh_decision"

    const { data, error } = await supabase
      .from("demandes")
      .update({
        [updateField]: "Validé",
        // Si c'est la RH qui approuve, mettre à jour le statut global
        ...(role === "rh" || role === "admin" ? { statut: "Validé" } : {}),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) throw new Error(error.message)

    // Ajouter un commentaire si fourni
    if (comment) {
      await this.addComment(id, userId, comment)
    }

    // Créer une notification pour le stagiaire
    if (data.stagiaire_id) {
      await supabase.from("notifications").insert({
        user_id: data.stagiaire_id,
        titre: "Demande approuvée",
        message: `Votre demande a été approuvée par ${role === "tuteur" ? "votre tuteur" : "les RH"}.`,
        type: "success",
        lu: false,
        date: new Date().toISOString(),
        created_at: new Date().toISOString(),
      })
    }

    // Si c'est le tuteur qui approuve, notifier les RH
    if (role === "tuteur") {
      const { data: rhUsers } = await supabase.from("users").select("id").eq("role", "rh")

      if (rhUsers) {
        for (const rhUser of rhUsers) {
          await supabase.from("notifications").insert({
            user_id: rhUser.id,
            titre: "Demande à valider",
            message: "Une demande approuvée par un tuteur requiert votre validation.",
            type: "info",
            lu: false,
            date: new Date().toISOString(),
            created_at: new Date().toISOString(),
          })
        }
      }
    }

    return data
  },

  async reject(id: string, userId: string, role: string, comment?: string) {
    // Déterminer quel champ mettre à jour en fonction du rôle
    const updateField = role === "tuteur" ? "tuteur_decision" : "rh_decision"

    const { data, error } = await supabase
      .from("demandes")
      .update({
        [updateField]: "Refusé",
        // Si c'est le tuteur ou la RH qui refuse, mettre à jour le statut global
        statut: "Refusé",
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) throw new Error(error.message)

    // Ajouter un commentaire si fourni
    if (comment) {
      await this.addComment(id, userId, comment)
    }

    // Créer une notification pour le stagiaire
    if (data.stagiaire_id) {
      await supabase.from("notifications").insert({
        user_id: data.stagiaire_id,
        titre: "Demande refusée",
        message: `Votre demande a été refusée par ${role === "tuteur" ? "votre tuteur" : "les RH"}.`,
        type: "error",
        lu: false,
        date: new Date().toISOString(),
        created_at: new Date().toISOString(),
      })
    }

    return data
  },
}
