import { supabase } from "../supabase/client"

export const statisticsService = {
  async getDashboardStats(userId: string, role: string) {
    const { data, error } = await supabase.rpc("get_dashboard_stats", {
      user_id: userId,
      role,
    })

    if (error) throw new Error(error.message)

    return data
  },

  async getStagiairesByMonth() {
    const { data, error } = await supabase.from("stagiaires").select("date_debut")

    if (error) throw new Error(error.message)

    // Traiter les données pour obtenir le nombre de stagiaires par mois
    const months = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"]

    const stagiairesByMonth = Array(12).fill(0)

    data.forEach((stagiaire) => {
      if (stagiaire.date_debut) {
        const date = new Date(stagiaire.date_debut)
        const month = date.getMonth()
        stagiairesByMonth[month]++
      }
    })

    return months.map((month, index) => ({
      mois: month,
      nombre: stagiairesByMonth[index],
    }))
  },

  async getDemandesByType() {
    const { data, error } = await supabase.from("demandes").select("type, count").select("type")

    if (error) throw new Error(error.message)

    // Compter les demandes par type
    const types: Record<string, number> = {}

    data.forEach((demande) => {
      const type = demande.type
      types[type] = (types[type] || 0) + 1
    })

    // Formater les données pour le graphique
    return Object.entries(types).map(([type, nombre]) => {
      let name = type

      switch (type) {
        case "stage_academique":
          name = "Stage académique"
          break
        case "stage_professionnel":
          name = "Stage professionnel"
          break
        case "conge":
          name = "Congé"
          break
        case "prolongation":
          name = "Prolongation"
          break
        case "attestation":
          name = "Attestation"
          break
      }

      return { type: name, nombre }
    })
  },

  async getTauxAcceptation() {
    const { data, error } = await supabase.from("demandes").select("statut")

    if (error) throw new Error(error.message)

    // Compter les demandes par statut
    let acceptees = 0
    let refusees = 0
    let enAttente = 0

    data.forEach((demande) => {
      if (demande.statut === "Validé") acceptees++
      else if (demande.statut === "Refusé") refusees++
      else enAttente++
    })

    const total = data.length

    return [
      { type: "Acceptées", pourcentage: total > 0 ? acceptees / total : 0 },
      { type: "Refusées", pourcentage: total > 0 ? refusees / total : 0 },
      { type: "En attente", pourcentage: total > 0 ? enAttente / total : 0 },
    ]
  },

  async getStagiairesByDepartement() {
    const { data, error } = await supabase.from("stagiaires").select("departement")

    if (error) throw new Error(error.message)

    // Compter les stagiaires par département
    const departements: Record<string, number> = {}

    data.forEach((stagiaire) => {
      const dept = stagiaire.departement || "Non spécifié"
      departements[dept] = (departements[dept] || 0) + 1
    })

    // Formater les données pour le graphique
    return Object.entries(departements).map(([nom, nombre]) => ({
      nom,
      nombre,
    }))
  },

  async exportData(type: "stagiaires" | "demandes" | "documents", format: "csv" | "pdf") {
    let data

    switch (type) {
      case "stagiaires":
        const { data: stagiaires, error: stagiaireError } = await supabase.from("stagiaires_view").select("*")

        if (stagiaireError) throw new Error(stagiaireError.message)
        data = stagiaires
        break

      case "demandes":
        const { data: demandes, error: demandeError } = await supabase.from("demandes_view").select("*")

        if (demandeError) throw new Error(demandeError.message)
        data = demandes
        break

      case "documents":
        const { data: documents, error: documentError } = await supabase.from("documents").select("*")

        if (documentError) throw new Error(documentError.message)
        data = documents
        break
    }

    if (format === "csv") {
      return this.generateCSV(data)
    } else {
      // Générer le PDF (côté serveur)
      const response = await fetch("/api/export-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ data, type }),
      })

      if (!response.ok) {
        throw new Error("Erreur lors de la génération du PDF")
      }

      return response.blob()
    }
  },

  generateCSV(data: any[]) {
    if (!data || data.length === 0) {
      return new Blob([""], { type: "text/csv;charset=utf-8;" })
    }

    // Obtenir les en-têtes
    const headers = Object.keys(data[0])

    // Créer les lignes CSV
    const csvRows = [
      headers.join(","), // En-têtes
      ...data.map((row) =>
        headers
          .map((header) => {
            const cell = row[header]
            // Échapper les virgules et les guillemets
            if (cell === null || cell === undefined) return ""
            const cellStr = String(cell)
            if (cellStr.includes(",") || cellStr.includes('"') || cellStr.includes("\n")) {
              return `"${cellStr.replace(/"/g, '""')}"`
            }
            return cellStr
          })
          .join(","),
      ),
    ]

    // Joindre les lignes avec des sauts de ligne
    const csvContent = csvRows.join("\n")

    // Créer un Blob
    return new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  },
}
