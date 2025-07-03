
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createClient()

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    // Récupérer le profil utilisateur
    const { data: profile, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", session.user.id)
      .single()

    if (error || !profile) {
      return NextResponse.json({ 
        error: "Profil non trouvé",
        session_user: session.user.email,
        supabase_error: error?.message
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      user: {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        role: profile.role,
        is_active: profile.is_active,
        created_at: profile.created_at
      },
      session_email: session.user.email,
      is_admin: profile.role === "admin",
      is_active: profile.is_active,
      can_access_admin: profile.role === "admin" && profile.is_active
    })
  } catch (error) {
    console.error("Erreur debug admin:", error)
    return NextResponse.json({ 
      error: "Erreur serveur",
      details: error instanceof Error ? error.message : "Erreur inconnue"
    }, { status: 500 })
  }
}

export async function POST() {
  try {
    const supabase = await createClient()

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    // Activer le compte admin
    const { data: updatedProfile, error } = await supabase
      .from("users")
      .update({ 
        is_active: true,
        role: "admin",
        updated_at: new Date().toISOString()
      })
      .eq("id", session.user.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ 
        error: "Erreur mise à jour",
        details: error.message
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Compte admin activé",
      user: updatedProfile
    })
  } catch (error) {
    console.error("Erreur activation admin:", error)
    return NextResponse.json({ 
      error: "Erreur serveur",
      details: error instanceof Error ? error.message : "Erreur inconnue"
    }, { status: 500 })
  }
}
