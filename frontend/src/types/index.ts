// Re-export shared types
export * from '../../../shared/types'

// Frontend-specific types
export interface ApiError {
  message: string
  status?: number
}

export interface ApiResponse<T> {
  data?: T
  error?: string
}
