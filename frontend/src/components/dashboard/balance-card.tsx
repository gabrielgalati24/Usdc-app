import { Eye, EyeOff } from 'lucide-react'
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
        <Card className="bg-gradient-to-br from-neutral-900 to-neutral-800 overflow-hidden relative">
            {/* Orange accent gradient */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-orange-500/20 to-transparent rounded-bl-full" />

            <div className="relative z-10">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center">
                            <span className="text-xs font-bold text-white">$</span>
                        </div>
                        <span className="text-sm font-medium text-neutral-300">
                            Balance en USDc
                        </span>
                    </div>
                    <button
                        onClick={() => setVisible(!visible)}
                        className="p-1.5 hover:bg-neutral-700/50 rounded-lg transition-colors"
                    >
                        {visible ? (
                            <Eye className="w-4 h-4 text-neutral-400" />
                        ) : (
                            <EyeOff className="w-4 h-4 text-neutral-400" />
                        )}
                    </button>
                </div>

                {/* Balance */}
                <div className="mb-4">
                    <h2 className="text-4xl font-bold text-white tracking-tight">
                        {visible ? `$${formatCurrency(balance)}` : '••••••'}
                    </h2>
                    {equivalent && visible && (
                        <p className="text-sm text-neutral-400 mt-1">
                            {equivalent} Bs.
                        </p>
                    )}
                </div>
            </div>
        </Card>
    )
}
