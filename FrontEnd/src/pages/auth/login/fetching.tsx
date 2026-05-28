import { apiClient } from '../../../services/apiClient'
import type { AuthResponse } from '../../../types/auth'

export type LoginPayload = {
  email: string
  password: string
}

export const loginUser = async (payload: LoginPayload) => {
  const response = await apiClient.post<AuthResponse>('/auth/login', payload)
  return response.data
}
