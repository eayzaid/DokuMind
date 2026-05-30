import { ROLE_LABELS } from '../constants'
import type { UserSummary } from '../types'

interface UserTableRowProps {
  user: UserSummary
  onClick: (userId: string) => void
}

/**
 * A single user row in the users table.
 *
 * Isolated as its own component so it can be inspected independently
 * in React DevTools and unit-tested without rendering the full table.
 */
function UserTableRow({ user, onClick }: UserTableRowProps) {
  return (
    <tr
      className="cursor-pointer border-b border-border transition-colors last:border-b-0 hover:bg-muted/50"
      onClick={() => onClick(user.id)}
    >
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
