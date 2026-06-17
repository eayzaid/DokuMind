import { Button } from '@/components/ui/button'

interface UserPaginationProps {
  currentPage: number
  totalPages: number
  hasPages: boolean
  isPrevDisabled: boolean
  isNextDisabled: boolean
  onPrev: () => void
  onNext: () => void
}

/**
 * Pagination footer — page indicator and Prev/Next controls.
 */
function UserPagination({
  currentPage,
  totalPages,
  hasPages,
  isPrevDisabled,
  isNextDisabled,
  onPrev,
  onNext,
}: UserPaginationProps) {
  return (
    <div className="flex flex-col gap-3 border-t border-border/60 bg-muted/20 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs text-muted-foreground">
        Page {currentPage} of {hasPages ? totalPages : 0}
      </p>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={onPrev}
          disabled={isPrevDisabled}
        >
          Previous
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={onNext}
          disabled={isNextDisabled}
        >
          Next
        </Button>
      </div>
    </div>
  )
}

export default UserPagination
