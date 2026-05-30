import UserTableRow from './UserTableRow'
import type { UserSummary } from '../types'

interface UserTableProps {
  users: UserSummary[]
  isLoading: boolean
  /** Error message to display when users couldn't be loaded. */
  error: string | null
}

/** Full-width row used for loading / empty states. */
function PlaceholderRow({ message }: { message: string }) {
  return (
    <tr>
      <td
        colSpan={4}
        className="px-6 py-6 text-center text-sm text-muted-foreground"
      >
        {message}
      </td>
    </tr>
  )
}

/**
 * Users data table.
 *
 * Delegates each data row to `UserTableRow` and handles the three
 * display states (loading, empty/error, data) in one place.
 */
function UserTable({ users, isLoading, error }: UserTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-muted text-xs uppercase tracking-[0.2em] text-muted-foreground">
          <tr>
            <th className="px-6 py-3 text-left font-semibold">User ID</th>
            <th className="px-6 py-3 text-left font-semibold">First name</th>
            <th className="px-6 py-3 text-left font-semibold">Last name</th>
            <th className="px-6 py-3 text-left font-semibold">Role</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <PlaceholderRow message="Loading users…" />
          ) : users.length === 0 ? (
            <PlaceholderRow
              message={error ?? 'No users found for the selected filters.'}
            />
          ) : (
            users.map((user) => <UserTableRow key={user.id} user={user} />)
          )}
        </tbody>
      </table>
    </div>
  )
}

export default UserTable
