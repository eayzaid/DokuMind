import { useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BrandLogo } from '@/components/BrandLogo'
import { apiClient } from '@/services/apiClient'

function WorkerLayout() {
  const navigate = useNavigate()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await apiClient.post('/auth/logout')
    } finally {
      navigate('/auth/login')
    }
  }

  return (
    <div className="min-h-svh bg-background text-foreground flex flex-col">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6">
        <BrandLogo
          size="sm"
          label="DokuMind"
          subtitle="Worker workspace"
          labelClassName="text-sm"
          subtitleClassName="text-xs"
        />

        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="text-muted-foreground hover:text-foreground"
          >
            <LogOut className="mr-2 size-4" />
            {isLoggingOut ? 'Logging out...' : 'Log out'}
          </Button>
        </div>
      </header>

      {/* Main Content Area (Centered Chat) */}
      <main className="flex-1 flex flex-col items-center p-4 sm:p-6 lg:p-8 h-[calc(100svh-4rem)]">
        <Outlet />
      </main>
    </div>
  )
}

export default WorkerLayout
