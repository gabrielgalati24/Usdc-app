import { useEffect, useState } from 'react'
import { useAuthStore } from '@/stores'
import { Card, Button, Input } from '@/components/ui'
import { User, Mail, Wallet, Calendar, Copy, CheckCircle, Shield } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export function ProfilePage() {
    const { user, fetchProfile, isLoading } = useAuthStore()
    const [copied, setCopied] = useState(false)

    useEffect(() => {
        fetchProfile()
    }, [fetchProfile])

    const copyAddress = () => {
        if (user?.walletAddress) {
            navigator.clipboard.writeText(user.walletAddress)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-96">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-orange-500 border-t-transparent" />
            </div>
        )
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                    <User className="w-8 h-8 text-white" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-white">Mi Perfil</h1>
                    <p className="text-neutral-400">Gestiona tu información personal</p>
                </div>
            </div>

            {/* Profile Info Card */}
            <Card>
                <h3 className="text-base font-medium text-white mb-6 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-orange-500" />
                    Información de la Cuenta
                </h3>

                <div className="space-y-5">
                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-neutral-300 mb-2">
                            <Mail className="w-4 h-4 inline mr-2" />
                            Email
                        </label>
                        <div className="p-3 bg-neutral-800 rounded-xl text-white">
                            {user?.email || 'Sin email'}
                        </div>
                    </div>

                    {/* User ID */}
                    <div>
                        <label className="block text-sm font-medium text-neutral-300 mb-2">
                            <User className="w-4 h-4 inline mr-2" />
                            ID de Usuario
                        </label>
                        <div className="p-3 bg-neutral-800 rounded-xl text-white font-mono text-sm">
                            {user?.id || 'Sin ID'}
                        </div>
                    </div>

                    {/* Created At */}
                    {user?.createdAt && (
                        <div>
                            <label className="block text-sm font-medium text-neutral-300 mb-2">
                                <Calendar className="w-4 h-4 inline mr-2" />
                                Fecha de Registro
                            </label>
                            <div className="p-3 bg-neutral-800 rounded-xl text-white">
                                {format(new Date(user.createdAt), "d 'de' MMMM, yyyy", { locale: es })}
                            </div>
                        </div>
                    )}
                </div>
            </Card>

            {/* Wallet Info Card */}
            <Card>
                <h3 className="text-base font-medium text-white mb-6 flex items-center gap-2">
                    <Wallet className="w-5 h-5 text-orange-500" />
                    Wallet Polygon
                </h3>

                {user?.walletAddress ? (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-neutral-300 mb-2">
                                Dirección de Wallet
                            </label>
                            <div className="p-3 bg-neutral-800 rounded-xl">
                                <div className="flex items-center justify-between gap-3">
                                    <p className="text-sm text-white font-mono break-all">
                                        {user.walletAddress}
                                    </p>
                                    <button
                                        onClick={copyAddress}
                                        className="p-2 hover:bg-neutral-700 rounded-lg transition-colors shrink-0"
                                    >
                                        {copied ? (
                                            <CheckCircle className="w-5 h-5 text-green-500" />
                                        ) : (
                                            <Copy className="w-5 h-5 text-neutral-400" />
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-xl">
                            <p className="text-sm text-orange-400">
                                💡 Esta es tu dirección única de wallet en la red Polygon. Puedes recibir USDC
                                directamente en esta dirección.
                            </p>
                        </div>

                        {/* Balance */}
                        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-500/10 to-transparent rounded-xl border border-neutral-800">
                            <span className="text-neutral-400">Balance Actual</span>
                            <span className="text-xl font-bold text-white">
                                ${parseFloat(user.usdcBalance || '0').toLocaleString('en-US', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                })} <span className="text-sm text-neutral-400">USDC</span>
                            </span>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-6">
                        <Wallet className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
                        <p className="text-neutral-500">No tienes wallet asignada</p>
                    </div>
                )}
            </Card>

            {/* Security Card */}
            <Card>
                <h3 className="text-base font-medium text-white mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-orange-500" />
                    Seguridad
                </h3>
                <p className="text-sm text-neutral-400 mb-4">
                </p>
                <Button variant="outline" className="w-full" disabled>
                    Cambiar Contraseña (Próximamente)
                </Button>
            </Card>
        </div>
    )
}
