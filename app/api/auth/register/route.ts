import { createServerSupabaseClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { email, password, userData } = await request.json()
    const supabase = createServerSupabaseClient()

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

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    if (!data.user) {
      return NextResponse.json({ error: "Erreur lors de la création de l'utilisateur" }, { status: 400 })
    }

    // Créer l'entrée dans la table users
    const { error: insertError } = await supabase.from("users").insert({
      id: data.user.id,
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

    if (insertError) {
      // Supprimer l'utilisateur Auth en cas d'erreur
      await supabase.auth.admin.deleteUser(data.user.id)
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    return NextResponse.json({
      user: data.user,
      session: data.session,
    })
  } catch (error) {
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 })
  }
}
