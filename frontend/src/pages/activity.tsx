import { useEffect } from 'react'
import { useWalletStore } from '@/stores'
import { Card } from '@/components/ui'
import { Download, Upload, ArrowRightLeft, ExternalLink } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import { type Transaction } from '@/stores'

function TransactionIcon({ type }: { type: string }) {
    switch (type) {
        case 'deposit':
            return (
                <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                    <Download className="w-6 h-6 text-green-500" />
                </div>
            )
        case 'withdrawal':
            return (
                <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                    <Upload className="w-6 h-6 text-red-500" />
                </div>
            )
        case 'transfer':
            return (
                <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <ArrowRightLeft className="w-6 h-6 text-blue-500" />
                </div>
            )
        default:
            return null
    }
}

function TransactionCard({ tx }: { tx: Transaction }) {
    const labels: Record<string, string> = {
        deposit: 'Recarga',
        withdrawal: 'Retiro',
        transfer: 'Transferencia',
    }

    const statusLabels: Record<string, string> = {
        completed: 'Completada',
        pending: 'Procesando',
        failed: 'Fallida',
    }

    const statusColors: Record<string, string> = {
        completed: 'text-green-500 bg-green-500/10',
        pending: 'text-yellow-500 bg-yellow-500/10',
        failed: 'text-red-500 bg-red-500/10',
    }

    return (
        <Card className="flex items-center gap-4 hover:border-neutral-700 transition-colors">
            <TransactionIcon type={tx.type} />

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-white">{labels[tx.type]}</span>
                    <span
                        className={`text-xs px-2 py-0.5 rounded-full ${statusColors[tx.status]
                            }`}
                    >
                        {statusLabels[tx.status]}
                    </span>
                </div>
                <p className="text-sm text-neutral-400">{formatDate(tx.createdAt)}</p>
                {tx.notes && (
                    <p className="text-sm text-neutral-500 mt-1 truncate">{tx.notes}</p>
                )}
            </div>

            <div className="text-right">
                <p
                    className={`text-lg font-semibold ${tx.type === 'deposit'
                            ? 'text-green-500'
                            : tx.type === 'withdrawal'
                                ? 'text-red-500'
                                : 'text-white'
                        }`}
                >
                    {tx.type === 'deposit' ? '+' : '-'}${formatCurrency(tx.amount)}
                </p>
                <p className="text-xs text-neutral-500">USDC</p>
                {tx.txHash && (
                    <a
                        href={`https://polygonscan.com/tx/${tx.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-orange-500 hover:text-orange-400 mt-1"
                    >
                        Ver en blockchain
                        <ExternalLink className="w-3 h-3" />
                    </a>
                )}
            </div>
        </Card>
    )
}

export function ActivityPage() {
    const { transactions, fetchTransactions } = useWalletStore()

    useEffect(() => {
        fetchTransactions(50)
    }, [fetchTransactions])

    return (
        <div className="animate-fade-in">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-white">Actividad</h1>
                <p className="text-neutral-400">Historial de transacciones</p>
            </div>

            {transactions.length === 0 ? (
                <Card className="text-center py-12">
                    <p className="text-neutral-500">No hay transacciones aún</p>
                </Card>
            ) : (
                <div className="space-y-3">
                    {transactions.map((tx) => (
                        <TransactionCard key={tx.id} tx={tx} />
                    ))}
                </div>
            )}
        </div>
    )
}
