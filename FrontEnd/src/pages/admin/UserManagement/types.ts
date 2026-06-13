import type { CreateUserValues } from './schemas'

// Re-export so consumers only need to import from `./types`
export type { CreateUserValues }

// ---------------------------------------------------------------------------
// Filter types
// ---------------------------------------------------------------------------

export type RoleFilter = '' | 'SUPER_RH' | 'RH' | 'ASSISTANT' | 'WORKER'

export type FilterValues = {
  firstName: string
  lastName: string
  role: RoleFilter
}

// ---------------------------------------------------------------------------
// Form state types
// ---------------------------------------------------------------------------

/**
 * Raw form state for the create-user dialog.
 * `role` is kept as a plain `string` here so an unselected select can hold
 * an empty string — Zod validates the actual value on submit.
 */
export type CreateUserFormState = {
  firstName: string
  lastName: string
  email: string
  role: string
}

// ---------------------------------------------------------------------------
// API response types
// ---------------------------------------------------------------------------

/** A single user as returned by the GET /users endpoint. */
export type UserSummary = {
  id: string
  firstName: string
  lastName: string
  role: string
}

/** Full user details returned by GET /users/{userId}. */
export type UserDetail = {
  id: string
  firstName: string
  lastName: string
  email: string
  role: string
}

/** Paginated response from GET /users. */
export type UsersResponse = {
  totalNumberOfUsers: number
  totalPages: number
  users: UserSummary[]
}
