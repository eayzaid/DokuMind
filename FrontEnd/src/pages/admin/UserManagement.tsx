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

      <section className="overflow-hidden rounded-2xl border border-border/60 bg-card/80 shadow-[0_20px_50px_rgba(70,53,53,0.10)] backdrop-blur">
        <UserFilterBar onApply={applyFilters} onReset={resetFilters} />
        <UserTable users={users} isLoading={isLoading} error={error} onDelete={refresh} />
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
