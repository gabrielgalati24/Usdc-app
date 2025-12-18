import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'glow'
    size?: 'sm' | 'md' | 'lg' | 'icon'
    isLoading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            className,
            variant = 'default',
            size = 'md',
            isLoading,
            disabled,
            children,
            ...props
        },
        ref
    ) => {
        const variants = {
            default:
                'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-400 hover:to-orange-500 active:from-orange-600 active:to-orange-700 shadow-lg shadow-orange-500/20',
            secondary:
                'bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-white/20 active:bg-white/5',
            outline:
                'border border-white/20 bg-transparent text-white hover:bg-white/5 hover:border-white/30',
            ghost: 'bg-transparent text-white hover:bg-white/10',
            destructive: 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-400 hover:to-red-500 shadow-lg shadow-red-500/20',
            glow: 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-400 hover:to-orange-500 shadow-lg shadow-orange-500/30 animate-glow-pulse',
        }

        const sizes = {
            sm: 'h-8 px-3 text-xs rounded-lg gap-1.5',
            md: 'h-10 px-4 text-sm rounded-xl gap-2',
            lg: 'h-12 px-6 text-base rounded-xl gap-2',
            icon: 'h-10 w-10 rounded-xl',
        }

        return (
            <button
                ref={ref}
                disabled={disabled || isLoading}
                className={cn(
                    'inline-flex items-center justify-center font-medium transition-all duration-200 relative overflow-hidden',
                    'focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900',
                    'disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none',
                    'active:scale-[0.98]',
                    variants[variant],
                    sizes[size],
                    className
                )}
                {...props}
            >
                {isLoading && (
                    <svg
                        className="animate-spin h-4 w-4 shrink-0"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        />
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                    </svg>
                )}
                {children}
            </button>
        )
    }
)

Button.displayName = 'Button'
