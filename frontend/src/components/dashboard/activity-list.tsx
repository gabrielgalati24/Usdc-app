import { Link } from 'react-router-dom'
import { Card } from '@/components/ui'
import { Download, Upload, ArrowRightLeft, ExternalLink, ArrowRight } from 'lucide-react'
import { formatCurrency, formatRelativeTime } from '@/lib/utils'
import { type Transaction } from '@/stores'

interface ActivityListProps {
    transactions: Transaction[]
    limit?: number
}

function TransactionIcon({ type }: { type: string }) {
    switch (type) {
        case 'deposit':
            return (
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-green-500/20 to-green-500/10 flex items-center justify-center">
                    <Download className="w-5 h-5 text-green-400" />
                </div>
            )
        case 'withdrawal':
            return (
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-red-500/20 to-red-500/10 flex items-center justify-center">
                    <Upload className="w-5 h-5 text-red-400" />
                </div>
            )
        case 'transfer':
            return (
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-500/10 flex items-center justify-center">
                    <ArrowRightLeft className="w-5 h-5 text-blue-400" />
                </div>
            )
        default:
            return null
    }
}

function TransactionLabel({ type }: { type: string }) {
    switch (type) {
        case 'deposit':
            return 'Recarga'
        case 'withdrawal':
            return 'Retiro'
        case 'transfer':
            return 'Transferencia'
        default:
            return type
    }
}

function StatusBadge({ status }: { status: string }) {
    const styles = {
        completed: 'bg-green-500/10 text-green-400 border-green-500/20',
        pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
        failed: 'bg-red-500/10 text-red-400 border-red-500/20',
    }

    const labels = {
        completed: 'Completada',
        pending: 'Procesando',
        failed: 'Fallida',
    }

    return (
        <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${styles[status as keyof typeof styles]}`}>
            {labels[status as keyof typeof labels]}
        </span>
    )
}

export function ActivityList({ transactions, limit = 5 }: ActivityListProps) {
    const items = limit ? transactions.slice(0, limit) : transactions

    return (
        <Card>
            <div className="flex items-center justify-between mb-5">
                <h3 className="text-base font-semibold text-white">Actividad Reciente</h3>
                <Link
                    to="/activity"
                    className="flex items-center gap-1 text-sm text-orange-400 hover:text-orange-300 transition-colors group"
                >
                    Ver todo
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
            </div>

            {items.length === 0 ? (
                <div className="py-12 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
                        <ArrowRightLeft className="w-7 h-7 text-neutral-600" />
                    </div>
                    <p className="text-neutral-500">No hay transacciones aún</p>
                    <p className="text-xs text-neutral-600 mt-1">Tus transacciones aparecerán aquí</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {items.map((tx) => (
                        <div
                            key={tx.id}
                            className="flex items-center gap-4 p-3.5 rounded-xl hover:bg-white/[0.03] transition-colors group cursor-pointer"
                        >
                            <TransactionIcon type={tx.type} />

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <p className="text-sm font-medium text-white">
                                        <TransactionLabel type={tx.type} />
                                    </p>
                                    {tx.txHash && (
                                        <a
                                            href={`https://polygonscan.com/tx/${tx.txHash}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-neutral-600 hover:text-orange-400 transition-colors"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <ExternalLink className="w-3.5 h-3.5" />
                                        </a>
                                    )}
                                </div>
                                <p className="text-xs text-neutral-500 mt-0.5">
                                    {formatRelativeTime(tx.createdAt)}
                                </p>
                            </div>

                            <div className="text-right">
                                <p
                                    className={`text-sm font-semibold ${tx.type === 'deposit'
                                        ? 'text-green-400'
                                        : tx.type === 'withdrawal'
                                            ? 'text-red-400'
                                            : 'text-white'
                                        }`}
                                >
                                    {tx.type === 'deposit' ? '+' : '-'}${formatCurrency(tx.amount)}
                                </p>
                                <div className="mt-1">
                                    <StatusBadge status={tx.status} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </Card>
    )
}
