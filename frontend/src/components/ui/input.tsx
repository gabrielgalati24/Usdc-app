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
                    <label className="block text-sm font-medium text-neutral-200 mb-2">
                        {label}
                    </label>
                )}
                <div className="relative flex items-center group">
                    {leftIcon && (
                        <div className="absolute left-3.5 text-neutral-500 flex items-center justify-center transition-colors group-focus-within:text-orange-400">
                            {leftIcon}
                        </div>
                    )}
                    <input
                        ref={ref}
                        className={cn(
                            'w-full h-12 bg-neutral-900/80 border border-white/10 rounded-xl text-white placeholder-neutral-500',
                            'focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500/50',
                            'hover:border-white/20 hover:bg-neutral-900',
                            'transition-all duration-200',
                            'disabled:opacity-50 disabled:cursor-not-allowed',
                            leftIcon ? 'pl-11 pr-4' : 'px-4',
                            rightIcon && 'pr-11',
                            error && 'border-red-500/50 focus:ring-red-500/30 focus:border-red-500/50',
                            className
                        )}
                        {...props}
                    />
                    {rightIcon && (
                        <div className="absolute right-3.5 text-neutral-500 flex items-center justify-center">
                            {rightIcon}
                        </div>
                    )}
                </div>
                {error && (
                    <p className="mt-2 text-sm text-red-400 flex items-center gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-red-400" />
                        {error}
                    </p>
                )}
            </div>
        )
    }
)

Input.displayName = 'Input'
