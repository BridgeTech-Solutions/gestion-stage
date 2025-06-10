export interface User {
  id: string
  email: string
  password: string
  name: string
  role: "stagiaire" | "tuteur" | "rh" | "admin" | "finance"
  phone?: string
  address?: string
  avatar?: string
  department?: string
  position?: string
  dateCreated?: string
}

export interface Demande {
  id: string
  date: string
  type: "stage_academique" | "stage_professionnel" | "conge" | "prolongation" | "attestation"
  statut: "En attente" | "Validé" | "Refusé"
  details: string
  stagiaire: string
  stagiaireId: string
  tuteurId?: string
  tuteurDecision?: "En attente" | "Validé" | "Refusé"
  rhDecision?: "En attente" | "Validé" | "Refusé"
  documents?: string[]
  commentaires?: DemandeCommentaire[]
  dateDebut?: string
  dateFin?: string
  duree?: string
}

export interface DemandeCommentaire {
  id: string
  userId: string
  userName: string
  userRole: string
  date: string
  message: string
}

export interface Document {
  id: string
  date: string
  nom: string
  description: string
  format: "PDF" | "DOC" | "IMG"
  stagiaire: string
  stagiaireId: string
  type:
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
}

export interface Stagiaire {
  id: string
  nom: string
  prenom: string
  email: string
  telephone?: string
  adresse?: string
  dateNaissance?: string
  formation?: string
  ecole?: string
  niveau?: string
  periode: string
  dateDebut?: string
  dateFin?: string
  tuteur: string
  tuteurId: string
  departement?: string
  statut: "actif" | "termine" | "en_attente"
  documents?: string[]
  evaluations?: Evaluation[]
}

export interface Evaluation {
  id: string
  stagiaireId: string
  tuteurId: string
  date: string
  competences: { nom: string; note: number }[]
  commentaire: string
  noteGlobale: number
}

export interface Statistique {
  id: string
  periode: string
  nombreStagiaires: number
  nombreDemandesTotal: number
  nombreDemandesValidees: number
  nombreDemandesRefusees: number
  nombreDemandesEnAttente: number
  departements: { nom: string; nombre: number }[]
}

// Données simulées
export const mockUsers: User[] = [
  {
    id: "1",
    email: "admin@bridge-tech.com",
    password: "admin123",
    name: "ADMINISTRATEUR",
    role: "admin",
    dateCreated: "01/01/2025",
  },
  {
    id: "2",
    email: "rh@bridge-tech.com",
    password: "rh123",
    name: "Marie Dupont",
    role: "rh",
    department: "Ressources Humaines",
    position: "Responsable RH",
    phone: "0123456789",
    dateCreated: "01/01/2025",
  },
  {
    id: "3",
    email: "tuteur@bridge-tech.com",
    password: "tuteur123",
    name: "Thomas Martin",
    role: "tuteur",
    department: "Développement",
    position: "Lead Developer",
    phone: "0123456788",
    dateCreated: "01/01/2025",
  },
  {
    id: "4",
    email: "stagiaire@bridge-tech.com",
    password: "stagiaire123",
    name: "Lucas Bernard",
    role: "stagiaire",
    phone: "0123456787",
    dateCreated: "01/02/2025",
  },
  {
    id: "5",
    email: "finance@bridge-tech.com",
    password: "finance123",
    name: "Sophie Legrand",
    role: "finance",
    department: "Finance",
    position: "Responsable Finance",
    phone: "0123456786",
    dateCreated: "01/01/2025",
  },
  {
    id: "6",
    email: "tuteur2@bridge-tech.com",
    password: "tuteur123",
    name: "Julie Petit",
    role: "tuteur",
    department: "Marketing",
    position: "Responsable Marketing",
    phone: "0123456785",
    dateCreated: "01/01/2025",
  },
]

