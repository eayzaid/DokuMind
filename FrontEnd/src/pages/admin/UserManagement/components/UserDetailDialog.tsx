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
import { fetchUserById, resetUserPassword, updateUser } from '../api'
import { CREATE_USER_ROLE_OPTIONS } from '../constants'
import type { UserDetail, CreateUserValues } from '../types'

interface UserDetailDialogProps {
  /** The ID of the user to display, or null when the dialog is closed. */
  userId: string | null
  onClose: () => void
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
 * Opens whenever `userId` is non-null and closes when the user dismisses it
 * (calls `onClose`) or when `userId` is set back to null by the parent.
 */
function UserDetailDialog({ userId, onClose }: UserDetailDialogProps) {
  const [user, setUser] = useState<UserDetail | null>(null)
  const [form, setForm] = useState<EditState | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isResetting, setIsResetting] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch user data whenever the dialog opens with a new userId
  useEffect(() => {
    if (!userId) {
      setUser(null)
      setForm(null)
      setError(null)
      return
    }

    let cancelled = false

    setIsLoading(true)
    setError(null)
    setUser(null)
    setForm(null)

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
        description: `A new password has been set for ${user.firstName} ${user.lastName}.`,
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
      toast.success('User updated successfully', {
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
            <DialogDescription>
              Loading user information…
            </DialogDescription>
          )}
        </DialogHeader>

        {isLoading && (
          <p className="py-4 text-center text-sm text-muted-foreground">
            Loading…
          </p>
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
                    {CREATE_USER_ROLE_OPTIONS.map((opt) => (
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

        {form && (
          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full sm:w-auto"
              disabled={isResetting}
              onClick={handleResetPassword}
            >
              {isResetting ? 'Resetting…' : 'Reset password'}
            </Button>
            <Button
              type="button"
              size="sm"
              className="w-full sm:w-auto"
              disabled={isUpdating || isResetting}
              onClick={handleUpdate}
            >
              {isUpdating ? 'Updating…' : 'Update'}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default UserDetailDialog
