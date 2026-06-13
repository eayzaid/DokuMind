import type { FilterValues, CreateUserFormState } from './types'

// ---------------------------------------------------------------------------
// Role options — used in selects and filters
// ---------------------------------------------------------------------------

export const ROLE_FILTER_OPTIONS: Array<{ value: string; label: string }> = [
  { value: '', label: 'All roles' },
  { value: 'SUPER_RH', label: 'Super HR' },
  { value: 'RH', label: 'HR' },
  { value: 'ASSISTANT', label: 'Assistant' },
  { value: 'WORKER', label: 'Worker' },
]

export const CREATE_USER_ROLE_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'RH', label: 'HR' },
  { value: 'ASSISTANT', label: 'Assistant' },
  { value: 'WORKER', label: 'Worker' },
]

/** Human-readable labels for roles returned by the API. */
export const ROLE_LABELS: Record<string, string> = {
  SUPER_RH: 'Super HR',
  RH: 'HR',
  ASSISTANT: 'Assistant',
  WORKER: 'Worker',
}

// ---------------------------------------------------------------------------
// Default form states
// ---------------------------------------------------------------------------

export const DEFAULT_FILTERS: FilterValues = {
  firstName: '',
  lastName: '',
  role: '',
}

export const DEFAULT_CREATE_USER_FORM: CreateUserFormState = {
  firstName: '',
  lastName: '',
  email: '',
  role: '',
}
