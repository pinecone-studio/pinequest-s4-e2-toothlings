export interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
}

export interface ApiError {
  success: false
  error: string
  statusCode: number
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}
