import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWalletStore } from '@/stores'
import { Button, Input, Card } from '@/components/ui'
import { Upload, ChevronLeft, CheckCircle, AlertTriangle } from 'lucide-react'

export function WithdrawPage() {
    const navigate = useNavigate()
    const { withdraw, balance, isLoading, error, clearError } = useWalletStore()

    const [toAddress, setToAddress] = useState('')
    const [amount, setAmount] = useState('')
    const [success, setSuccess] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const numAmount = parseFloat(amount)
        if (isNaN(numAmount) || numAmount <= 0) return

        try {
            await withdraw(toAddress, numAmount)
            setSuccess(true)
            setTimeout(() => navigate('/dashboard'), 3000)
        } catch {
            // Error handled in store
        }
    }

    if (success) {
        return (
            <div className="max-w-md mx-auto animate-fade-in">
                <Card className="text-center py-12">
                    <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-8 h-8 text-green-500" />
                    </div>
                    <h2 className="text-xl font-bold text-white mb-2">
                        ¡Retiro procesado!
                    </h2>
                    <p className="text-neutral-400 mb-2">
                        ${amount} USDC serán enviados a tu wallet
                    </p>
                    <p className="text-xs text-neutral-500">
                        Puede tardar 1-2 minutos en confirmarse en blockchain
                    </p>
                </Card>
            </div>
        )
    }

    return (
        <div className="max-w-md mx-auto animate-fade-in">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 hover:bg-neutral-800 rounded-xl transition-colors"
                >
                    <ChevronLeft className="w-5 h-5 text-neutral-400" />
                </button>
                <div>
                    <h1 className="text-xl font-bold text-white">Retirar</h1>
                    <p className="text-sm text-neutral-400">
                        Envía USDC a una wallet externa
                    </p>
                </div>
            </div>

            <Card>
                {/* Icon */}
                <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-6">
                    <Upload className="w-8 h-8 text-red-500" />
                </div>

                {/* Balance */}
                <div className="text-center mb-6">
                    <p className="text-sm text-neutral-400">Disponible</p>
                    <p className="text-2xl font-bold text-white">${balance} USDC</p>
                </div>

                {/* Warning */}
                <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-medium text-yellow-500">Importante</p>
                        <p className="text-xs text-neutral-400 mt-1">
                            Este es un retiro on-chain a la red Polygon. Verifica que la
                            dirección sea correcta. Esta acción no se puede deshacer.
                        </p>
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                        <p className="text-sm text-red-500">{error}</p>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    <Input
                        label="Dirección de wallet"
                        placeholder="0x..."
                        value={toAddress}
                        onChange={(e) => {
                            setToAddress(e.target.value)
                            clearError()
                        }}
                        required
                    />

                    <Input
                        type="number"
                        label="Monto (USDC)"
                        placeholder="0.00"
                        value={amount}
                        onChange={(e) => {
                            setAmount(e.target.value)
                            clearError()
                        }}
                        min="0.01"
                        step="0.01"
                        required
                    />

                    <Button
                        type="submit"
                        variant="destructive"
                        className="w-full"
                        size="lg"
                        isLoading={isLoading}
                        disabled={!toAddress || !amount || parseFloat(amount) <= 0}
                    >
                        Retirar ${amount || '0.00'} USDC
                    </Button>
                </form>

                <p className="text-xs text-neutral-500 text-center mt-4">
                    Mínimo: 0.01 USDC • Red: Polygon
                </p>
            </Card>
        </div>
    )
}
