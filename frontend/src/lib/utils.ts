import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number | string, decimals = 2): string {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    }).format(num)
}

export function formatUSDC(amount: number | string): string {
    return `$${formatCurrency(amount)} USDC`
}

export function shortenAddress(address: string, chars = 4): string {
    if (!address) return ''
    return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`
}

export function formatDate(date: string | Date): string {
    const d = typeof date === 'string' ? new Date(date) : date
    return new Intl.DateTimeFormat('es-ES', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(d)
}

export function formatRelativeTime(date: string | Date): string {
    const d = typeof date === 'string' ? new Date(date) : date
    const now = new Date()
    const diff = now.getTime() - d.getTime()

    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Ahora'
    if (minutes < 60) return `Hace ${minutes}m`
    if (hours < 24) return `Hace ${hours}h`
    if (days < 7) return `Hace ${days}d`

    return formatDate(d)
}

export function getTransactionIcon(type: string) {
    switch (type) {
        case 'deposit':
            return { icon: 'Download', color: 'text-green-500' }
        case 'withdrawal':
            return { icon: 'Upload', color: 'text-red-500' }
        case 'transfer':
            return { icon: 'ArrowRightLeft', color: 'text-blue-500' }
        default:
            return { icon: 'Circle', color: 'text-gray-500' }
    }
}
