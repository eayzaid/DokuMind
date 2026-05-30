import { apiClient } from '../../../services/apiClient'
import type { AuthResponse } from '../../../types/auth'

export type SignUpPayload = {
  first_name: string
  last_name: string
  company_name: string
  company_address: string
  email: string
  password: string
}

export const signUpUser = async (payload: SignUpPayload) => {
  const response = await apiClient.post<AuthResponse>('/auth/signup', payload)
  return response.data
}
