import { supabase } from "../supabase/client"
import type { Database } from "../supabase/database.types"

export type Notification = Database["public"]["Tables"]["notifications"]["Row"]

export const notificationsService = {
  async getAll(userId: string) {
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: false })

    if (error) throw new Error(error.message)

    return data
  },

  async getUnread(userId: string) {
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .eq("lu", false)
      .order("date", { ascending: false })

    if (error) throw new Error(error.message)

    return data
  },

  async markAsRead(id: string) {
    const { error } = await supabase.from("notifications").update({ lu: true }).eq("id", id)

    if (error) throw new Error(error.message)

    return true
  },

  async markAllAsRead(userId: string) {
    const { error } = await supabase.from("notifications").update({ lu: true }).eq("user_id", userId).eq("lu", false)

    if (error) throw new Error(error.message)

    return true
  },

  async delete(id: string) {
    const { error } = await supabase.from("notifications").delete().eq("id", id)

    if (error) throw new Error(error.message)

    return true
  },

  async create(notification: Omit<Notification, "id" | "created_at">) {
    const { data, error } = await supabase
      .from("notifications")
      .insert({
        ...notification,
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw new Error(error.message)

    return data
  },
}
