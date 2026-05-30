import { z } from 'zod'

/**
 * Zod schema for the create-user form.
 * This is the single source of truth for all create-user validation rules.
 *
 * Derive types from this schema with `z.infer<typeof createUserSchema>`
 * instead of defining them manually to avoid drift.
 */
export const createUserSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.email('Please enter a valid email address'),
  role: z.enum(['RH', 'ASSISTANT', 'WORKER']),
})

export type CreateUserValues = z.infer<typeof createUserSchema>
