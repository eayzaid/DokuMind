import { cn } from '@/lib/utils'

const LOGO_SRC = '/brand/final_cut_documind.png'

const sizeClasses = {
  sm: 'size-9 rounded-xl p-1.5',
  md: 'size-11 rounded-2xl p-1.5',
  lg: 'size-14 rounded-2xl p-2',
  xl: 'size-16 rounded-2xl p-2.5',
} as const

type BrandLogoSize = keyof typeof sizeClasses

interface BrandLogoProps {
  size?: BrandLogoSize
  showWordmark?: boolean
  label?: string
  subtitle?: string
  className?: string
  logoClassName?: string
  labelClassName?: string
  subtitleClassName?: string
}

export function BrandLogo({
  size = 'md',
  showWordmark = true,
  label = 'DokuMind',
  subtitle,
  className,
  logoClassName,
  labelClassName,
  subtitleClassName,
}: BrandLogoProps) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div
        className={cn(
          'flex shrink-0 items-center justify-center overflow-hidden border border-border/70 bg-white/95 shadow-sm ring-1 ring-black/5',
          sizeClasses[size],
        )}
      >
        <img
          src={LOGO_SRC}
          alt="DokuMind logo"
          className={cn('h-full w-full object-contain', logoClassName)}
          draggable={false}
        />
      </div>
      {showWordmark ? (
        <div className="flex min-w-0 flex-col leading-tight">
          <span
            className={cn(
              'truncate font-semibold tracking-wide text-foreground',
              labelClassName,
            )}
          >
            {label}
          </span>
          {subtitle ? (
            <span
              className={cn(
                'truncate text-xs text-muted-foreground',
                subtitleClassName,
              )}
            >
              {subtitle}
            </span>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

