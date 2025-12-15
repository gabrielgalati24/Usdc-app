import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string
    error?: string
    leftIcon?: React.ReactNode
    rightIcon?: React.ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className, label, error, leftIcon, rightIcon, ...props }, ref) => {
        return (
            <div className="w-full">
                {label && (
                    <label className="block text-sm font-medium text-neutral-300 mb-2">
                        {label}
                    </label>
                )}
                <div className="relative flex items-center">
                    {leftIcon && (
                        <div className="absolute left-3 text-neutral-500 flex items-center justify-center">
                            {leftIcon}
                        </div>
                    )}
                    <input
                        ref={ref}
                        className={cn(
                            'w-full h-12 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500',
                            'focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500',
                            'transition-colors',
                            'disabled:opacity-50 disabled:cursor-not-allowed',
                            leftIcon ? 'pl-10 pr-4' : 'px-4',
                            rightIcon && 'pr-10',
                            error && 'border-red-500 focus:ring-red-500/50 focus:border-red-500',
                            className
                        )}
                        {...props}
                    />
                    {rightIcon && (
                        <div className="absolute right-3 text-neutral-500 flex items-center justify-center">
                            {rightIcon}
                        </div>
                    )}
                </div>
                {error && (
                    <p className="mt-1.5 text-sm text-red-500">{error}</p>
                )}
            </div>
        )
    }
)

Input.displayName = 'Input'
