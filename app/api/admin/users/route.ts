import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createClient as createServiceClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    console.log("🚀 POST /api/admin/users - Début de la requête")
    
    const supabase = await createClient()
    
    // Créer un client admin avec la clé de service
    const supabaseAdmin = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Vérifier la session d'abord
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    console.log("📊 Session check:")
    console.log("- Session error:", sessionError?.message || "none")
    console.log("- Session exists:", !!session)
    console.log("- User exists:", !!session?.user)
    console.log("- User ID:", session?.user?.id)
    console.log("- User email:", session?.user?.email)

    if (sessionError || !session?.user) {
      console.log("❌ ÉCHEC: Pas de session utilisateur")
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    console.log("✅ Session trouvée pour:", session.user.email)

    // Vérifier les permissions admin
    console.log("🔍 Vérification du profil pour user ID:", session.user.id)
    
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('role, is_active, email, name')
      .eq('id', session.user.id)
      .single()

    console.log("📊 Profile check:")
    console.log("- Profile error:", profileError?.message || "none") 
    console.log("- Profile found:", !!userProfile)
    console.log("- User role:", userProfile?.role)
    console.log("- User active:", userProfile?.is_active)
    console.log("- Profile email:", userProfile?.email)

    if (profileError) {
      console.error("❌ ÉCHEC: Erreur récupération profil:", profileError.message)
      return NextResponse.json(
        { error: 'Erreur de vérification des permissions' },
        { status: 500 }
      )
    }

    if (!userProfile) {
      console.log("❌ ÉCHEC: Aucun profil trouvé")
      return NextResponse.json(
        { error: 'Profil utilisateur non trouvé' },
        { status: 404 }
      )
    }

    if (userProfile.role !== 'admin') {
      console.log("❌ ÉCHEC: Utilisateur non admin, rôle actuel:", userProfile.role)
      return NextResponse.json(
        { error: 'Permissions insuffisantes' },
        { status: 403 }
      )
    }

    console.log("✅ Utilisateur admin confirmé")

    const userData = await request.json()
    console.log("📤 Création d'utilisateur:", userData)

    // Validation des données requises
    if (!userData.email || !userData.password || !userData.name || !userData.role) {
      return NextResponse.json({ 
        success: false,
        error: "Données manquantes (email, password, name, role requis)" 
      }, { status: 400 })
    }

    // Validation du format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(userData.email)) {
      return NextResponse.json({ 
        success: false,
        error: "Format d'email invalide" 
      }, { status: 400 })
    }

    // Validation du mot de passe
    if (userData.password.length < 6) {
      return NextResponse.json({ 
        success: false,
        error: "Le mot de passe doit contenir au moins 6 caractères" 
      }, { status: 400 })
    }

    // Validation du rôle
    const validRoles = ['admin', 'rh', 'tuteur', 'stagiaire']
    if (!validRoles.includes(userData.role)) {
      return NextResponse.json({ 
        success: false,
        error: "Rôle invalide" 
      }, { status: 400 })
    }

    // Créer l'utilisateur dans Supabase Auth avec le client admin
    const { data: authUser, error: authUserError } = await supabaseAdmin.auth.admin.createUser({
      email: userData.email,
      password: userData.password,
      email_confirm: true,
      user_metadata: {
        name: userData.name,
        role: userData.role
      }
    })

    if (authUserError) {
      console.error("❌ Erreur création auth:", authUserError)
      return NextResponse.json({ 
        success: false,
        error: authUserError.message || "Erreur lors de la création du compte" 
      }, { status: 400 })
    }

    if (!authUser.user) {
      console.error("❌ Aucun utilisateur créé")
      return NextResponse.json({ 
        success: false,
        error: "Erreur lors de la création du compte" 
      }, { status: 500 })
    }

    console.log("✅ Utilisateur auth créé:", authUser.user?.id)

    // Créer le profil utilisateur avec le client admin
    const { data: newUser, error: userError } = await supabaseAdmin
      .from("users")
      .insert({
        id: authUser.user!.id,
        email: userData.email,
        name: userData.name,
        role: userData.role,
        phone: userData.phone || null,
        department: userData.department || null,
        position: userData.position || null,
        address: userData.address || null,
        is_active: userData.is_active !== false, // Par défaut true
      })
      .select()
      .single()

    if (userError) {
      console.error("❌ Erreur création profil:", userError)
      // Supprimer l'utilisateur auth si erreur profil
      try {
        await supabaseAdmin.auth.admin.deleteUser(authUser.user!.id)
        console.log("✅ Utilisateur auth supprimé après erreur profil")
      } catch (deleteError) {
        console.error("❌ Erreur suppression utilisateur auth:", deleteError)
      }
      return NextResponse.json({ 
        success: false,
        error: userError.message || "Erreur lors de la création du profil" 
      }, { status: 400 })
    }

    // Si l'utilisateur est un stagiaire, créer également l'entrée dans la table stagiaires
    if (userData.role === "stagiaire") {
      // Trouver un tuteur disponible
      const { data: tuteurs, error: tuteursError } = await supabaseAdmin
        .from("users")
        .select(`
          id, 
          name,
          stagiaires!tuteur_id(count)
        `)
        .eq("role", "tuteur")
        .eq("is_active", true)

      if (tuteursError) {
        console.error("❌ Erreur récupération tuteurs:", tuteursError)
      }

      let tuteurId = null
      if (tuteurs && tuteurs.length > 0) {
        // Trouver le tuteur avec le moins de stagiaires
        const tuteurAvecMoinsDeStages = tuteurs.reduce((prev, current) => {
          const prevCount = Array.isArray(prev.stagiaires) ? prev.stagiaires.length : 0
          const currentCount = Array.isArray(current.stagiaires) ? current.stagiaires.length : 0
          return currentCount < prevCount ? current : prev
        })
        tuteurId = tuteurAvecMoinsDeStages.id
        console.log("✅ Tuteur assigné:", tuteurAvecMoinsDeStages.name)
      }

      const { error: stagiaireError } = await supabaseAdmin
        .from("stagiaires")
        .insert({
          user_id: authUser.user!.id,
          entreprise: userData.entreprise || "Bridge Technologies Solutions",
          poste: userData.poste || "Stagiaire",
          tuteur_id: tuteurId,
          statut: "actif",
          specialite: userData.specialite || null,
          niveau: userData.niveau || null,
          date_debut: userData.date_debut || new Date().toISOString().split('T')[0],
          date_fin: userData.date_fin || new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 6 mois
          notes: userData.notes || null
        })

      if (stagiaireError) {
        console.warn("⚠️ Erreur création profil stagiaire:", stagiaireError)
        // Ne pas faire échouer la création pour cette erreur
      } else {
        console.log("✅ Profil stagiaire créé avec succès")
      }
    }

    console.log("✅ Utilisateur créé avec succès")

    return NextResponse.json({
      success: true,
      message: "Utilisateur créé avec succès",
      data: {
        ...newUser,
        auth_id: authUser.user!.id
      }
    })
  } catch (error) {
    console.error("💥 Erreur création utilisateur:", error)
    return NextResponse.json({ 
      success: false,
      error: "Erreur serveur interne",
      details: error instanceof Error ? error.message : "Erreur inconnue"
    }, { status: 500 })
  }
}

