import type { ReactNode } from 'react'

interface UserManagementHeaderProps {
  /** Formatted total user count to display in the badge (e.g. "1,234"). */
  totalUsersLabel: string
  /** Action buttons rendered in the top-right area (e.g. CreateUserDialog). */
  children?: ReactNode
}

/**
 * Page header section — title, description, total-users badge, and action slot.
 *
 * Accepts `children` for the action area so it stays decoupled from
 * the create-user dialog (or any future button placed there).
 */
function UserManagementHeader({ totalUsersLabel, children }: UserManagementHeaderProps) {
  return (
    <section className="glass-surface rounded-2xl p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
            User registry
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
            Search and review the roles assigned to each workspace member.
          </p>
        </div>

        <div className="flex shrink-0 flex-col items-start gap-3 sm:items-end">
          {children}
          <div className="rounded-full border border-border/60 bg-background/80 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
            Total users: {totalUsersLabel}
          </div>
        </div>
      </div>
    </section>
  )
}

export default UserManagementHeader
