
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "../../../../lib/supabase/server"
import { createAdminClient } from "../../../../lib/supabase/admin"
import { z } from "zod"

const createUserSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  role: z.enum(["admin", "rh", "tuteur", "stagiaire"]),
  phone: z.string().optional(),
  department: z.string().optional(),
  position: z.string().optional(),
  address: z.string().optional(),
  is_active: z.boolean().default(true)
})

export async function POST(request: NextRequest) {
  try {
    // 1. Lire les headers et le token JWT
    const headers = Object.fromEntries(request.headers.entries());
    console.log("🔎 Headers complets:", headers);
    const authHeader = request.headers.get("authorization") || request.headers.get("Authorization");
    let token = null;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
      console.log("🔑 Token JWT:", token);
    } else {
      console.warn("Aucun header Authorization trouvé ou format invalide");
    }

    // 2. Créer le client supabase avec le token si présent
    let supabase;
    if (token) {
      // @ts-ignore
      const { createClient: createSupabaseClient } = await import("@/lib/supabase/server");
      supabase = createSupabaseClient({ global: { headers: { Authorization: `Bearer ${token}` } } });
    } else {
      supabase = await createClient();
    }

    // 3. Vérifier l'utilisateur courant (session ou JWT)
    let userId = null;
    let userEmail = null;
    let appMetadata = null;
    if (token) {
      // Décoder le JWT pour debug
      try {
        const [header, payload, signature] = token.split(".");
        const decodedPayload = JSON.parse(Buffer.from(payload, "base64").toString("utf8"));
        console.log("📦 Contenu décodé du JWT:", decodedPayload);
        userId = decodedPayload.sub;
        userEmail = decodedPayload.email;
        appMetadata = decodedPayload.app_metadata;
      } catch (error) {
        console.error("Erreur lors du décodage du JWT:", error);
      }
    }
    // Fallback session
    if (!userId) {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session?.user) {
        return NextResponse.json(
          { success: false, error: "Non authentifié" },
          { status: 401 }
        );
      }
      userId = session.user.id;
      userEmail = session.user.email;
      appMetadata = session.user.app_metadata;
    }

    // 4. Vérifier le rôle admin dans le JWT
    let isAdminJWT = appMetadata && appMetadata.role === "admin";
    if (isAdminJWT) {
      console.log("✅ Rôle admin trouvé dans le JWT");
    } else {
      console.warn("❌ Le rôle admin n'est PAS dans le JWT");
    }

    // 5. Vérifier le rôle admin dans la table users
    let isAdminDB = false;
    let isActive = false;
    let userError = null;
    let currentUser = null;
    if (userId) {
      const { data, error } = await supabase
        .from("users")
        .select("role, is_active")
        .eq("id", userId)
        .single();
      currentUser = data;
      userError = error;
      if (data) {
        isAdminDB = data.role === "admin";
        isActive = !!data.is_active;
      }
    }
    if (!isAdminJWT && (!isAdminDB || !isActive)) {
      console.warn("❌ Accès non autorisé: ni JWT ni DB n'indiquent admin");
      return NextResponse.json(
        { success: false, error: "User not allowed" },
        { status: 403 }
      );
    }

    // 6. Suite logique existante
    const body = await request.json();
    console.log("📝 Données reçues:", { ...body, password: "[HIDDEN]" });
    const validatedData = createUserSchema.parse(body);
    // Vérifier si l'utilisateur existe déjà
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("email", validatedData.email)
      .single()

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "Un utilisateur avec cet email existe déjà" },
        { status: 400 }
      )
    }

    // Utiliser un client admin avec service key pour créer l'utilisateur
    const adminClient = createAdminClient()
    
    // Créer l'utilisateur avec le client admin
    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email: validatedData.email,
      password: validatedData.password,
      email_confirm: true,
      user_metadata: {
        name: validatedData.name,
        role: validatedData.role
      }
    })

    if (authError) {
      console.error("❌ Erreur création auth:", authError)
      return NextResponse.json(
        { success: false, error: "Erreur lors de la création du compte: " + authError.message },
        { status: 500 }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        { success: false, error: "Erreur lors de la création du compte" },
        { status: 500 }
      )
    }

    console.log("✅ Utilisateur auth créé:", authData.user.id)

    // Créer le profil utilisateur avec le client admin
    const { data: newUser, error: profileError } = await adminClient
      .from("users")
      .insert({
        id: authData.user.id,
        email: validatedData.email,
        name: validatedData.name,
        role: validatedData.role,
        phone: validatedData.phone || null,
        department: validatedData.department || null,
        position: validatedData.position || null,
        address: validatedData.address || null,
        is_active: validatedData.is_active,
        email_confirmed: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (profileError) {
      console.error("❌ Erreur création profil:", profileError)
      
      // Essayer de supprimer l'utilisateur auth créé
      try {
        await adminClient.auth.admin.deleteUser(authData.user.id)
      } catch (deleteError) {
        console.error("❌ Erreur suppression utilisateur auth:", deleteError)
      }
      
      return NextResponse.json(
        { success: false, error: "Erreur lors de la création du profil: " + profileError.message },
        { status: 500 }
      )
    }

    console.log("✅ Profil utilisateur créé:", newUser.id)

    // Si c'est un stagiaire, créer l'entrée dans la table stagiaires
    if (validatedData.role === "stagiaire") {
      try {
        // Assigner automatiquement un tuteur
        const { data: tuteurs } = await supabase
          .from("users")
          .select(`
            id, name,
            stagiaires_count:stagiaires(count)
          `)
          .eq("role", "tuteur")
          .eq("is_active", true)

        let tuteurId = null
        if (tuteurs && tuteurs.length > 0) {
          const tuteurAvecMoinsDeStages = tuteurs.reduce((prev, current) => {
            const prevCount = prev.stagiaires_count?.[0]?.count || 0
            const currentCount = current.stagiaires_count?.[0]?.count || 0
            return currentCount < prevCount ? current : prev
          })
          tuteurId = tuteurAvecMoinsDeStages.id
        }

        await adminClient.from("stagiaires").insert({
          user_id: authData.user.id,
          entreprise: "Bridge Technologies Solutions",
          poste: "Stagiaire",
          tuteur_id: tuteurId,
          statut: "actif",
          date_debut: new Date().toISOString().split('T')[0],
          date_fin: new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

        console.log("✅ Entrée stagiaire créée")
      } catch (stagiaireError) {
        console.warn("⚠️ Erreur création stagiaire:", stagiaireError)
      }
    }

    return NextResponse.json({
      success: true,
      message: "Utilisateur créé avec succès",
      data: newUser
    })

  } catch (error) {
    console.error("💥 Erreur création utilisateur admin:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Données invalides", details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: "Erreur interne du serveur" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Vérifier que l'utilisateur actuel est admin
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      console.error("❌ GET: Pas de session")
      return NextResponse.json(
        { success: false, error: "Non authentifié" },
        { status: 401 }
      )
    }

    console.log("✅ GET: Session trouvée pour:", session.user.email)

    const { data: currentUser } = await supabase
      .from("users")
      .select("role")
      .eq("id", session.user.id)
      .single()

    if (!currentUser || currentUser.role !== "admin") {
      console.error("❌ GET: Utilisateur non admin:", currentUser?.role)
      return NextResponse.json(
        { success: false, error: "Accès non autorisé" },
        { status: 403 }
      )
    }

    console.log("✅ GET: Utilisateur admin confirmé")

    // Récupérer tous les utilisateurs
    const { data: users, error } = await supabase
      .from("users")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("❌ Erreur récupération utilisateurs:", error)
      throw error
    }

    console.log("✅ Utilisateurs récupérés:", users.length)

    return NextResponse.json({
      success: true,
      data: users
    })

  } catch (error) {
    console.error("💥 Erreur récupération utilisateurs:", error)
    return NextResponse.json(
      { success: false, error: "Erreur interne du serveur" },
      { status: 500 }
    )
  }
}
