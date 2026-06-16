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
    <div className="flex min-h-svh flex-col bg-background/60 text-foreground">
      <header className="sticky top-0 z-50 flex h-20 items-center justify-between border-b border-border/70 bg-background/85 px-8 backdrop-blur supports-[backdrop-filter]:bg-background/70">
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

      <main className="mx-auto flex h-[calc(100svh-5rem)] w-full max-w-7xl flex-1 flex-col items-center px-8 py-8">
        <Outlet />
      </main>
    </div>
  )
}

export default WorkerLayout