export async function GET() {
  try {
    console.log("🔍 API Admin Users - Début de la requête")

    const supabase = await createClient()

    // Vérifier l'authentification
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError || !session?.user) {
      console.log("❌ Pas de session utilisateur:", sessionError?.message)
      return NextResponse.json({ success: false, error: "Non authentifié" }, { status: 401 })
    }

    console.log("✅ Session trouvée pour:", session.user.email)

    // Vérifier que l'utilisateur est admin
    const { data: adminProfile, error: adminError } = await supabase
      .from("users")
      .select("role")
      .eq("id", session.user.id)
      .single()

    if (adminError) {
      console.error("❌ Erreur récupération profil admin:", adminError)
      return NextResponse.json({ success: false, error: "Erreur de vérification des permissions" }, { status: 500 })
    }

    if (!adminProfile || adminProfile.role !== "admin") {
      console.log("❌ Utilisateur non autorisé:", adminProfile?.role)
      return NextResponse.json({ success: false, error: "Accès non autorisé" }, { status: 403 })
    }

    console.log("✅ Utilisateur admin confirmé")

    // Récupérer tous les utilisateurs
    const { data: users, error: usersError } = await supabase
      .from("users")
      .select(`
        id,
        email,
        name,
        role,
        phone,
        department,
        position,
        is_active,
        created_at,
        last_login
      `)
      .order("created_at", { ascending: false })

    if (usersError) {
      console.error("❌ Erreur lors de la récupération des utilisateurs:", usersError)
      return NextResponse.json(
        { success: false, error: `Erreur lors de la récupération des utilisateurs: ${usersError.message}` },
        { status: 500 },
      )
    }

    console.log("✅ Utilisateurs récupérés:", users?.length || 0)

    return NextResponse.json({
      success: true,
      data: users || [],
    })
  } catch (error: any) {
    console.error("💥 Erreur API Admin Users:", error)
    return NextResponse.json({ success: false, error: `Erreur interne du serveur: ${error.message}` }, { status: 500 })
  }
}
