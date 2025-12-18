import { Card } from '@/components/ui'
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface StatsCardsProps {
    incoming: number
    outgoing: number
}

export function StatsCards({ incoming, outgoing }: StatsCardsProps) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Incoming */}
            <Card className="group hover:border-green-500/30 transition-all duration-300" hover>
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-green-500/20 to-green-500/10 flex items-center justify-center group-hover:scale-105 transition-transform">
                        <ArrowDownLeft className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                        <span className="text-sm text-neutral-400">Entrada</span>
                        <p className="text-[10px] text-neutral-600 uppercase tracking-wider">Total recibido</p>
                    </div>
                </div>
                <p className="text-2xl font-bold text-white">
                    <span className="text-green-400">+</span>${formatCurrency(incoming)}
                </p>
                <p className="text-xs text-neutral-500 mt-1">USDC</p>
            </Card>

            {/* Outgoing */}
            <Card className="group hover:border-red-500/30 transition-all duration-300" hover>
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-red-500/20 to-red-500/10 flex items-center justify-center group-hover:scale-105 transition-transform">
                        <ArrowUpRight className="w-5 h-5 text-red-400" />
                    </div>
                    <div>
                        <span className="text-sm text-neutral-400">Salida</span>
                        <p className="text-[10px] text-neutral-600 uppercase tracking-wider">Total enviado</p>
                    </div>
                </div>
                <p className="text-2xl font-bold text-white">
                    <span className="text-red-400">-</span>${formatCurrency(outgoing)}
                </p>
                <p className="text-xs text-neutral-500 mt-1">USDC</p>
            </Card>
        </div>
    )
}
