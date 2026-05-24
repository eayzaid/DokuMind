import axios from 'axios'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
})

export { apiClient }

export type SignUpPayload = {
  first_name: string
  last_name: string
  company_name: string
  company_address: string
  email: string
  password: string
}

export const signUpUser = async (payload: SignUpPayload) => {
  const response = await apiClient.post('/auth/signup', payload, {
    withCredentials: true,
  })
  return response.data
}
