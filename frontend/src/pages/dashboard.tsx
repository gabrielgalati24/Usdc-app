import { useEffect } from 'react'
import { useWalletStore, useAuthStore } from '@/stores'
import {
    BalanceCard,
    QuickActions,
    StatsCards,
    ActivityList,
} from '@/components/dashboard'
import { Card } from '@/components/ui'
import { Copy, CheckCircle } from 'lucide-react'
import { useState } from 'react'

export function DashboardPage() {
    const { user } = useAuthStore()
    const {
        balance,
        transactions,
        totalIncoming,
        totalOutgoing,
        fetchBalance,
        fetchTransactions,
    } = useWalletStore()

    const [copied, setCopied] = useState(false)

    useEffect(() => {
        fetchBalance()
        fetchTransactions()
    }, [fetchBalance, fetchTransactions])

    const copyAddress = () => {
        if (user?.walletAddress) {
            navigator.clipboard.writeText(user.walletAddress)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
            {/* Left Column - Balance & Actions */}
            <div className="lg:col-span-2 space-y-6">
                {/* Balance Card */}
                <div>
                    <BalanceCard balance={balance} />
                    <QuickActions />
                </div>

                {/* Stats */}
                <StatsCards incoming={totalIncoming} outgoing={totalOutgoing} />

                {/* Activity */}
                <ActivityList transactions={transactions} limit={5} />
            </div>

            {/* Right Column - Wallet Info */}
            <div className="space-y-6">
                {/* Wallet Address */}
                <Card>
                    <h3 className="text-base font-medium text-white mb-4">
                        Tu Wallet Polygon
                    </h3>
                    {user?.walletAddress ? (
                        <div className="space-y-3">
                            <div className="p-3 bg-neutral-800 rounded-xl">
                                <p className="text-xs text-neutral-400 mb-1">Dirección</p>
                                <div className="flex items-center gap-2">
                                    <p className="text-sm text-white font-mono break-all">
                                        {user.walletAddress}
                                    </p>
                                    <button
                                        onClick={copyAddress}
                                        className="p-1.5 hover:bg-neutral-700 rounded-lg transition-colors shrink-0"
                                    >
                                        {copied ? (
                                            <CheckCircle className="w-4 h-4 text-green-500" />
                                        ) : (
                                            <Copy className="w-4 h-4 text-neutral-400" />
                                        )}
                                    </button>
                                </div>
                            </div>
                            <p className="text-xs text-neutral-500">
                                Envía USDC a esta dirección en la red Polygon para recargar tu
                                cuenta automáticamente.
                            </p>
                        </div>
                    ) : (
                        <p className="text-sm text-neutral-500">
                            No tienes wallet asignada
                        </p>
                    )}
                </Card>

                {/* Quick Info */}
                <Card>
                    <h3 className="text-base font-medium text-white mb-4">
                        Información Rápida
                    </h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-neutral-400">Token</span>
                            <span className="text-sm text-white">USDC</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-neutral-400">Red</span>
                            <span className="text-sm text-white">Polygon</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-neutral-400">
                                Detección de depósitos
                            </span>
                            <span className="text-sm text-green-500">~30 segundos</span>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    )
}
