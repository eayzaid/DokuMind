import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { fetchUserById, resetUserPassword, updateUser, deleteUser } from '../api'
import { CREATE_USER_ROLE_OPTIONS } from '../constants'
import type { UserDetail, CreateUserValues } from '../types'

interface UserDetailDialogProps {
  /** The ID of the user to display, or null when the dialog is closed. */
  userId: string | null
  onClose: () => void
  /** Called after a successful deletion so the parent can refresh the list. */
  onDelete: () => void
  /**
   * Role options shown in the Role select when editing.
   * Defaults to all creatable roles (RH, Assistant, Worker).
   * Pass a restricted subset (e.g. only Assistant + Worker) for RH users.
   */
  roleOptions?: Array<{ value: string; label: string }>
}

/** Editable form state mirroring the user detail fields. */
type EditState = {
  firstName: string
  lastName: string
  email: string
  role: string
}

/** A labelled editable input field. */
function EditField({
  label,
  id,
  value,
  type = 'text',
  onChange,
}: {
  label: string
  id: string
  value: string
  type?: string
  onChange: (value: string) => void
}) {
  return (
    <div className="grid gap-1.5">
      <label
        htmlFor={id}
        className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground"
      >
        {label}
      </label>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}

/**
 * Modal that loads and shows the editable details of a single user.
 *
 * Actions available:
 * - **Update** — saves changed fields via PUT /users/{id}
 * - **Reset password** — triggers a password reset email via POST /users/{id}/reset
 * - **Delete** — two-step confirmation guard before calling DELETE /users/{id}.
 *   On success it fires a toast, closes the dialog, and calls `onDelete` so
 *   the parent list refreshes.
 */
function UserDetailDialog({ userId, onClose, onDelete, roleOptions = CREATE_USER_ROLE_OPTIONS }: UserDetailDialogProps) {
  const [user, setUser] = useState<UserDetail | null>(null)
  const [form, setForm] = useState<EditState | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isResetting, setIsResetting] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  /**
   * Two-step delete guard.
   * false  → "Delete" button shows normally
   * true   → switches to a "Confirm deletion?" warning strip
   */
  const [deleteConfirmPending, setDeleteConfirmPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch user data whenever the dialog opens with a new userId
  useEffect(() => {
    if (!userId) {
      setUser(null)
      setForm(null)
      setError(null)
      setDeleteConfirmPending(false)
      return
    }

    let cancelled = false

    setIsLoading(true)
    setError(null)
    setUser(null)
    setForm(null)
    setDeleteConfirmPending(false)

    fetchUserById(userId)
      .then((data) => {
        if (!cancelled) {
          setUser(data)
          setForm({
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            role: data.role,
          })
        }
      })
      .catch(() => {
        if (!cancelled) setError('Failed to load user details. Please try again.')
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [userId])

  const handleFieldChange = (key: keyof EditState, value: string) => {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev))
  }

  const handleResetPassword = async () => {
    if (!user) return
    setIsResetting(true)
    try {
      await resetUserPassword(user.id)
      toast.success('Password reset successfully', {
        description: `A new password has been sent to ${user.firstName} ${user.lastName}.`,
      })
    } catch {
      toast.error('Failed to reset password', {
        description: 'An error occurred. Please try again.',
      })
    } finally {
      setIsResetting(false)
    }
  }

  const handleUpdate = async () => {
    if (!user || !form) return
    setIsUpdating(true)
    try {
      const payload: CreateUserValues = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        role: form.role as CreateUserValues['role'],
      }
      await updateUser(user.id, payload)
      toast.success('User updated', {
        description: `${payload.firstName} ${payload.lastName}'s details have been saved.`,
      })
    } catch {
      toast.error('Failed to update user', {
        description: 'An error occurred. Please try again.',
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDeleteRequest = () => {
    // First click — show the confirmation strip instead of immediately deleting
    setDeleteConfirmPending(true)
  }

  const handleDeleteCancel = () => {
    setDeleteConfirmPending(false)
  }

  const handleDeleteConfirm = async () => {
    if (!user) return
    setIsDeleting(true)
    try {
      await deleteUser(user.id)
      toast.success('User deleted', {
        description: `${user.firstName} ${user.lastName} has been permanently removed.`,
      })
      onClose()
      onDelete()
    } catch {
      toast.error('Failed to delete user', {
        description: 'An error occurred. Please try again.',
      })
      setIsDeleting(false)
      setDeleteConfirmPending(false)
    }
  }

  const isBusy = isUpdating || isResetting || isDeleting

  return (
    <Dialog open={!!userId} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="border border-border bg-card text-foreground shadow-warm sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>User details</DialogTitle>
          {user && (
            <DialogDescription className="font-mono text-xs">
              {user.id}
            </DialogDescription>
          )}
          {!user && !isLoading && (
            <DialogDescription>Loading user information…</DialogDescription>
          )}
        </DialogHeader>

        {isLoading && (
          <p className="py-4 text-center text-sm text-muted-foreground">Loading…</p>
        )}

        {error && (
          <p className="py-4 text-center text-xs text-doku-rose">{error}</p>
        )}

        {form && (
          <div className="grid gap-4">
            {/* Two-column name row */}
            <div className="grid gap-3 sm:grid-cols-2">
              <EditField
                label="First name"
                id="detail-firstName"
                value={form.firstName}
                onChange={(v) => handleFieldChange('firstName', v)}
              />
              <EditField
                label="Last name"
                id="detail-lastName"
                value={form.lastName}
                onChange={(v) => handleFieldChange('lastName', v)}
              />
            </div>

            <EditField
              label="Email"
              id="detail-email"
              type="email"
              value={form.email}
              onChange={(v) => handleFieldChange('email', v)}
            />

            {/* Role select */}
            <div className="grid gap-1.5">
              <label
                htmlFor="detail-role"
                className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground"
              >
                Role
              </label>
              <Select
                value={form.role}
                onValueChange={(v) => handleFieldChange('role', v)}
              >
                <SelectTrigger id="detail-role" className="w-full">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {roleOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* Delete confirmation strip — replaces the footer when pending        */}
        {/* ------------------------------------------------------------------ */}
        {deleteConfirmPending && user && (
          <div className="flex items-center justify-between gap-3 rounded-lg border border-doku-rose/30 bg-doku-rose/5 px-4 py-3">
            <p className="text-xs text-doku-rose">
              Permanently delete{' '}
              <span className="font-semibold">
                {user.firstName} {user.lastName}
              </span>
              ? This cannot be undone.
            </p>
            <div className="flex shrink-0 items-center gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleDeleteCancel}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                className="bg-doku-rose text-white hover:bg-doku-rose/90"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting…' : 'Yes, delete'}
              </Button>
            </div>
          </div>
        )}

        {form && !deleteConfirmPending && (
          <DialogFooter className="flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            {/* Left-side destructive action */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full border-doku-rose/40 text-doku-rose hover:border-doku-rose hover:bg-doku-rose/5 sm:w-auto"
              disabled={isBusy}
              onClick={handleDeleteRequest}
            >
              Delete user
            </Button>

            {/* Right-side safe actions */}
            <div className="flex w-full gap-2 sm:w-auto">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex-1 sm:flex-none"
                disabled={isBusy}
                onClick={handleResetPassword}
              >
                {isResetting ? 'Resetting…' : 'Reset password'}
              </Button>
              <Button
                type="button"
                size="sm"
                className="flex-1 sm:flex-none"
                disabled={isBusy}
                onClick={handleUpdate}
              >
                {isUpdating ? 'Saving…' : 'Save'}
              </Button>
            </div>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default UserDetailDialog
