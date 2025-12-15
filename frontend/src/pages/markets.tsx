import { useState } from 'react'
import { Card } from '@/components/ui'
import { toast } from 'sonner'
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts'
import { TrendingUp, TrendingDown, Info, Lock, AlertCircle } from 'lucide-react'

// Mock Data Generators
const generateData = (startValue: number, volatility: number) => {
    let currentValue = startValue
    return Array.from({ length: 24 }, (_, i) => {
        const change = (Math.random() - 0.45) * volatility // Slight upward bias
        currentValue = currentValue * (1 + change)
        return {
            time: `${i}:00`,
            value: currentValue
        }
    })
}

const COMPANIES = [
    {
        id: 'yummy',
        name: 'Yummy',
        symbol: 'YUMMY',
        price: 45.23,
        change: 12.5,
        data: generateData(40, 0.02),
        color: '#F97316', // Orange
        description: 'SuperApp de delivery y transporte líder en Venezuela'
    },
    {
        id: 'ridery',
        name: 'Ridery',
        symbol: 'RIDE',
        price: 32.15,
        change: 8.4,
        data: generateData(30, 0.03),
        color: '#8B5CF6', // Purple
        description: 'La app de movilidad número 1 del país'
    },
    {
        id: 'polar',
        name: 'Polar',
        symbol: 'POLAR',
        price: 156.80,
        change: 2.3,
        data: generateData(150, 0.01),
        color: '#0EA5E9', // Blue
        description: 'Empresa líder en alimentos y bebidas'
    },
    {
        id: 'cashea',
        name: 'Cashea',
        symbol: 'CSH',
        price: 89.40,
        change: 24.8,
        data: generateData(70, 0.04),
        color: '#10B981', // Emerald
        description: 'Compra ahora y paga después sin intereses'
    }
]

export function MarketsPage() {
    const [selectedPeriod, setSelectedPeriod] = useState('1D')

    const handleInvest = (company: string) => {
        toast.error('Inversión no disponible', {
            description: `La inversión en ${company} estará disponible próximamente. Esta es una versión DEMO.`,
            icon: <AlertCircle className="w-5 h-5" />,
            duration: 4000,
        })
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Demo Banner */}
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 flex items-start gap-3">
                <Info className="w-5 h-5 text-yellow-500 mt-0.5 shrink-0" />
                <div>
                    <h3 className="text-yellow-500 font-medium">Modo Demostración</h3>
                    <p className="text-sm text-yellow-500/80">
                        Los datos mostrados son simulados. La funcionalidad de inversión en tiempo real para empresas venezolanas está en desarrollo.
                    </p>
                </div>
            </div>

            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-white">Mercado Venezolano</h1>
                <div className="flex gap-2">
                    {['1D', '1S', '1M', '1A'].map((period) => (
                        <button
                            key={period}
                            onClick={() => setSelectedPeriod(period)}
                            className={`px-3 py-1 rounded-lg text-sm transition-colors ${selectedPeriod === period
                                ? 'bg-purple-600 text-white'
                                : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
                                }`}
                        >
                            {period}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {COMPANIES.map((company) => (
                    <Card key={company.id} className="p-6 overflow-hidden relative group">
                        {/* Header */}
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="text-xl font-bold text-white">{company.name}</h3>
                                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-neutral-800 text-neutral-400">
                                        {company.symbol}
                                    </span>
                                </div>
                                <p className="text-sm text-neutral-400">{company.description}</p>
                            </div>
                            <div className="text-right">
                                <div className="text-2xl font-bold text-white">
                                    ${company.price.toFixed(2)}
                                </div>
                                <div className={`flex items-center justify-end gap-1 text-sm ${company.change >= 0 ? 'text-green-500' : 'text-red-500'
                                    }`}>
                                    {company.change >= 0 ? (
                                        <TrendingUp className="w-3 h-3" />
                                    ) : (
                                        <TrendingDown className="w-3 h-3" />
                                    )}
                                    {company.change}%
                                </div>
                            </div>
                        </div>

                        {/* Chart */}
                        <div className="h-48 -mx-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={company.data}>
                                    <defs>
                                        <linearGradient id={`gradient-${company.id}`} x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={company.color} stopOpacity={0.3} />
                                            <stop offset="95%" stopColor={company.color} stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                    <XAxis
                                        dataKey="time"
                                        hide
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <YAxis
                                        hide
                                        domain={['dataMin - 5', 'dataMax + 5']}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#171717',
                                            border: '1px solid #333',
                                            borderRadius: '8px',
                                            color: '#fff'
                                        }}
                                        itemStyle={{ color: '#fff' }}
                                        labelStyle={{ display: 'none' }}
                                        formatter={(value: number) => [`$${value.toFixed(2)}`, 'Precio']}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="value"
                                        stroke={company.color}
                                        strokeWidth={2}
                                        fillOpacity={1}
                                        fill={`url(#gradient-${company.id})`}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Action Button */}
                        <div className="mt-4 pt-4 border-t border-neutral-800 flex items-center justify-between">
                            <div className="text-xs text-neutral-500">
                                Capitalización: $ {(company.price * 1000000).toLocaleString()}
                            </div>
                            <button
                                onClick={() => handleInvest(company.name)}
                                className="flex items-center gap-2 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg transition-colors text-sm font-medium"
                            >
                                <Lock className="w-3 h-3" />
                                Invertir
                            </button>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    )
}
