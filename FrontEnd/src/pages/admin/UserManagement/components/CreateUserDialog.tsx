import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createUserSchema } from '../schemas'
import { createUser } from '../api'
import { CREATE_USER_ROLE_OPTIONS, DEFAULT_CREATE_USER_FORM } from '../constants'
import type { CreateUserFormState } from '../types'

interface CreateUserDialogProps {
  /**
   * Called after a user is successfully created.
   * The parent should use this to refresh the user list.
   */
  onSuccess: () => void
  /**
   * Role options rendered in the Role select.
   * Defaults to all creatable roles (RH, Assistant, Worker).
   * Pass a restricted subset (e.g. only Assistant + Worker) for RH users.
   */
  roleOptions?: Array<{ value: string; label: string }>
}

/** Inline error message rendered beneath an invalid field. */
function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="text-xs text-doku-rose">{message}</p>
}

/**
 * Self-contained dialog for creating a new user.
 *
 * Owns:
 * - Dialog open/close state
 * - Form input state (draft values)
 * - Field-level validation errors (from Zod `.safeParse()`)
 * - Submission state + server error
 *
 * Does NOT own the user list — it calls `onSuccess` so the parent
 * can decide how to react (typically by triggering a re-fetch).
 */
function CreateUserDialog({ onSuccess, roleOptions = CREATE_USER_ROLE_OPTIONS }: CreateUserDialogProps) {
  const [open, setOpen] = useState(false)
  const [formState, setFormState] = useState<CreateUserFormState>(
    DEFAULT_CREATE_USER_FORM,
  )
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [serverError, setServerError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // -------------------------------------------------------------------------
  // Handlers
  // -------------------------------------------------------------------------

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen)
    // Reset all state when the dialog closes
    if (!nextOpen) {
      setFormState(DEFAULT_CREATE_USER_FORM)
      setFieldErrors({})
      setServerError(null)
      setIsSubmitting(false)
    }
  }

  const handleChange = (key: keyof CreateUserFormState, value: string) => {
    setFormState((prev) => ({ ...prev, [key]: value }))
    // Clear the field error as soon as the user edits it
    if (fieldErrors[key]) {
      setFieldErrors((prev) => {
        const next = { ...prev }
        delete next[key]
        return next
      })
    }
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFieldErrors({})
    setServerError(null)

    // Validate with Zod — trim string fields before parsing
    const result = createUserSchema.safeParse({
      firstName: formState.firstName.trim(),
      lastName: formState.lastName.trim(),
      email: formState.email.trim(),
      role: formState.role,
    })

    if (!result.success) {
      // Map Zod issues to a flat { fieldName → firstErrorMessage } record
      const errors: Record<string, string> = {}
      for (const issue of result.error.issues) {
        const field = String(issue.path[0] ?? '')
        if (field && !errors[field]) {
          errors[field] = issue.message
        }
      }
      setFieldErrors(errors)
      return
    }

    setIsSubmitting(true)
    try {
      await createUser(result.data)
      handleOpenChange(false)
      onSuccess()
    } catch {
      setServerError('Unable to create user. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" className="rounded-full px-4">
          Create user
        </Button>
      </DialogTrigger>

      <DialogContent className="border border-border/60 bg-card/95 text-foreground shadow-[0_24px_60px_rgba(70,53,53,0.16)] sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="tracking-tight">Create user</DialogTitle>
          <DialogDescription className="leading-6">
            Add a new team member and assign their access role.
          </DialogDescription>
        </DialogHeader>

        <form className="grid gap-4" onSubmit={handleSubmit}>
          {/* Name row */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="grid gap-2">
              <label
                htmlFor="create-firstName"
                className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground"
              >
                First name
              </label>
              <Input
                id="create-firstName"
                name="firstName"
                placeholder="First name"
                value={formState.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
                aria-invalid={!!fieldErrors.firstName}
              />
              <FieldError message={fieldErrors.firstName} />
            </div>

            <div className="grid gap-2">
              <label
                htmlFor="create-lastName"
                className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground"
              >
                Last name
              </label>
              <Input
                id="create-lastName"
                name="lastName"
                placeholder="Last name"
                value={formState.lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
                aria-invalid={!!fieldErrors.lastName}
              />
              <FieldError message={fieldErrors.lastName} />
            </div>
          </div>

          {/* Email */}
          <div className="grid gap-2">
            <label
              htmlFor="create-email"
              className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground"
            >
              Email
            </label>
            <Input
              id="create-email"
              name="email"
              type="email"
              placeholder="name@company.com"
              value={formState.email}
              onChange={(e) => handleChange('email', e.target.value)}
              aria-invalid={!!fieldErrors.email}
            />
            <FieldError message={fieldErrors.email} />
          </div>

          {/* Role */}
          <div className="grid gap-2">
            <label
              htmlFor="create-role"
              className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground"
            >
              Role
            </label>
            <Select
              value={formState.role}
              onValueChange={(value) => handleChange('role', value)}
            >
              <SelectTrigger id="create-role" className="w-full">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {roleOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <FieldError message={fieldErrors.role} />
          </div>

          {/* Server-level error */}
          {serverError ? (
            <p className="text-xs text-doku-rose">{serverError}</p>
          ) : null}

          <DialogFooter className="bg-muted/30">
            <DialogClose asChild>
              <Button type="button" variant="outline" size="sm">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" size="sm" disabled={isSubmitting}>
              {isSubmitting ? 'Creating…' : 'Create user'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default CreateUserDialog
