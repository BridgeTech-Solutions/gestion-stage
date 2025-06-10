export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          role: "stagiaire" | "tuteur" | "rh" | "admin" | "finance"
          phone?: string
          address?: string
          avatar_url?: string
          department?: string
          position?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name: string
          role: "stagiaire" | "tuteur" | "rh" | "admin" | "finance"
          phone?: string
          address?: string
          avatar_url?: string
          department?: string
          position?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          role?: "stagiaire" | "tuteur" | "rh" | "admin" | "finance"
          phone?: string
          address?: string
          avatar_url?: string
          department?: string
          position?: string
          updated_at?: string
        }
      }
      stagiaires: {
        Row: {
          id: string
          user_id: string
          nom: string
          prenom: string
          email: string
          telephone?: string
          adresse?: string
          date_naissance?: string
          formation?: string
          ecole?: string
          niveau?: string
          periode: string
          date_debut?: string
          date_fin?: string
          tuteur_id: string
          departement?: string
          statut: "actif" | "termine" | "en_attente"
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          nom: string
          prenom: string
          email: string
          telephone?: string
          adresse?: string
          date_naissance?: string
          formation?: string
          ecole?: string
          niveau?: string
          periode: string
          date_debut?: string
          date_fin?: string
          tuteur_id: string
          departement?: string
          statut: "actif" | "termine" | "en_attente"
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          nom?: string
          prenom?: string
          email?: string
          telephone?: string
          adresse?: string
          date_naissance?: string
          formation?: string
          ecole?: string
          niveau?: string
          periode?: string
          date_debut?: string
          date_fin?: string
          tuteur_id?: string
          departement?: string
          statut?: "actif" | "termine" | "en_attente"
          updated_at?: string
        }
      }
      demandes: {
        Row: {
          id: string
          date: string
          type: "stage_academique" | "stage_professionnel" | "conge" | "prolongation" | "attestation"
          statut: "En attente" | "Validé" | "Refusé"
          details: string
          stagiaire_id: string
          tuteur_id?: string
          tuteur_decision?: "En attente" | "Validé" | "Refusé"
          rh_decision?: "En attente" | "Validé" | "Refusé"
          date_debut?: string
          date_fin?: string
          duree?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          date: string
          type: "stage_academique" | "stage_professionnel" | "conge" | "prolongation" | "attestation"
          statut: "En attente" | "Validé" | "Refusé"
          details: string
          stagiaire_id: string
          tuteur_id?: string
          tuteur_decision?: "En attente" | "Validé" | "Refusé"
          rh_decision?: "En attente" | "Validé" | "Refusé"
          date_debut?: string
          date_fin?: string
          duree?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          date?: string
          type?: "stage_academique" | "stage_professionnel" | "conge" | "prolongation" | "attestation"
          statut?: "En attente" | "Validé" | "Refusé"
          details?: string
          stagiaire_id?: string
          tuteur_id?: string
          tuteur_decision?: "En attente" | "Validé" | "Refusé"
          rh_decision?: "En attente" | "Validé" | "Refusé"
          date_debut?: string
          date_fin?: string
          duree?: string
          updated_at?: string
        }
      }
      commentaires: {
        Row: {
          id: string
          demande_id: string
          user_id: string
          message: string
          date: string
          created_at: string
        }
        Insert: {
          id?: string
          demande_id: string
          user_id: string
          message: string
          date: string
          created_at?: string
        }
        Update: {
          id?: string
          demande_id?: string
          user_id?: string
          message?: string
          date?: string
        }
      }
      documents: {
        Row: {
          id: string
          date: string
          nom: string
          description: string
          format: "PDF" | "DOC" | "IMG"
          stagiaire_id: string
          type:
            | "cv"
            | "lettre_motivation"
            | "lettre_recommandation"
            | "piece_identite"
            | "certificat_scolarite"
            | "convention"
            | "attestation"
            | "autre"
          url: string
          taille?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          date: string
          nom: string
          description: string
          format: "PDF" | "DOC" | "IMG"
          stagiaire_id: string
          type:
            | "cv"
            | "lettre_motivation"
            | "lettre_recommandation"
            | "piece_identite"
            | "certificat_scolarite"
            | "convention"
            | "attestation"
            | "autre"
          url: string
          taille?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          date?: string
          nom?: string
          description?: string
          format?: "PDF" | "DOC" | "IMG"
          stagiaire_id?: string
          type?:
            | "cv"
            | "lettre_motivation"
            | "lettre_recommandation"
            | "piece_identite"
            | "certificat_scolarite"
            | "convention"
            | "attestation"
            | "autre"
          url?: string
          taille?: string
          updated_at?: string
        }
      }
      evaluations: {
        Row: {
          id: string
          stagiaire_id: string
          tuteur_id: string
          date: string
          commentaire: string
          note_globale: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          stagiaire_id: string
          tuteur_id: string
          date: string
          commentaire: string
          note_globale: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          stagiaire_id?: string
          tuteur_id?: string
          date?: string
          commentaire?: string
          note_globale?: number
          updated_at?: string
        }
      }
      competences_evaluation: {
        Row: {
          id: string
          evaluation_id: string
          nom: string
          note: number
        }
        Insert: {
          id?: string
          evaluation_id: string
          nom: string
          note: number
        }
        Update: {
          id?: string
          evaluation_id?: string
          nom?: string
          note?: number
        }
      }
      templates: {
        Row: {
          id: string
          nom: string
          description: string
          type: "convention" | "attestation" | "evaluation" | "autre"
          contenu: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nom: string
          description: string
          type: "convention" | "attestation" | "evaluation" | "autre"
          contenu: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nom?: string
          description?: string
          type?: "convention" | "attestation" | "evaluation" | "autre"
          contenu?: string
          updated_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          titre: string
          message: string
          type: "info" | "success" | "warning" | "error"
          lu: boolean
          date: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          titre: string
          message: string
          type: "info" | "success" | "warning" | "error"
          lu: boolean
          date: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          titre?: string
          message?: string
          type?: "info" | "success" | "warning" | "error"
          lu?: boolean
          date?: string
        }
      }
    }
    Views: {
      stagiaires_view: {
        Row: {
          id: string
          nom: string
          prenom: string
          email: string
          telephone?: string
          formation?: string
          ecole?: string
          periode: string
          tuteur_nom: string
          departement?: string
          statut: "actif" | "termine" | "en_attente"
          nb_demandes: number
          nb_documents: number
        }
      }
      demandes_view: {
        Row: {
          id: string
          date: string
          type: "stage_academique" | "stage_professionnel" | "conge" | "prolongation" | "attestation"
          statut: "En attente" | "Validé" | "Refusé"
          details: string
          stagiaire_nom: string
          stagiaire_prenom: string
          tuteur_nom?: string
          tuteur_decision?: "En attente" | "Validé" | "Refusé"
          rh_decision?: "En attente" | "Validé" | "Refusé"
          nb_commentaires: number
        }
      }
    }
    Functions: {
      get_dashboard_stats: {
        Args: {
          user_id: string
          role: "stagiaire" | "tuteur" | "rh" | "admin" | "finance"
        }
        Returns: {
          stagiaires_actifs: number
          stagiaires_total: number
          demandes_en_cours: number
          demandes_total: number
          documents_total: number
          evaluations_total: number
        }
      }
      search_stagiaires: {
        Args: {
          search_term: string
          status_filter?: "actif" | "termine" | "en_attente"
          department_filter?: string
        }
        Returns: {
          id: string
          nom: string
          prenom: string
          email: string
          formation?: string
          ecole?: string
          tuteur_nom: string
          departement?: string
          statut: "actif" | "termine" | "en_attente"
        }[]
      }
    }
  }
}
