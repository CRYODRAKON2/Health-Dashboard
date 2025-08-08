// User types
export interface User {
  id: string
  email: string
  created_at: string
}

// Vitals types
export interface Vitals {
  id: number
  user_id: string
  heart_rate: number
  temperature: number
  spo2: number
  blood_pressure_systolic: number
  blood_pressure_diastolic: number
  notes?: string
  created_at: string
}

export interface VitalsCreate {
  heart_rate: number
  temperature: number
  spo2: number
  blood_pressure_systolic: number
  blood_pressure_diastolic: number
  notes?: string
}

// Document types
export interface Document {
  id: number
  user_id: string
  file_name: string
  file_url: string
  file_size: number
  file_type: string
  extracted_text?: string
  created_at: string
}

export interface DocumentCreate {
  file_name: string
  file_url: string
  file_size: number
  file_type: string
  extracted_text?: string
}

// Chat types
export interface ChatMessage {
  id: string
  message: string
  response: string
  sources?: string[]
  timestamp: string
}

export interface ChatRequest {
  message: string
}

// API Response types
export interface ApiResponse<T> {
  data: T
  error?: string
}

export interface AuthResponse {
  access_token: string
  token_type: string
  user: User
}

// Dashboard summary types
export interface VitalsSummary {
  total_entries: number
  latest_heart_rate?: number
  latest_temperature?: number
  latest_spo2?: number
  latest_blood_pressure?: string
}

export interface DocumentSummary {
  total_documents: number
  total_size: number
  file_types: Record<string, number>
}
