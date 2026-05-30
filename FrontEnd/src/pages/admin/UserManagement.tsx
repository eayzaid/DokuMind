import { useUsers } from './UserManagement/hooks/useUsers'
import UserManagementHeader from './UserManagement/components/UserManagementHeader'
import CreateUserDialog from './UserManagement/components/CreateUserDialog'
import UserFilterBar from './UserManagement/components/UserFilterBar'
import UserTable from './UserManagement/components/UserTable'
import UserPagination from './UserManagement/components/UserPagination'

/**
 * Admin — User Management page.
 *
 * Thin orchestrator: wires the data hook to the UI sub-components.
 * All business logic lives in `useUsers`, validation in `CreateUserDialog`,
 * and static config in the sibling `UserManagement/` directory.
 */
function UserManagement() {
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
        <CreateUserDialog onSuccess={refresh} />
      </UserManagementHeader>

      <section className="rounded-xl border bg-card shadow-card">
        <UserFilterBar onApply={applyFilters} onReset={resetFilters} />
        <UserTable users={users} isLoading={isLoading} error={error} />
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

export default UserManagement
