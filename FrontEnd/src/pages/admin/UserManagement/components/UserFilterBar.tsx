import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DEFAULT_FILTERS, ROLE_FILTER_OPTIONS } from '../constants'
import type { FilterValues } from '../types'

interface UserFilterBarProps {
  /** Called when the user submits the filter form. Receives the current field values. */
  onApply: (filters: FilterValues) => void
  /** Called when the user clicks Reset. Clears local state and notifies the parent. */
  onReset: () => void
}

/**
 * Search/filter form for the user table.
 *
 * Owns its own local draft state so typing doesn't immediately re-fetch.
 * The parent's active filters are only updated on Apply or Reset.
 */
function UserFilterBar({ onApply, onReset }: UserFilterBarProps) {
  const [localFilters, setLocalFilters] = useState<FilterValues>(DEFAULT_FILTERS)

  const handleChange = (key: keyof FilterValues, value: string) => {
    setLocalFilters((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onApply(localFilters)
  }

  const handleReset = () => {
    setLocalFilters(DEFAULT_FILTERS)
    onReset()
  }

  return (
    <div className="border-b border-border px-6 py-4">
      <form
        className="grid gap-3 md:grid-cols-[repeat(3,minmax(0,1fr))_auto]"
        onSubmit={handleSubmit}
      >
        <Input
          name="firstName"
          placeholder="First name"
          value={localFilters.firstName}
          onChange={(e) => handleChange('firstName', e.target.value)}
        />
        <Input
          name="lastName"
          placeholder="Last name"
          value={localFilters.lastName}
          onChange={(e) => handleChange('lastName', e.target.value)}
        />
        <Select
          name="role"
          value={localFilters.role || 'all'}
          onValueChange={(val) =>
            handleChange('role', (val === 'all' ? '' : val) as FilterValues['role'])
          }
        >
          <SelectTrigger className="h-8">
            <SelectValue placeholder="All roles" />
          </SelectTrigger>
          <SelectContent position="popper">
            {ROLE_FILTER_OPTIONS.map((option) => (
              <SelectItem key={option.value || 'all'} value={option.value || 'all'}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex items-center gap-2">
          <Button type="submit" size="sm">
            Apply
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={handleReset}>
            Reset
          </Button>
        </div>
      </form>
    </div>
  )
}

export default UserFilterBar
