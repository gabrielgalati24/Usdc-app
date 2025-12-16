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
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    'fixed left-0 top-0 h-full w-64 bg-neutral-900 border-r border-neutral-800 flex flex-col z-50 transition-transform duration-300',
                    'lg:translate-x-0',
                    isOpen ? 'translate-x-0' : '-translate-x-full'
                )}
            >
                {/* Logo */}
                <div className="p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                                <Sparkles className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-xl font-bold text-white">UsdcApp</span>
                        </div>
                        {/* Close button - only visible on mobile */}
                        <button
                            onClick={onClose}
                            className="lg:hidden p-2 hover:bg-neutral-800 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5 text-neutral-400" />
                        </button>
                    </div>
                </div>

                {/* Main Navigation */}
                <nav className="flex-1 px-3 space-y-1">
                    {navigation.map((item) => {
                        const isActive = location.pathname === item.href
                        return (
                            <Link
                                key={item.name}
                                to={item.href}
                                onClick={onClose}
                                className={cn(
                                    'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200',
                                    isActive
                                        ? 'bg-orange-500 text-white'
                                        : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                                )}
                            >
                                <item.icon className="w-5 h-5" />
                                {item.name}
                            </Link>
                        )
                    })}

                    {/* Separator */}
                    <div className="pt-4 pb-2">
                        <div className="text-xs font-medium text-neutral-500 uppercase tracking-wider px-4">
                            Otros
                        </div>
                    </div>

                    {secondary.map((item) => {
                        const isActive = location.pathname === item.href
                        return (
                            <Link
                                key={item.name}
                                to={item.href}
                                onClick={onClose}
                                className={cn(
                                    'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200',
                                    isActive
                                        ? 'bg-orange-500 text-white'
                                        : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                                )}
                            >
                                <item.icon className="w-5 h-5" />
                                {item.name}
                            </Link>
                        )
                    })}
                </nav>

                {/* Footer */}
                <div className="p-4 border-t border-neutral-800">
                    <p className="text-xs text-neutral-500 text-center">
                        v1.0.0 • Polygon Network
                    </p>
                </div>
            </aside>
        </>
    )
}
