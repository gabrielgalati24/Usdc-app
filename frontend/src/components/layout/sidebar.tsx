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

export function Sidebar() {
    const location = useLocation()

    return (
        <aside className="fixed left-0 top-0 h-full w-64 bg-neutral-900 border-r border-neutral-800 flex flex-col z-50">
            {/* Logo */}
            <div className="p-6">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-xl font-bold text-white">UsdcApp</span>
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
    )
}
