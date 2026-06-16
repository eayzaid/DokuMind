import { useState } from 'react'
import UserTableRow from './UserTableRow'
import UserDetailDialog from './UserDetailDialog'
import type { UserSummary } from '../types'

interface UserTableProps {
  users: UserSummary[]
  isLoading: boolean
  /** Error message to display when users couldn't be loaded. */
  error: string | null
  /** Called after a user is deleted so the parent can refresh the list. */
  onDelete: () => void
  /**
   * Role options passed to the detail dialog's edit form.
   * Defaults to all roles; pass a restricted list for limited-privilege users.
   */
  roleOptions?: Array<{ value: string; label: string }>
}

/** Full-width row used for loading / empty states. */
function PlaceholderRow({ message }: { message: string }) {
  return (
    <tr>
      <td
        colSpan={4}
        className="px-6 py-8 text-center text-sm text-muted-foreground"
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
 * Clicking a row opens `UserDetailDialog` to show full user details.
 */
function UserTable({ users, isLoading, error, onDelete, roleOptions }: UserTableProps) {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs uppercase tracking-[0.2em] text-muted-foreground">
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
              users.map((user) => (
                <UserTableRow
                  key={user.id}
                  user={user}
                  onClick={setSelectedUserId}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      <UserDetailDialog
        userId={selectedUserId}
        onClose={() => setSelectedUserId(null)}
        onDelete={onDelete}
        roleOptions={roleOptions}
      />
    </>
  )
}

export default UserTable
