import type { User, Demande, Document, Stagiaire } from "../mock-data"

// Configuration API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api"

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
    this.name = "ApiError"
  }
}

// Utilitaire pour les requêtes
async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`

  const config: RequestInit = {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  }

  // Ajouter le token d'authentification si disponible
  const token = localStorage.getItem("auth-token")
  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    }
  }

  try {
    const response = await fetch(url, config)

    if (!response.ok) {
      throw new ApiError(response.status, `HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    throw new ApiError(0, "Network error")
  }
}

// Services Auth
export const authService = {
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    return apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })
  },

  async register(userData: Partial<User>): Promise<{ user: User; token: string }> {
    return apiRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    })
  },

  async logout(): Promise<void> {
    return apiRequest("/auth/logout", { method: "POST" })
  },

  async refreshToken(): Promise<{ token: string }> {
    return apiRequest("/auth/refresh", { method: "POST" })
  },
}

// Services Demandes
export const demandesService = {
  async getAll(filters?: any): Promise<Demande[]> {
    const params = new URLSearchParams(filters)
    return apiRequest(`/demandes?${params}`)
  },

  async getById(id: string): Promise<Demande> {
    return apiRequest(`/demandes/${id}`)
  },

  async create(demande: Partial<Demande>): Promise<Demande> {
    return apiRequest("/demandes", {
      method: "POST",
      body: JSON.stringify(demande),
    })
  },

  async update(id: string, demande: Partial<Demande>): Promise<Demande> {
    return apiRequest(`/demandes/${id}`, {
      method: "PUT",
      body: JSON.stringify(demande),
    })
  },

  async delete(id: string): Promise<void> {
    return apiRequest(`/demandes/${id}`, { method: "DELETE" })
  },

  async approve(id: string, comment?: string): Promise<Demande> {
    return apiRequest(`/demandes/${id}/approve`, {
      method: "POST",
      body: JSON.stringify({ comment }),
    })
  },

  async reject(id: string, comment?: string): Promise<Demande> {
    return apiRequest(`/demandes/${id}/reject`, {
      method: "POST",
      body: JSON.stringify({ comment }),
    })
  },
}

// Services Documents
export const documentsService = {
  async getAll(filters?: any): Promise<Document[]> {
    const params = new URLSearchParams(filters)
    return apiRequest(`/documents?${params}`)
  },

  async upload(file: File, metadata: Partial<Document>): Promise<Document> {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("metadata", JSON.stringify(metadata))

    return apiRequest("/documents/upload", {
      method: "POST",
      body: formData,
      headers: {}, // Remove Content-Type to let browser set it for FormData
    })
  },

  async delete(id: string): Promise<void> {
    return apiRequest(`/documents/${id}`, { method: "DELETE" })
  },

  async download(id: string): Promise<Blob> {
    const response = await fetch(`${API_BASE_URL}/documents/${id}/download`)
    return response.blob()
  },
}

// Services Stagiaires
export const stagiairesService = {
  async getAll(filters?: any): Promise<Stagiaire[]> {
    const params = new URLSearchParams(filters)
    return apiRequest(`/stagiaires?${params}`)
  },

  async getById(id: string): Promise<Stagiaire> {
    return apiRequest(`/stagiaires/${id}`)
  },

  async create(stagiaire: Partial<Stagiaire>): Promise<Stagiaire> {
    return apiRequest("/stagiaires", {
      method: "POST",
      body: JSON.stringify(stagiaire),
    })
  },

  async update(id: string, stagiaire: Partial<Stagiaire>): Promise<Stagiaire> {
    return apiRequest(`/stagiaires/${id}`, {
      method: "PUT",
      body: JSON.stringify(stagiaire),
    })
  },

  async delete(id: string): Promise<void> {
    return apiRequest(`/stagiaires/${id}`, { method: "DELETE" })
  },
}

// Services Exports
export const exportService = {
  async exportToCSV(type: "demandes" | "stagiaires" | "documents", filters?: any): Promise<Blob> {
    const params = new URLSearchParams({ ...filters, format: "csv" })
    const response = await fetch(`${API_BASE_URL}/export/${type}?${params}`)
    return response.blob()
  },

  async exportToPDF(type: "demandes" | "stagiaires" | "documents", filters?: any): Promise<Blob> {
    const params = new URLSearchParams({ ...filters, format: "pdf" })
    const response = await fetch(`${API_BASE_URL}/export/${type}?${params}`)
    return response.blob()
  },

  async generateDocument(templateId: string, data: any): Promise<Blob> {
    const response = await fetch(`${API_BASE_URL}/documents/generate/${templateId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    return response.blob()
  },
}

// Services Statistiques
export const statisticsService = {
  async getDashboardStats(): Promise<any> {
    return apiRequest("/statistics/dashboard")
  },

  async getChartData(type: string, period?: string): Promise<any> {
    const params = new URLSearchParams({ type, ...(period && { period }) })
    return apiRequest(`/statistics/charts?${params}`)
  },
}
