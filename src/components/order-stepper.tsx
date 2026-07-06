"use client"

import { cn } from "@/lib/utils"
import { Check, type LucideIcon } from "lucide-react"

interface Step {
  label: string
  icon: LucideIcon
}

interface OrderStepperProps {
  currentStep: number
  steps: Step[]
  onStepClick?: (step: number) => void
  completedSteps?: Set<number>
}

export function OrderStepper({ currentStep, steps, onStepClick, completedSteps = new Set() }: OrderStepperProps) {
  return (
    <div className="flex items-center justify-between w-full">
      {steps.map((step, index) => {
        const isCompleted = completedSteps.has(index)
        const isCurrent = index === currentStep
        const isClickable = onStepClick && (isCompleted || index <= currentStep)
        const Icon = step.icon

        return (
          <div key={index} className="flex items-center flex-1 last:flex-none">
            <button
              type="button"
              onClick={() => isClickable && onStepClick?.(index)}
              disabled={!isClickable}
              className={cn(
                "flex items-center gap-2 shrink-0 transition-colors",
                isClickable && "cursor-pointer",
                !isClickable && "cursor-default"
              )}
            >
              <div
                className={cn(
                  "flex items-center justify-center rounded-full w-9 h-9 sm:w-10 sm:h-10 text-sm font-medium transition-colors shrink-0",
                  isCurrent && "bg-primary text-primary-foreground",
                  isCompleted && !isCurrent && "bg-green-600 text-white",
                  !isCurrent && !isCompleted && "bg-muted text-muted-foreground"
                )}
              >
                {isCompleted && !isCurrent ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Icon className="h-4 w-4" />
                )}
              </div>
              <span
                className={cn(
                  "hidden sm:block text-xs sm:text-sm font-medium whitespace-nowrap",
                  isCurrent && "text-foreground",
                  !isCurrent && "text-muted-foreground"
                )}
              >
                {step.label}
              </span>
            </button>

            {index < steps.length - 1 && (
              <div
                className={cn(
                  "h-0.5 mx-2 sm:mx-3 flex-1 rounded-full transition-colors",
                  isCompleted ? "bg-green-600" : "bg-muted"
                )}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
