import { Toaster as Sonner, type ToasterProps } from 'sonner'
import {
  CircleCheckIcon,
  InfoIcon,
  TriangleAlertIcon,
  OctagonXIcon,
  Loader2Icon,
} from 'lucide-react'

/**
 * Project-styled wrapper around Sonner's Toaster.
 *
 * Reads the current theme from the <html> element's class list so it
 * stays consistent with the app's own theme toggle — no next-themes needed.
 *
 * Place ONE instance of <Toaster /> at the root of your app (App.tsx).
 * Trigger toasts anywhere with `import { toast } from 'sonner'`.
 */
function Toaster({ ...props }: ToasterProps) {
  // Derive theme from the <html> class set by the app's theme toggle
  const isDark =
    typeof document !== 'undefined' &&
    document.documentElement.classList.contains('dark')
  const theme: ToasterProps['theme'] = isDark ? 'dark' : 'light'

  return (
    <Sonner
      theme={theme}
      className="toaster group"
      position="bottom-right"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={
        {
          '--normal-bg': 'var(--popover)',
          '--normal-text': 'var(--popover-foreground)',
          '--normal-border': 'var(--border)',
          '--border-radius': 'var(--radius)',
          '--success-bg': 'var(--popover)',
          '--success-text': 'var(--popover-foreground)',
          '--success-border': 'var(--border)',
          '--error-bg': 'var(--popover)',
          '--error-text': 'var(--popover-foreground)',
          '--error-border': 'var(--border)',
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
