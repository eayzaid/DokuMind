import axios from 'axios'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
})

export type LoginPayload = {
  email: string
  password: string
}

export const loginUser = async (payload: LoginPayload) => {
  const response = await apiClient.post('/auth/login', payload , {
    withCredentials : true
  })
  return response.data
}