export const mockDemandes: Demande[] = [
  {
    id: "1",
    date: "06/05/2025",
    type: "conge",
    statut: "En attente",
    details: "2 jours - 15-16 mai 2025",
    stagiaire: "Lucas Bernard",
    stagiaireId: "4",
    tuteurId: "3",
    tuteurDecision: "En attente",
    dateDebut: "15/05/2025",
    dateFin: "16/05/2025",
    duree: "2 jours",
    commentaires: [
      {
        id: "c1",
        userId: "4",
        userName: "Lucas Bernard",
        userRole: "stagiaire",
        date: "06/05/2025",
        message: "Demande de congé pour raisons personnelles",
      },
    ],
  },
  {
    id: "2",
    date: "06/05/2025",
    type: "stage_academique",
    statut: "Validé",
    details: "Stage développement web",
    stagiaire: "Lucas Bernard",
    stagiaireId: "4",
    tuteurId: "3",
    tuteurDecision: "Validé",
    rhDecision: "Validé",
    dateDebut: "01/06/2025",
    dateFin: "31/08/2025",
    duree: "3 mois",
    commentaires: [
      {
        id: "c2",
        userId: "4",
        userName: "Lucas Bernard",
        userRole: "stagiaire",
        date: "01/05/2025",
        message: "Demande de stage académique en développement web",
      },
      {
        id: "c3",
        userId: "3",
        userName: "Thomas Martin",
        userRole: "tuteur",
        date: "03/05/2025",
        message: "Validé, le candidat a un bon profil",
      },
      {
        id: "c4",
        userId: "2",
        userName: "Marie Dupont",
        userRole: "rh",
        date: "06/05/2025",
        message: "Demande approuvée, convention à préparer",
      },
    ],
  },
  {
    id: "3",
    date: "06/05/2025",
    type: "prolongation",
    statut: "En attente",
    details: "Prolongation de 2 mois",
    stagiaire: "Lucas Bernard",
    stagiaireId: "4",
    tuteurId: "3",
    tuteurDecision: "En attente",
    dateDebut: "01/09/2025",
    dateFin: "31/10/2025",
    duree: "2 mois",
  },
  {
    id: "4",
    date: "05/05/2025",
    type: "stage_professionnel",
    statut: "Refusé",
    details: "Stage marketing digital",
    stagiaire: "Emma Dubois",
    stagiaireId: "7",
    tuteurId: "6",
    tuteurDecision: "Validé",
    rhDecision: "Refusé",
    dateDebut: "01/07/2025",
    dateFin: "31/12/2025",
    duree: "6 mois",
    commentaires: [
      {
        id: "c5",
        userId: "7",
        userName: "Emma Dubois",
        userRole: "stagiaire",
        date: "01/05/2025",
        message: "Demande de stage professionnel en marketing digital",
      },
      {
        id: "c6",
        userId: "6",
        userName: "Julie Petit",
        userRole: "tuteur",
        date: "03/05/2025",
        message: "Profil intéressant, je valide",
      },
      {
        id: "c7",
        userId: "2",
        userName: "Marie Dupont",
        userRole: "rh",
        date: "05/05/2025",
        message: "Refusé, pas de budget disponible pour ce poste actuellement",
      },
    ],
  },
  {
    id: "5",
    date: "04/05/2025",
    type: "attestation",
    statut: "Validé",
    details: "Attestation de fin de stage",
    stagiaire: "Alex Moreau",
    stagiaireId: "8",
    tuteurId: "3",
    tuteurDecision: "Validé",
    rhDecision: "Validé",
  },
]

export const mockDocuments: Document[] = [
  {
    id: "1",
    date: "06/05/2025",
    nom: "Lettre de motivation",
    description: "Candidature stage développement",
    format: "DOC",
    stagiaire: "Lucas Bernard",
    stagiaireId: "4",
    type: "lettre_motivation",
    taille: "245 Ko",
  },
  {
    id: "2",
    date: "06/05/2025",
    nom: "Lettre de recomm...",
    description: "Lettre de l'ecole",
    format: "PDF",
    stagiaire: "Lucas Bernard",
    stagiaireId: "4",
    type: "lettre_recommandation",
    taille: "1.2 Mo",
  },
  {
    id: "3",
    date: "06/05/2025",
    nom: "CV Lucas Bernard",
    description: "CV mis à jour",
    format: "PDF",
    stagiaire: "Lucas Bernard",
    stagiaireId: "4",
    type: "cv",
    taille: "890 Ko",
  },
  {
    id: "4",
    date: "06/05/2025",
    nom: "Photocopie carte id",
    description: "Ma carte d'identité",
    format: "PDF",
    stagiaire: "Lucas Bernard",
    stagiaireId: "4",
    type: "piece_identite",
    taille: "1.5 Mo",
  },
  {
    id: "5",
    date: "06/05/2025",
    nom: "Plan de Localisation",
    description: "Le chez moi",
    format: "PDF",
    stagiaire: "Lucas Bernard",
    stagiaireId: "4",
    type: "autre",
    taille: "2.1 Mo",
  },
  {
    id: "6",
    date: "07/05/2025",
    nom: "Convention de stage",
    description: "Convention signée",
    format: "PDF",
    stagiaire: "Lucas Bernard",
    stagiaireId: "4",
    type: "convention",
    taille: "3.2 Mo",
  },
]

