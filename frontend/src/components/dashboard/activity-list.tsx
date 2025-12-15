import { Link } from 'react-router-dom'
import { Card } from '@/components/ui'
import { Download, Upload, ArrowRightLeft, ExternalLink } from 'lucide-react'
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
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                    <Download className="w-5 h-5 text-green-500" />
                </div>
            )
        case 'withdrawal':
            return (
                <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                    <Upload className="w-5 h-5 text-red-500" />
                </div>
            )
        case 'transfer':
            return (
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <ArrowRightLeft className="w-5 h-5 text-blue-500" />
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
        completed: 'text-green-500',
        pending: 'text-yellow-500',
        failed: 'text-red-500',
    }

    const labels = {
        completed: 'Completada',
        pending: 'Procesando',
        failed: 'Fallida',
    }

    return (
        <span className={`text-xs ${styles[status as keyof typeof styles]}`}>
            {labels[status as keyof typeof labels]}
        </span>
    )
}

export function ActivityList({ transactions, limit = 5 }: ActivityListProps) {
    const items = limit ? transactions.slice(0, limit) : transactions

    return (
        <Card>
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-medium text-white">Actividad</h3>
                <Link
                    to="/activity"
                    className="text-sm text-orange-500 hover:text-orange-400 transition-colors"
                >
                    Ver todo
                </Link>
            </div>

            {items.length === 0 ? (
                <div className="py-8 text-center">
                    <p className="text-neutral-500">No hay transacciones aún</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {items.map((tx) => (
                        <div
                            key={tx.id}
                            className="flex items-center gap-4 p-3 rounded-xl hover:bg-neutral-800/50 transition-colors"
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
                                            className="text-neutral-500 hover:text-orange-500"
                                        >
                                            <ExternalLink className="w-3 h-3" />
                                        </a>
                                    )}
                                </div>
                                <p className="text-xs text-neutral-500">
                                    {formatRelativeTime(tx.createdAt)}
                                </p>
                            </div>

                            <div className="text-right">
                                <p
                                    className={`text-sm font-medium ${tx.type === 'deposit'
                                            ? 'text-green-500'
                                            : tx.type === 'withdrawal'
                                                ? 'text-red-500'
                                                : 'text-white'
                                        }`}
                                >
                                    {tx.type === 'deposit' ? '+' : '-'}${formatCurrency(tx.amount)} USDc
                                </p>
                                <StatusBadge status={tx.status} />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </Card>
    )
}
