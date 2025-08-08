import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

class ApiClient {
  private async getAuthHeaders() {
    const { data: { session } } = await supabase.auth.getSession()
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    
    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`
    }
    
    return headers
  }

  async get(endpoint: string) {
    const headers = await this.getAuthHeaders()
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers,
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    return response.json()
  }

  async post(endpoint: string, data?: any) {
    const headers = await this.getAuthHeaders()
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: data ? JSON.stringify(data) : undefined,
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    return response.json()
  }

  async delete(endpoint: string) {
    const headers = await this.getAuthHeaders()
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers,
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    return response.json()
  }

  // Vitals API
  async getVitals() {
    return this.get('/vitals')
  }

  async createVitals(vitals: any) {
    return this.post('/vitals', vitals)
  }

  async deleteVitals(id: number) {
    return this.delete(`/vitals/${id}`)
  }

  // Documents API
  async getDocuments() {
    return this.get('/documents')
  }

  async deleteDocument(id: number) {
    return this.delete(`/documents/${id}`)
  }

  // Chat API
  async sendMessage(message: string) {
    return this.post('/chat', { message })
  }
}

export const apiClient = new ApiClient()
