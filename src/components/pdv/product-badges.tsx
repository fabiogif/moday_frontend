import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export type BadgeType = 
  | "vegetarian" 
  | "vegan" 
  | "gluten-free" 
  | "spicy" 
  | "healthy" 
  | "new" 
  | "popular"
  | "combo"
  | "promotion"

interface ProductBadgesProps {
  badges?: BadgeType[]
  className?: string
}

const badgeConfig: Record<BadgeType, { icon: string; label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  vegetarian: { icon: "🥗", label: "Vegetariano", variant: "secondary" },
  vegan: { icon: "🌱", label: "Vegano", variant: "secondary" },
  "gluten-free": { icon: "🌾", label: "Sem Glúten", variant: "outline" },
  spicy: { icon: "🔥", label: "Picante", variant: "destructive" },
  healthy: { icon: "💚", label: "Saudável", variant: "secondary" },
  new: { icon: "⭐", label: "Novo", variant: "default" },
  popular: { icon: "🔥", label: "Mais Vendido", variant: "destructive" },
  combo: { icon: "🎁", label: "Combo", variant: "default" },
  promotion: { icon: "💰", label: "Promoção", variant: "default" },
}

export function ProductBadges({ badges, className }: ProductBadgesProps) {
  if (!badges || badges.length === 0) return null

  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {badges.map((badge) => {
        const config = badgeConfig[badge]
        if (!config) return null
        
        return (
          <Badge
            key={badge}
            variant={config.variant}
            className="text-xs px-2 py-0.5"
          >
            <span className="mr-1">{config.icon}</span>
            {config.label}
          </Badge>
        )
      })}
    </div>
  )
}

