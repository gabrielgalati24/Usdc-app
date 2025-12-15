import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive'
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
                'bg-orange-500 text-white hover:bg-orange-600 active:bg-orange-700',
            secondary:
                'bg-neutral-800 text-white hover:bg-neutral-700 active:bg-neutral-600',
            outline:
                'border border-neutral-700 bg-transparent text-white hover:bg-neutral-800',
            ghost: 'bg-transparent text-white hover:bg-neutral-800',
            destructive: 'bg-red-500 text-white hover:bg-red-600',
        }

        const sizes = {
            sm: 'h-8 px-3 text-sm rounded-lg',
            md: 'h-10 px-4 text-sm rounded-xl',
            lg: 'h-12 px-6 text-base rounded-xl',
            icon: 'h-10 w-10 rounded-xl',
        }

        return (
            <button
                ref={ref}
                disabled={disabled || isLoading}
                className={cn(
                    'inline-flex items-center justify-center gap-2 font-medium transition-all duration-200',
                    'focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:ring-offset-2 focus:ring-offset-neutral-900',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                    variants[variant],
                    sizes[size],
                    className
                )}
                {...props}
            >
                {isLoading && (
                    <svg
                        className="animate-spin h-4 w-4"
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
