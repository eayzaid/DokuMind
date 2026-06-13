import { useCallback, useEffect, useMemo, useState } from 'react'
import { fetchUsers } from '../api'
import { DEFAULT_FILTERS } from '../constants'
import type { FilterValues, UserSummary } from '../types'

/**
 * Manages all data-fetching state for the user management page.
 *
 * Responsibilities:
 * - Paginated user list (fetched via `api.ts`)
 * - Active filter state (separate from the filter bar's local draft state)
 * - Pagination controls
 * - Manual refresh (increment `refreshKey` to force a re-fetch without
 *   changing page or filters — used after mutations like create/delete)
 *
 * Does NOT own UI state (dialogs, form inputs, etc.).
 */
export function useUsers() {
  const [users, setUsers] = useState<UserSummary[]>([])
  const [totalPages, setTotalPages] = useState(0)
  const [totalUsers, setTotalUsers] = useState(0)
  const [page, setPage] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeFilters, setActiveFilters] = useState<FilterValues>(DEFAULT_FILTERS)

  // Incrementing this forces a re-fetch even when page/filters haven't changed
  // (e.g. after successfully creating a user on page 0 with no filters active).
  const [refreshKey, setRefreshKey] = useState(0)

  const loadUsers = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await fetchUsers(page, activeFilters)
      setUsers(data.users)
      setTotalPages(data.totalPages)
      setTotalUsers(data.totalNumberOfUsers)
    } catch {
      setError('Unable to load users. Please try again.')
      setUsers([])
      setTotalPages(0)
      setTotalUsers(0)
    } finally {
      setIsLoading(false)
    }
  }, [page, activeFilters, refreshKey]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  // ---------------------------------------------------------------------------
  // Exposed actions
  // ---------------------------------------------------------------------------

  /** Apply new search filters and reset to the first page. */
  const applyFilters = useCallback((filters: FilterValues) => {
    setPage(0)
    setActiveFilters(filters)
  }, [])

  /** Clear all filters and return to page 1. */
  const resetFilters = useCallback(() => {
    setPage(0)
    setActiveFilters(DEFAULT_FILTERS)
  }, [])

  /**
   * Force a re-fetch without changing page or filters.
   * Call this after any mutation (user created, role updated, etc.).
   */
  const refresh = useCallback(() => {
    setRefreshKey((k) => k + 1)
  }, [])

  const goToPrevPage = useCallback(() => {
    setPage((prev) => Math.max(prev - 1, 0))
  }, [])

  const goToNextPage = useCallback(() => {
    setPage((prev) => (prev + 1 < totalPages ? prev + 1 : prev))
  }, [totalPages])

  // ---------------------------------------------------------------------------
  // Derived values
  // ---------------------------------------------------------------------------

  const totalUsersLabel = useMemo(
    () => new Intl.NumberFormat().format(totalUsers),
    [totalUsers],
  )

  const hasPages = totalPages > 0
  const currentPage = hasPages ? page + 1 : 0
  const isPrevDisabled = page <= 0 || !hasPages
  const isNextDisabled = !hasPages || page + 1 >= totalPages

  return {
    // Data
    users,
    totalUsers,
    totalUsersLabel,
    // Pagination
    currentPage,
    totalPages,
    hasPages,
    isPrevDisabled,
    isNextDisabled,
    // Status
    isLoading,
    error,
    // Actions
    applyFilters,
    resetFilters,
    refresh,
    goToPrevPage,
    goToNextPage,
  }
}
