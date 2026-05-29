import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import { apiClient } from '@/services/apiClient'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type RoleFilter = '' | 'SUPER_RH' | 'RH' | 'ASSISTANT' | 'WORKER'

type UserSummary = {
  id: string
  firstName: string
  lastName: string
  role: string
}

type UsersResponse = {
  totalNumberOfUsers: number
  totalPages: number
  users: UserSummary[]
}

type FilterState = {
  firstName: string
  lastName: string
  role: RoleFilter
}

const defaultFilters: FilterState = {
  firstName: '',
  lastName: '',
  role: '',
}

const roleOptions = [
  { value: '', label: 'All roles' },
  { value: 'SUPER_RH', label: 'Super HR' },
  { value: 'RH', label: 'HR' },
  { value: 'ASSISTANT', label: 'Assistant' },
  { value: 'WORKER', label: 'Worker' },
]

const roleLabels: Record<string, string> = {
  SUPER_RH: 'Super HR',
  RH: 'HR',
  ASSISTANT: 'Assistant',
  WORKER: 'Worker',
}

function UserManagement() {
  const [filters, setFilters] = useState<FilterState>(defaultFilters)
  const [queryFilters, setQueryFilters] = useState<FilterState>(defaultFilters)
  const [page, setPage] = useState(0)
  const [users, setUsers] = useState<UserSummary[]>([])
  const [totalPages, setTotalPages] = useState(0)
  const [totalUsers, setTotalUsers] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const totalUsersLabel = useMemo(() => {
    return new Intl.NumberFormat().format(totalUsers)
  }, [totalUsers])

  const fetchUsers = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    const params: Record<string, string | number> = { page }
    const firstName = queryFilters.firstName.trim()
    const lastName = queryFilters.lastName.trim()

    if (firstName) {
      params.first_name = firstName
    }
    if (lastName) {
      params.last_name = lastName
    }
    if (queryFilters.role) {
      params.role = queryFilters.role
    }

    try {
      const response = await apiClient.get<UsersResponse>('/users', { params })
      setUsers(response.data.users)
      setTotalPages(response.data.totalPages)
      setTotalUsers(response.data.totalNumberOfUsers)
    } catch {
      setError('Unable to load users. Please try again.')
      setUsers([])
      setTotalPages(0)
      setTotalUsers(0)
    } finally {
      setIsLoading(false)
    }
  }, [page, queryFilters])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const handleFilterChange = (
    key: keyof FilterState,
    value: FilterState[keyof FilterState],
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setPage(0)
    setQueryFilters({ ...filters })
  }

  const handleReset = () => {
    setFilters(defaultFilters)
    setQueryFilters(defaultFilters)
    setPage(0)
  }

  const hasPages = totalPages > 0
  const currentPage = hasPages ? page + 1 : 0
  const isPrevDisabled = page <= 0 || !hasPages
  const isNextDisabled = !hasPages || page + 1 >= totalPages

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
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
          <div className="rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground">
            Total users: {totalUsersLabel}
          </div>
        </div>
      </section>

      <section className="rounded-xl border bg-card shadow-card">
        <div className="border-b border-border px-6 py-4">
          <form
            className="grid gap-3 md:grid-cols-[repeat(3,minmax(0,1fr))_auto]"
            onSubmit={handleSubmit}
          >
            <Input
              name="firstName"
              placeholder="First name"
              value={filters.firstName}
              onChange={(event) =>
                handleFilterChange('firstName', event.target.value)
              }
            />
            <Input
              name="lastName"
              placeholder="Last name"
              value={filters.lastName}
              onChange={(event) =>
                handleFilterChange('lastName', event.target.value)
              }
            />
            <select
              name="role"
              value={filters.role}
              onChange={(event) =>
                handleFilterChange('role', event.target.value as RoleFilter)
              }
              className="h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 text-sm text-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              {roleOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <div className="flex items-center gap-2">
              <Button type="submit" size="sm">
                Apply
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleReset}
              >
                Reset
              </Button>
            </div>
          </form>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted text-xs uppercase tracking-[0.2em] text-muted-foreground">
              <tr>
                <th className="px-6 py-3 text-left font-semibold">User ID</th>
                <th className="px-6 py-3 text-left font-semibold">
                  First name
                </th>
                <th className="px-6 py-3 text-left font-semibold">
                  Last name
                </th>
                <th className="px-6 py-3 text-left font-semibold">Role</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-6 text-center text-sm text-muted-foreground"
                  >
                    Loading users...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-6 text-center text-sm text-muted-foreground"
                  >
                    {error ?? 'No users found for the selected filters.'}
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-border last:border-b-0"
                  >
                    <td className="px-6 py-4 text-xs text-muted-foreground">
                      {user.id}
                    </td>
                    <td className="px-6 py-4 font-medium">
                      {user.firstName}
                    </td>
                    <td className="px-6 py-4 font-medium">
                      {user.lastName}
                    </td>
                    <td className="px-6 py-4">
                      <span className="rounded-full border border-border bg-background px-3 py-1 text-xs">
                        {roleLabels[user.role] ?? user.role}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 border-t border-border px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            Page {currentPage} of {hasPages ? totalPages : 0}
          </p>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
              disabled={isPrevDisabled}
            >
              Previous
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() =>
                setPage((prev) =>
                  isNextDisabled ? prev : Math.min(prev + 1, totalPages - 1),
                )
              }
              disabled={isNextDisabled}
            >
              Next
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}

export default UserManagement
