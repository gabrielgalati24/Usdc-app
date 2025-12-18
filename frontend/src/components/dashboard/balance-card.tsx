import { Eye, EyeOff, TrendingUp, Wallet } from 'lucide-react'
import { useState } from 'react'
import { Card } from '@/components/ui'
import { formatCurrency } from '@/lib/utils'

interface BalanceCardProps {
    balance: string
    equivalent?: string
}

export function BalanceCard({ balance, equivalent }: BalanceCardProps) {
    const [visible, setVisible] = useState(true)

    return (
        <Card className="relative overflow-hidden bg-gradient-to-br from-neutral-900 via-neutral-900 to-neutral-800 border-white/[0.08]">
            {/* Animated gradient accent */}
            <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-bl from-orange-500/20 via-orange-500/10 to-transparent rounded-bl-full animate-pulse-slow" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-cyan-500/10 to-transparent rounded-tr-full" />

            <div className="relative z-10">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
                            <Wallet className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <span className="text-sm font-medium text-neutral-300">
                                Balance Disponible
                            </span>
                            <p className="text-xs text-neutral-500">Polygon USDC</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setVisible(!visible)}
                        className="p-2 hover:bg-white/5 rounded-xl transition-colors"
                    >
                        {visible ? (
                            <Eye className="w-5 h-5 text-neutral-400" />
                        ) : (
                            <EyeOff className="w-5 h-5 text-neutral-400" />
                        )}
                    </button>
                </div>

                {/* Balance */}
                <div className="mb-4">
                    <div className="flex items-baseline gap-2">
                        <span className="text-neutral-400 text-2xl font-medium">$</span>
                        <h2 className="text-5xl font-bold text-white tracking-tight">
                            {visible ? formatCurrency(balance) : '••••••'}
                        </h2>
                        <span className="text-neutral-400 text-lg font-medium">USDC</span>
                    </div>
                    {equivalent && visible && (
                        <div className="flex items-center gap-2 mt-3">
                            <TrendingUp className="w-4 h-4 text-green-400" />
                            <p className="text-sm text-neutral-400">
                                ≈ {equivalent} Bs.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </Card>
    )
}
