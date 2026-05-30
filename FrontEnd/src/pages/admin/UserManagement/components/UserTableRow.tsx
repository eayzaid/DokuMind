import { ROLE_LABELS } from '../constants'
import type { UserSummary } from '../types'

interface UserTableRowProps {
  user: UserSummary
}

/**
 * A single user row in the users table.
 *
 * Isolated as its own component so it can be inspected independently
 * in React DevTools and unit-tested without rendering the full table.
 */
function UserTableRow({ user }: UserTableRowProps) {
  return (
    <tr className="border-b border-border last:border-b-0">
      <td className="px-6 py-4 text-xs text-muted-foreground">{user.id}</td>
      <td className="px-6 py-4 font-medium">{user.firstName}</td>
      <td className="px-6 py-4 font-medium">{user.lastName}</td>
      <td className="px-6 py-4">
        <span className="rounded-full border border-border bg-background px-3 py-1 text-xs">
          {ROLE_LABELS[user.role] ?? user.role}
        </span>
      </td>
    </tr>
  )
}

export default UserTableRow
