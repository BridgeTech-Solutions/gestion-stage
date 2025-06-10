import { supabase } from "../supabase/client"
import type { Database } from "../supabase/database.types"

export type User = Database["public"]["Tables"]["users"]["Row"]

export const authService = {
  async login(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw new Error(error.message)

    // Récupérer les informations utilisateur complètes
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", data.user.id)
      .single()

    if (userError) throw new Error(userError.message)

    return {
      user: userData,
      session: data.session,
    }
  },

  async register(email: string, password: string, userData: Partial<User>) {
    // Créer l'utilisateur dans Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: userData.name,
          role: userData.role || "stagiaire",
        },
      },
    })

    if (error) throw new Error(error.message)

    // Créer l'entrée dans la table users
    const { error: insertError } = await supabase.from("users").insert({
      id: data.user!.id,
      email: email,
      name: userData.name || "",
      role: userData.role || "stagiaire",
      phone: userData.phone,
      address: userData.address,
      department: userData.department,
      position: userData.position,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    if (insertError) throw new Error(insertError.message)

    return {
      user: data.user,
      session: data.session,
    }
  },

  async logout() {
    const { error } = await supabase.auth.signOut()
    if (error) throw new Error(error.message)
    return true
  },

  async getCurrentUser() {
    const { data, error } = await supabase.auth.getUser()

    if (error || !data.user) return null

    // Récupérer les informations utilisateur complètes
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", data.user.id)
      .single()

    if (userError) return null

    return userData
  },

  async updateProfile(userId: string, userData: Partial<User>) {
    const { error } = await supabase
      .from("users")
      .update({
        ...userData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)

    if (error) throw new Error(error.message)

    return true
  },

  async updatePassword(password: string) {
    const { error } = await supabase.auth.updateUser({
      password,
    })

    if (error) throw new Error(error.message)

    return true
  },

  async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (error) throw new Error(error.message)

    return true
  },
}
