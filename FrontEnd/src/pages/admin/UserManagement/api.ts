import { apiClient } from '@/services/apiClient'
import type { UsersResponse, FilterValues, CreateUserValues, UserDetail } from './types'

/**
 * Fetches a paginated list of users with optional filters.
 *
 * Pure async function — no React hooks, no state.
 * All side-effects (loading flags, error state) are handled by the caller.
 */
export async function fetchUsers(
  page: number,
  filters: FilterValues,
): Promise<UsersResponse> {
  const params: Record<string, string | number> = { page }

  const firstName = filters.firstName.trim()
  const lastName = filters.lastName.trim()

  if (firstName) params.first_name = firstName
  if (lastName) params.last_name = lastName
  if (filters.role) params.role = filters.role

  const response = await apiClient.get<UsersResponse>('/users', { params })
  return response.data
}

/**
 * Creates a new user.
 *
 * Pure async function — no React hooks, no state.
 * Throws on failure so the caller can display an appropriate error.
 */
export async function createUser(data: CreateUserValues): Promise<void> {
  await apiClient.post('/users', data)
}

/**
 * Fetches the full details of a single user.
 *
 * Pure async function — no React hooks, no state.
 * Throws on failure so the caller can display an appropriate error.
 */
export async function fetchUserById(userId: string): Promise<UserDetail> {
  const response = await apiClient.get<UserDetail>(`/users/${userId}`)
  return response.data
}
