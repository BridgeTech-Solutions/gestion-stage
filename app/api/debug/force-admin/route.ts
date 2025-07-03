
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST() {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ 
        error: "Non authentifié", 
        debug: { authError: authError?.message }
      }, { status: 401 })
    }

    console.log("🔧 Forcing admin for user:", user.email)

    // Forcer la création/mise à jour du profil admin
    const { data: updatedProfile, error: upsertError } = await supabase
      .from("users")
      .upsert({ 
        id: user.id,
        email: user.email,
        name: user.user_metadata?.name || user.email.split('@')[0],
        role: "admin",
        is_active: true,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'id'
      })
      .select()
      .single()

    if (upsertError) {
      console.error("❌ Erreur upsert admin:", upsertError)
      return NextResponse.json({ 
        error: "Erreur mise à jour profil",
        debug: { 
          upsertError: upsertError.message,
          user_id: user.id,
          user_email: user.email
        }
      }, { status: 500 })
    }

    // Confirmer l'email si pas déjà fait
    const { error: confirmError } = await supabase.auth.admin.updateUserById(
      user.id,
      { email_confirm: true }
    )

    if (confirmError) {
      console.warn("⚠️ Erreur confirmation email:", confirmError.message)
    }

    return NextResponse.json({
      success: true,
      message: "Compte admin forcé avec succès",
      user: updatedProfile,
      debug: {
        original_user_id: user.id,
        original_email: user.email,
        profile_created: !!updatedProfile
      }
    })
  } catch (error) {
    console.error("💥 Erreur force admin:", error)
    return NextResponse.json({ 
      error: "Erreur serveur",
      debug: {
        details: error instanceof Error ? error.message : "Erreur inconnue",
        stack: error instanceof Error ? error.stack : undefined
      }
    }, { status: 500 })
  }
}

export async function GET() {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ 
        error: "Non authentifié",
        debug: { authError: authError?.message }
      }, { status: 401 })
    }

    // Vérifier le profil actuel
    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single()

    return NextResponse.json({
      success: true,
      auth_user: {
        id: user.id,
        email: user.email,
        metadata: user.user_metadata
      },
      profile: profile || null,
      profile_error: profileError?.message || null,
      needs_admin_setup: !profile || profile.role !== 'admin' || !profile.is_active
    })
  } catch (error) {
    console.error("💥 Erreur debug force admin:", error)
    return NextResponse.json({ 
      error: "Erreur serveur",
      details: error instanceof Error ? error.message : "Erreur inconnue"
    }, { status: 500 })
  }
}
