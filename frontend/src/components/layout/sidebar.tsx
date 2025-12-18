import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import {
    Home,
    Activity,
    Download,
    Send,
    Upload,
    Sparkles,
    HelpCircle,
    User,
    TrendingUp,
    X,
} from 'lucide-react'

const navigation = [
    { name: 'Inicio', href: '/dashboard', icon: Home },
    { name: 'Actividad', href: '/activity', icon: Activity },
    { name: 'Recargar', href: '/deposit', icon: Download },
    { name: 'Enviar', href: '/transfer', icon: Send },
    { name: 'Retirar', href: '/withdraw', icon: Upload },
]

const secondary = [
    { name: 'Mercados', href: '/markets', icon: TrendingUp },
    { name: 'Agentes IA', href: '/agents', icon: Sparkles },
    { name: 'Mi Perfil', href: '/profile', icon: User },
    { name: 'Soporte', href: '/support', icon: HelpCircle },
]

interface SidebarProps {
    isOpen: boolean
    onClose: () => void
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
    const location = useLocation()

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden animate-fade-in"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    'fixed left-0 top-0 h-full w-72 glass-card flex flex-col z-50 transition-all duration-300 ease-out',
                    'lg:translate-x-0',
                    isOpen ? 'translate-x-0' : '-translate-x-full'
                )}
            >
                {/* Gradient accent line */}
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-orange-500 via-orange-400 to-cyan-500" />

                {/* Logo */}
                <div className="p-6 pb-4">
                    <div className="flex items-center justify-between">
                        <Link to="/dashboard" className="flex items-center gap-3 group">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg glow-orange group-hover:scale-105 transition-transform">
                                <Sparkles className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <span className="text-xl font-bold text-white">UsdcApp</span>
                                <p className="text-[10px] text-neutral-500 font-medium tracking-wider">POLYGON NETWORK</p>
                            </div>
                        </Link>
                        {/* Close button - only visible on mobile */}
                        <button
                            onClick={onClose}
                            className="lg:hidden p-2 hover:bg-white/5 rounded-xl transition-colors"
                        >
                            <X className="w-5 h-5 text-neutral-400" />
                        </button>
                    </div>
                </div>

                {/* Main Navigation */}
                <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
                    <p className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider px-3 mb-3">
                        Principal
                    </p>
                    {navigation.map((item) => {
                        const isActive = location.pathname === item.href
                        return (
                            <Link
                                key={item.name}
                                to={item.href}
                                onClick={onClose}
                                className={cn(
                                    'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group relative',
                                    isActive
                                        ? 'bg-gradient-to-r from-orange-500/20 to-orange-500/10 text-white'
                                        : 'text-neutral-400 hover:text-white hover:bg-white/5'
                                )}
                            >
                                {/* Active indicator */}
                                {isActive && (
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-gradient-to-b from-orange-400 to-orange-600 rounded-r-full" />
                                )}
                                <div className={cn(
                                    'w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200',
                                    isActive
                                        ? 'bg-orange-500/20'
                                        : 'bg-white/5 group-hover:bg-white/10'
                                )}>
                                    <item.icon className={cn(
                                        'w-5 h-5 transition-colors',
                                        isActive ? 'text-orange-400' : 'text-neutral-400 group-hover:text-white'
                                    )} />
                                </div>
                                <span>{item.name}</span>
                            </Link>
                        )
                    })}

                    {/* Separator */}
                    <div className="pt-6 pb-3">
                        <p className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider px-3">
                            Otros
                        </p>
                    </div>

                    {secondary.map((item) => {
                        const isActive = location.pathname === item.href
                        return (
                            <Link
                                key={item.name}
                                to={item.href}
                                onClick={onClose}
                                className={cn(
                                    'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group relative',
                                    isActive
                                        ? 'bg-gradient-to-r from-orange-500/20 to-orange-500/10 text-white'
                                        : 'text-neutral-400 hover:text-white hover:bg-white/5'
                                )}
                            >
                                {isActive && (
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-gradient-to-b from-orange-400 to-orange-600 rounded-r-full" />
                                )}
                                <div className={cn(
                                    'w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200',
                                    isActive
                                        ? 'bg-orange-500/20'
                                        : 'bg-white/5 group-hover:bg-white/10'
                                )}>
                                    <item.icon className={cn(
                                        'w-5 h-5 transition-colors',
                                        isActive ? 'text-orange-400' : 'text-neutral-400 group-hover:text-white'
                                    )} />
                                </div>
                                <span>{item.name}</span>
                            </Link>
                        )
                    })}
                </nav>

                {/* Footer */}
                <div className="p-4 border-t border-white/5">
                    <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-white/[0.02]">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <div className="flex-1">
                            <p className="text-xs text-neutral-400">Conectado</p>
                            <p className="text-[10px] text-neutral-600">Polygon Mainnet</p>
                        </div>
                        <span className="text-[10px] text-neutral-500 font-mono">v1.0.0</span>
                    </div>
                </div>
            </aside>
        </>
    )
}
