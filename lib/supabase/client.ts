import { createClient } from "@supabase/supabase-js"
import type { Database } from "./database.types"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Création du client Supabase pour le côté client
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Fonction pour obtenir un client Supabase avec le token utilisateur
export const getSupabaseClient = (accessToken?: string) => {
  if (accessToken) {
    return createClient<Database>(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    })
  }
  return supabase
}
