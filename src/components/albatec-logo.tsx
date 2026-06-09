"use client"

import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"

const LOGO_LIGHT = "/brand/logo-alba-tec-sem-fundo.png"
const LOGO_DARK = "/brand/logo-alba-escuro.png"
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
  /** Caixa branca atrás da logo (fundos coloridos/fotos) */
  withBackground?: boolean
  /** Logo para fundo escuro (wordmark com "Alba" branco) */
  onDark?: boolean
  /** Alterna automaticamente entre claro/escuro conforme o tema */
  adaptive?: boolean
  /** @deprecated use onDark */
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
  onDark = false,
  adaptive = false,
  inverted = false,
}: AlbaTecLogoProps) {
  const useDarkLogo = onDark || inverted
  const iconSize = Math.round(width ?? height)

  const renderWordmark = (src: string, visibilityClass?: string) => {
    const logoHeight = variant === "full" ? height : Math.round(height * 1.15)

    return (
      <Image
        src={src}
        alt="Alba Tec"
        width={Math.round(logoHeight * 1.35)}
        height={logoHeight}
        className={cn("h-auto w-auto object-contain", visibilityClass, className)}
        style={{ height: logoHeight, width: "auto" }}
        priority={priority}
      />
    )
  }

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

    if (withBackground) {
      return renderWordmark(LOGO_LIGHT)
    }

    if (adaptive) {
      return (
        <>
          {renderWordmark(LOGO_LIGHT, "dark:hidden")}
          {renderWordmark(LOGO_DARK, "hidden dark:block")}
        </>
      )
    }

    return renderWordmark(useDarkLogo ? LOGO_DARK : LOGO_LIGHT)
  })()

  const content = withBackground ? (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-2xl border border-white/80 bg-white shadow-md",
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
      <Link href={href} className="inline-flex cursor-pointer items-center">
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
