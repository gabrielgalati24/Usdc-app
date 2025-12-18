import { useAuthStore } from '@/stores'
import { Button } from '@/components/ui'
import { LogOut, User, Bell, Menu, Wallet } from 'lucide-react'
import { shortenAddress } from '@/lib/utils'

interface HeaderProps {
    onMenuClick: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
    const { user, logout } = useAuthStore()

    return (
        <header className="h-16 glass-subtle border-b border-white/5 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30">
            {/* Left - Menu & Welcome */}
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

                <div>
                    <h1 className="text-lg sm:text-xl font-semibold text-white">
                        Hola, <span className="text-gradient">{user?.email?.split('@')[0] || 'Usuario'}</span>
                    </h1>
                    <p className="text-xs text-neutral-500 hidden sm:block">Bienvenido a tu dashboard</p>
                </div>
            </div>

            {/* Right - Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
                {/* Wallet Address */}
                {user?.walletAddress && (
                    <div className="hidden sm:flex items-center gap-2.5 px-3.5 py-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all cursor-pointer group">
                        <div className="relative">
                            <Wallet className="w-4 h-4 text-orange-400" />
                            <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-green-500 border border-neutral-900" />
                        </div>
                        <span className="text-sm text-neutral-300 font-mono group-hover:text-white transition-colors">
                            {shortenAddress(user.walletAddress)}
                        </span>
                    </div>
                )}

                {/* Notifications */}
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                </Button>

                {/* Profile */}
                <Button variant="ghost" size="icon">
                    <User className="w-5 h-5" />
                </Button>

                {/* Logout */}
                <Button variant="ghost" size="icon" onClick={logout} className="text-neutral-400 hover:text-red-400">
                    <LogOut className="w-5 h-5" />
                </Button>
            </div>
        </header>
    )
}
