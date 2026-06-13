import { useUsers } from '../admin/UserManagement/hooks/useUsers'
import UserManagementHeader from '../admin/UserManagement/components/UserManagementHeader'
import CreateUserDialog from '../admin/UserManagement/components/CreateUserDialog'
import UserFilterBar from '../admin/UserManagement/components/UserFilterBar'
import UserTable from '../admin/UserManagement/components/UserTable'
import UserPagination from '../admin/UserManagement/components/UserPagination'

/**
 * Role options available when an RH user creates a new user.
 * RH cannot create other HR accounts — only assistants and workers.
 */
const RH_CREATE_ROLE_OPTIONS = [
  { value: 'ASSISTANT', label: 'Assistant' },
  { value: 'WORKER', label: 'Worker' },
]

/**
 * RH — User Management page.
 *
 * Identical to the admin version except `CreateUserDialog` is restricted
 * to only Assistant and Worker roles. All other behaviour (filtering,
 * pagination, row click → detail dialog, delete) is shared via the same
 * components and hook from the admin package.
 */
function RHUserManagement() {
  const {
    users,
    totalUsersLabel,
    currentPage,
    totalPages,
    hasPages,
    isLoading,
    error,
    isPrevDisabled,
    isNextDisabled,
    applyFilters,
    resetFilters,
    refresh,
    goToPrevPage,
    goToNextPage,
  } = useUsers()

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <UserManagementHeader totalUsersLabel={totalUsersLabel}>
        <CreateUserDialog
          onSuccess={refresh}
          roleOptions={RH_CREATE_ROLE_OPTIONS}
        />
      </UserManagementHeader>

      <section className="rounded-xl border bg-card shadow-card">
        <UserFilterBar onApply={applyFilters} onReset={resetFilters} />
        <UserTable
          users={users}
          isLoading={isLoading}
          error={error}
          onDelete={refresh}
          roleOptions={RH_CREATE_ROLE_OPTIONS}
        />
        <UserPagination
          currentPage={currentPage}
          totalPages={totalPages}
          hasPages={hasPages}
          isPrevDisabled={isPrevDisabled}
          isNextDisabled={isNextDisabled}
          onPrev={goToPrevPage}
          onNext={goToNextPage}
        />
      </section>
    </div>
  )
}

export default RHUserManagement
