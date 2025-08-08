import { createClient } from '@supabase/supabase-js'
import { Vitals, VitalsCreate, Document, DocumentCreate } from '@/types'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

class SupabaseClient {
  // Vitals CRUD
  async getVitals(): Promise<Vitals[]> {
    const { data, error } = await supabase
      .from('vitals')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch vitals: ${error.message}`)
    }

    return data || []
  }

  async createVitals(vitals: VitalsCreate): Promise<Vitals> {
    const { data, error } = await supabase
      .from('vitals')
      .insert([vitals])
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create vitals: ${error.message}`)
    }

    return data
  }

  async deleteVitals(id: number): Promise<void> {
    const { error } = await supabase
      .from('vitals')
      .delete()
      .eq('id', id)

    if (error) {
      throw new Error(`Failed to delete vitals: ${error.message}`)
    }
  }

  // Documents CRUD
  async getDocuments(): Promise<Document[]> {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch documents: ${error.message}`)
    }

    return data || []
  }

  async createDocument(document: DocumentCreate): Promise<Document> {
    const { data, error } = await supabase
      .from('documents')
      .insert([document])
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create document: ${error.message}`)
    }

    return data
  }

  async deleteDocument(id: number): Promise<void> {
    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', id)

    if (error) {
      throw new Error(`Failed to delete document: ${error.message}`)
    }
  }

  // File upload to Supabase Storage
  async uploadFile(file: File, bucket: string = 'documents'): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      throw new Error('User not authenticated')
    }
    
    const fileName = `${user.id}/${Date.now()}-${file.name}`
    
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file)

    if (error) {
      throw new Error(`Failed to upload file: ${error.message}`)
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName)

    return urlData.publicUrl
  }

  // Chat with backend (still needs backend for AI processing)
  async sendMessage(message: string): Promise<any> {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session?.access_token) {
      throw new Error('No authentication token available')
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify({ message })
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  // Get current user
  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) {
      throw new Error(`Failed to get user: ${error.message}`)
    }

    return user
  }

  // Auth methods
  async signUp(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password
    })

    if (error) {
      throw new Error(`Sign up failed: ${error.message}`)
    }

    return data
  }

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      throw new Error(`Sign in failed: ${error.message}`)
    }

    return data
  }

  async signOut() {
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      throw new Error(`Sign out failed: ${error.message}`)
    }
  }
}

export const supabaseClient = new SupabaseClient()
