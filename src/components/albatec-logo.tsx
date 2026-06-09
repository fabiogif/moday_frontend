"use client"

import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"

const LOGO_FULL = "/brand/logo-alba-tec-sem-fundo.png"
const LOGO_SYMBOL = "/brand/logo-simbolo.png"

export type AlbaTecLogoVariant = "horizontal" | "full" | "icon" | "wordmark"

interface AlbaTecLogoProps {
  variant?: AlbaTecLogoVariant
  /** Altura em pixels (largura proporcional) */
  height?: number
  /** Largura fixa para variant icon (quadrado) */
  width?: number
  className?: string
  href?: string
  priority?: boolean
  withBackground?: boolean
  /** @deprecated use withBackground */
  inverted?: boolean
}

export function AlbaTecLogo({
  variant = "horizontal",
  height = 32,
  width,
  className,
  href,
  priority = false,
  withBackground = false,
  inverted = false,
}: AlbaTecLogoProps) {
  const useBackground = withBackground || inverted
  const iconSize = Math.round(width ?? height)

  const image = (() => {
    if (variant === "icon") {
      return (
        <Image
          src={LOGO_SYMBOL}
          alt="Alba Tec"
          width={iconSize}
          height={iconSize}
          className={cn("shrink-0 object-contain", className)}
          style={{
            width: iconSize,
            height: iconSize,
            minWidth: iconSize,
            minHeight: iconSize,
          }}
          priority={priority}
        />
      )
    }

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

  const content = useBackground ? (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-2xl bg-white shadow-md border border-white/80",
        variant === "icon" ? "p-2" : "px-4 py-3"
      )}
    >
      {image}
    </span>
  ) : (
    image
  )

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
