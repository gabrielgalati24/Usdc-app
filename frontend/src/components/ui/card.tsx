import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface CardProps {
  children: ReactNode
  className?: string
  gradient?: boolean
  hover?: boolean
}

export function Card({ children, className, gradient, hover }: CardProps) {
  return (
    <div
      className={cn(
        'bg-neutral-900 border border-neutral-800 rounded-2xl p-5',
        gradient && 'gradient-card',
        hover && 'hover:border-neutral-700 transition-colors duration-200',
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
    <h3 className={cn('text-base font-medium text-neutral-300', className)}>
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
