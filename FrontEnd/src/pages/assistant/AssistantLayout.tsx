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
        className="sticky top-0 h-svh shrink-0 border-r border-sidebar-border"
      >
        <SidebarHeader className="px-4 pb-3 pt-4">
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

        <SidebarFooter className="px-4 pb-4">
          <div className="flex items-center gap-2 rounded-full border border-sidebar-border bg-sidebar-accent px-3 py-2 text-xs text-sidebar-accent-foreground">
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

      <SidebarInset className="min-h-svh bg-background">
        <header className="flex min-h-16 items-center justify-between border-b px-6">
          <div className="flex flex-col">
            <span className="text-sm font-semibold">{header.title}</span>
            <span className="text-xs text-muted-foreground">
              {header.subtitle}
            </span>
          </div>
        </header>
        <div className="flex flex-1 flex-col px-6 py-6 h-[calc(100svh-4rem)]">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

export default AssistantLayout
