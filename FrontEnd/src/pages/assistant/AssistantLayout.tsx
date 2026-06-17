import { useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
} from '@/components/ui/sidebar'
import { BrandLogo } from '@/components/BrandLogo'
import { FileText, LogOut, ShieldCheck, MessageSquare } from 'lucide-react'
import { apiClient } from '@/services/apiClient'

/**
 * Navigation items available to Assistant users.
 */
const navigationItems = [
  {
    title: 'Chat Assistant',
    icon: MessageSquare,
    to: '/assistant/chat',
  },
  {
    title: 'Document management',
    icon: FileText,
    to: '/assistant/documents',
  },
]

const headerCopy: Record<string, { title: string; subtitle: string }> = {
  chat: {
    title: 'Assistant Workspace',
    subtitle: 'Ask questions about your indexed documents',
  },
  documents: {
    title: 'Document management',
    subtitle: 'Knowledge files and ingestion controls',
  },
}

function getHeaderForPath(pathname: string) {
  if (pathname.startsWith('/assistant/documents')) return headerCopy.documents
  return headerCopy.chat
}

function AssistantLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const header = getHeaderForPath(location.pathname)
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
    <SidebarProvider className="min-h-svh bg-background text-foreground">
      <Sidebar
        variant="sidebar"
        collapsible="none"
        className="sticky top-0 h-svh shrink-0 border-r border-sidebar-border/80"
      >
        <SidebarHeader className="px-5 pb-4 pt-5">
          <BrandLogo
            size="sm"
            label="DokuMind"
            subtitle="Assistant workspace"
            className="text-sidebar-foreground"
            labelClassName="text-sm text-sidebar-foreground"
            subtitleClassName="text-xs text-sidebar-foreground/70"
          />
        </SidebarHeader>

        <SidebarSeparator />

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navigationItems.map((item) => {
                  const isActive = location.pathname.startsWith(item.to)
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        tooltip={item.title}
                      >
                        <Link to={item.to}>
                          <item.icon />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="px-5 pb-5">
          <div className="flex items-center gap-2 rounded-full border border-sidebar-border/80 bg-sidebar-accent px-3 py-2 text-xs text-sidebar-accent-foreground">
            <ShieldCheck />
            <span>Role: Assistant</span>
          </div>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={handleLogout}
                disabled={isLoggingOut}
                tooltip="Log out"
                className="text-sidebar-foreground/70 hover:text-sidebar-foreground"
              >
                <LogOut />
                <span>{isLoggingOut ? 'Logging out…' : 'Log out'}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="min-h-svh bg-background/60">
        <header className="sticky top-0 z-10 flex h-20 items-center justify-between border-b border-border/70 bg-background/85 px-8 backdrop-blur">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold uppercase tracking-[0.26em] text-muted-foreground">
              {location.pathname.split('/')[1] || 'workspace'}
            </span>
            <span className="text-lg font-semibold tracking-tight">
              {header.title}
            </span>
            <span className="text-sm text-muted-foreground">
              {header.subtitle}
            </span>
          </div>
        </header>
        <div className="mx-auto flex h-[calc(100svh-5rem)] w-full max-w-7xl flex-1 flex-col px-8 py-8">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

export default AssistantLayout
