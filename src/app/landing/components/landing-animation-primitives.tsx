import { cn } from '@/lib/utils'

export function GlassCard({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-white/15 bg-white/10 backdrop-blur-xl shadow-2xl shadow-violet-950/40',
        className,
      )}
    >
      {children}
    </div>
  )
}

export function FlowStage({
  className,
  children,
  minHeight = 'min-h-[400px] sm:min-h-[460px]',
  ...props
}: {
  className?: string
  children: React.ReactNode
  minHeight?: string
} & React.ComponentPropsWithoutRef<'div'>) {
  return (
    <div className={cn('relative mx-auto w-full max-w-xl lg:max-w-none', className)} {...props}>
      <div className="hero-glow-drift absolute -inset-6 rounded-[2rem] bg-gradient-to-br from-violet-600/35 via-primary/25 to-fuchsia-600/15 blur-3xl" />
      <div className="hero-glow-drift absolute left-1/4 top-0 h-32 w-32 rounded-full bg-violet-500/25 blur-2xl [animation-delay:2s]" />

      <div
        className={cn(
          'relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-gradient-to-br from-[#101018] via-[#16102a] to-[#0c0816] p-5 sm:p-7',
          minHeight,
        )}
      >
        <div
          className="absolute inset-0 opacity-[0.18]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.4) 1px, transparent 0)',
            backgroundSize: '22px 22px',
          }}
        />
        <div className="relative h-full">{children}</div>
      </div>
    </div>
  )
}
