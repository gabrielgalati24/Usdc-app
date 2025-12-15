import { Card } from '@/components/ui'
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface StatsCardsProps {
    incoming: number
    outgoing: number
}

export function StatsCards({ incoming, outgoing }: StatsCardsProps) {
    return (
        <div className="grid grid-cols-2 gap-4">
            {/* Incoming */}
            <Card className="bg-neutral-900">
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                        <ArrowDownLeft className="w-4 h-4 text-green-500" />
                    </div>
                    <span className="text-sm text-neutral-400">Entrada</span>
                </div>
                <p className="text-xl font-bold text-white">
                    ${formatCurrency(incoming)} USDc
                </p>
            </Card>

            {/* Outgoing */}
            <Card className="bg-neutral-900">
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
                        <ArrowUpRight className="w-4 h-4 text-red-500" />
                    </div>
                    <span className="text-sm text-neutral-400">Salida</span>
                </div>
                <p className="text-xl font-bold text-white">
                    ${formatCurrency(outgoing)} USDc
                </p>
            </Card>
        </div>
    )
}
