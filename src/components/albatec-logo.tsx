"use client"

import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"

const LOGO_FULL = "/brand/logo-alba-tec-sem-fundo.png"
const LOGO_ICON = "/brand/logo-icon.png"

export type AlbaTecLogoVariant = "horizontal" | "full" | "icon" | "wordmark"

interface AlbaTecLogoProps {
  variant?: AlbaTecLogoVariant
  /** Altura em pixels (largura proporcional) */
  height?: number
  className?: string
  href?: string
  priority?: boolean
  /** Mantido por compatibilidade — a logo PNG já inclui as cores oficiais */
  inverted?: boolean
}

export function AlbaTecLogo({
  variant = "horizontal",
  height = 32,
  className,
  href,
  priority = false,
}: AlbaTecLogoProps) {
  const iconSize = Math.round(height)

  const content = (() => {
    if (variant === "icon") {
      return (
        <Image
          src={LOGO_ICON}
          alt="Alba Tec"
          width={iconSize}
          height={iconSize}
          className={cn("object-contain", className)}
          style={{ width: iconSize, height: iconSize }}
          priority={priority}
        />
      )
    }

    // full, horizontal e wordmark usam a logo oficial com fundo transparente
    const logoHeight = variant === "full" ? height : Math.round(height * 1.15)

    return (
      <Image
        src={LOGO_FULL}
        alt="Alba Tec"
        width={Math.round(logoHeight * 1.35)}
        height={logoHeight}
        className={cn("h-auto w-auto object-contain", className)}
        style={{ height: logoHeight, width: "auto" }}
        priority={priority}
      />
    )
  })()

  if (href) {
    return (
      <Link href={href} className="inline-flex items-center cursor-pointer">
        {content}
      </Link>
    )
  }

  return content
}

/** @deprecated Use AlbaTecLogo com variant="icon" */
export function Logo({ size = 24, className }: { size?: number; className?: string }) {
  return <AlbaTecLogo variant="icon" height={size} className={className} />
}
