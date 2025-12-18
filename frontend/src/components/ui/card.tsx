import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface CardProps {
  children: ReactNode
  className?: string
  gradient?: boolean
  hover?: boolean
  glow?: boolean
  interactive?: boolean
}

export function Card({ children, className, gradient, hover, glow, interactive }: CardProps) {
  return (
    <div
      className={cn(
        'relative bg-neutral-900/80 border border-white/[0.06] rounded-2xl p-5 backdrop-blur-sm transition-all duration-300',
        gradient && 'gradient-card',
        hover && 'hover:border-white/10',
        glow && 'glow-subtle',
        interactive && 'card-interactive cursor-pointer',
        className
      )}
    >
      {children}
    </div>
  )
}

interface CardHeaderProps {
  children: ReactNode
  className?: string
}

export function CardHeader({ children, className }: CardHeaderProps) {
  return (
    <div className={cn('mb-4', className)}>
      {children}
    </div>
  )
}

interface CardTitleProps {
  children: ReactNode
  className?: string
}

export function CardTitle({ children, className }: CardTitleProps) {
  return (
    <h3 className={cn('text-base font-semibold text-neutral-200', className)}>
      {children}
    </h3>
  )
}

interface CardContentProps {
  children: ReactNode
  className?: string
}

export function CardContent({ children, className }: CardContentProps) {
  return <div className={cn('', className)}>{children}</div>
}
