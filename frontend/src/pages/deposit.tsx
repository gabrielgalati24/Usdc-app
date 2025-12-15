import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWalletStore } from '@/stores'
import { Button, Input, Card } from '@/components/ui'
import { Download, ChevronLeft, CheckCircle } from 'lucide-react'

export function DepositPage() {
    const navigate = useNavigate()
    const { deposit, isLoading, error, clearError } = useWalletStore()

    const [amount, setAmount] = useState('')
    const [success, setSuccess] = useState(false)

    const quickAmounts = [10, 50, 100, 500]

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const numAmount = parseFloat(amount)
        if (isNaN(numAmount) || numAmount <= 0) return

        try {
            await deposit(numAmount)
            setSuccess(true)
            setTimeout(() => navigate('/dashboard'), 2000)
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
                        ¡Depósito exitoso!
                    </h2>
                    <p className="text-neutral-400">
                        ${amount} USDC han sido agregados a tu cuenta
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
                    <h1 className="text-xl font-bold text-white">Recargar</h1>
                    <p className="text-sm text-neutral-400">Agrega fondos a tu cuenta</p>
                </div>
            </div>

            <Card>
                {/* Icon */}
                <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
                    <Download className="w-8 h-8 text-green-500" />
                </div>

                {/* Error */}
                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                        <p className="text-sm text-red-500">{error}</p>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
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

                        {/* Quick amounts */}
                        <div className="flex gap-2 mt-3">
                            {quickAmounts.map((qa) => (
                                <button
                                    key={qa}
                                    type="button"
                                    onClick={() => setAmount(qa.toString())}
                                    className="flex-1 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-sm text-white transition-colors"
                                >
                                    ${qa}
                                </button>
                            ))}
                        </div>
                    </div>

                    <Button
                        type="submit"
                        className="w-full"
                        size="lg"
                        isLoading={isLoading}
                        disabled={!amount || parseFloat(amount) <= 0}
                    >
                        Depositar ${amount || '0.00'} USDC
                    </Button>
                </form>

                <p className="text-xs text-neutral-500 text-center mt-4">
                    Este es un depósito de prueba. Para depósitos reales, envía USDC a tu
                    dirección de Polygon.
                </p>
            </Card>
        </div>
    )
}
