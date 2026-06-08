"use client"

import Image from 'next/image'
import { cn } from '@/lib/utils'

interface LandingScreenshotProps {
  src: string
  alt: string
  className?: string
  priority?: boolean
  glowClassName?: string
}

export function LandingScreenshot({
  src,
  alt,
  className,
  priority = false,
  glowClassName = 'from-primary/20 to-purple-500/20',
}: LandingScreenshotProps) {
  return (
    <div className={cn('relative', className)}>
      <div
        className={cn(
          'absolute inset-0 bg-gradient-to-r rounded-3xl blur-3xl -z-10',
          glowClassName
        )}
      />
      <div className="rounded-2xl border border-border/60 overflow-hidden shadow-lg">
        <Image
          src={src}
          alt={alt}
          width={1200}
          height={900}
          priority={priority}
          loading={priority ? undefined : 'lazy'}
          className="w-full h-auto block"
        />
      </div>
    </div>
  )
}
