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
    <section className="rounded-xl border bg-card p-6 shadow-card">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
            User registry
          </p>
          <h1 className="mt-2 text-2xl font-semibold">Users</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Search and review the roles assigned to each workspace member.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {children}
          <div className="rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground">
            Total users: {totalUsersLabel}
          </div>
        </div>
      </div>
    </section>
  )
}

export default UserManagementHeader
