import { useAuthStore } from '@/stores'
import { Button } from '@/components/ui'
import { LogOut, User, Bell, Menu } from 'lucide-react'
import { shortenAddress } from '@/lib/utils'

interface HeaderProps {
    onMenuClick: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
    const { user, logout } = useAuthStore()

    return (
        <header className="h-16 border-b border-neutral-800 flex items-center justify-between px-4 sm:px-6">
            {/* Left - Menu \u0026 Welcome */}
            <div className="flex items-center gap-3">
                {/* Hamburger Menu - only visible on mobile */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="lg:hidden"
                    onClick={onMenuClick}
                >
                    <Menu className="w-5 h-5" />
                </Button>

                <h1 className="text-lg sm:text-xl font-semibold text-white">
                    Hola, {user?.email?.split('@')[0] || 'Usuario'}
                </h1>
            </div>

            {/* Right - Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
                {/* Wallet Address */}
                {user?.walletAddress && (
                    <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-neutral-800 rounded-lg">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-sm text-neutral-300 font-mono">
                            {shortenAddress(user.walletAddress)}
                        </span>
                    </div>
                )}

                {/* Notifications */}
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full" />
                </Button>

                {/* Profile */}
                <Button variant="ghost" size="icon">
                    <User className="w-5 h-5" />
                </Button>

                {/* Logout */}
                <Button variant="ghost" size="icon" onClick={logout}>
                    <LogOut className="w-5 h-5" />
                </Button>
            </div>
        </header>
    )
}