export const mockStagiaires: Stagiaire[] = [
  {
    id: "4",
    nom: "Bernard",
    prenom: "Lucas",
    email: "stagiaire@bridge-tech.com",
    telephone: "0123456787",
    adresse: "123 Rue des Stagiaires, Paris",
    dateNaissance: "15/05/2000",
    formation: "Master Informatique",
    ecole: "Université Paris Tech",
    niveau: "Bac+5",
    periode: "01/06/2025 - 31/08/2025",
    dateDebut: "01/06/2025",
    dateFin: "31/08/2025",
    tuteur: "Thomas Martin",
    tuteurId: "3",
    departement: "Développement",
    statut: "actif",
    evaluations: [
      {
        id: "e1",
        stagiaireId: "4",
        tuteurId: "3",
        date: "15/06/2025",
        competences: [
          { nom: "Travail en équipe", note: 4 },
          { nom: "Compétences techniques", note: 4 },
          { nom: "Communication", note: 3 },
          { nom: "Autonomie", note: 4 },
        ],
        commentaire: "Très bon début de stage, continue comme ça !",
        noteGlobale: 4,
      },
    ],
  },
  {
    id: "7",
    nom: "Dubois",
    prenom: "Emma",
    email: "emma.dubois@example.com",
    telephone: "0123456777",
    formation: "Master Marketing Digital",
    ecole: "ESC Paris",
    niveau: "Bac+5",
    periode: "Demande refusée",
    tuteur: "Julie Petit",
    tuteurId: "6",
    departement: "Marketing",
    statut: "en_attente",
  },
  {
    id: "8",
    nom: "Moreau",
    prenom: "Alex",
    email: "alex.moreau@example.com",
    telephone: "0123456767",
    formation: "Licence Informatique",
    ecole: "Université Lyon 1",
    niveau: "Bac+3",
    periode: "01/02/2025 - 30/04/2025",
    dateDebut: "01/02/2025",
    dateFin: "30/04/2025",
    tuteur: "Thomas Martin",
    tuteurId: "3",
    departement: "Développement",
    statut: "termine",
    evaluations: [
      {
        id: "e2",
        stagiaireId: "8",
        tuteurId: "3",
        date: "30/04/2025",
        competences: [
          { nom: "Travail en équipe", note: 5 },
          { nom: "Compétences techniques", note: 4 },
          { nom: "Communication", note: 5 },
          { nom: "Autonomie", note: 4 },
        ],
        commentaire: "Excellent stagiaire, a parfaitement rempli ses missions",
        noteGlobale: 4.5,
      },
    ],
  },
]

export const mockStatistiques: Statistique[] = [
  {
    id: "1",
    periode: "2025-Q1",
    nombreStagiaires: 3,
    nombreDemandesTotal: 8,
    nombreDemandesValidees: 5,
    nombreDemandesRefusees: 1,
    nombreDemandesEnAttente: 2,
    departements: [
      { nom: "Développement", nombre: 2 },
      { nom: "Marketing", nombre: 1 },
    ],
  },
  {
    id: "2",
    periode: "2025-Q2",
    nombreStagiaires: 5,
    nombreDemandesTotal: 12,
    nombreDemandesValidees: 7,
    nombreDemandesRefusees: 2,
    nombreDemandesEnAttente: 3,
    departements: [
      { nom: "Développement", nombre: 3 },
      { nom: "Marketing", nombre: 1 },
      { nom: "Finance", nombre: 1 },
    ],
  },
]

// Données pour les graphiques
export const mockGraphData = {
  stagiairesMensuels: [
    { mois: "Jan", nombre: 2 },
    { mois: "Fév", nombre: 3 },
    { mois: "Mar", nombre: 2 },
    { mois: "Avr", nombre: 4 },
    { mois: "Mai", nombre: 5 },
    { mois: "Juin", nombre: 7 },
    { mois: "Juil", nombre: 8 },
    { mois: "Août", nombre: 6 },
    { mois: "Sep", nombre: 4 },
    { mois: "Oct", nombre: 3 },
    { mois: "Nov", nombre: 2 },
    { mois: "Déc", nombre: 1 },
  ],
  demandesParType: [
    { type: "Stage académique", nombre: 15 },
    { type: "Stage professionnel", nombre: 8 },
    { type: "Congé", nombre: 12 },
    { type: "Prolongation", nombre: 5 },
    { type: "Attestation", nombre: 10 },
  ],
  tauxAcceptation: [
    { type: "Acceptées", pourcentage: 70 },
    { type: "Refusées", pourcentage: 15 },
    { type: "En attente", pourcentage: 15 },
  ],
  departements: [
    { nom: "Développement", nombre: 12 },
    { nom: "Marketing", nombre: 8 },
    { nom: "Finance", nombre: 5 },
    { nom: "RH", nombre: 3 },
    { nom: "Design", nombre: 7 },
  ],
}
