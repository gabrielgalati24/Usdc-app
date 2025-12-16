import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWalletStore } from '@/stores'
import { Button, Input, Card } from '@/components/ui'
import { Upload, ChevronLeft, CheckCircle, AlertTriangle, Info } from 'lucide-react'
import { api } from '@/lib/api'

// Constante de comisión de gas (debe coincidir con backend)
const GAS_FEE = 0.01

interface FeeEstimate {
    amount: string
    gasFee: string
    totalRequired: string
    currentBalance: string
    maxWithdrawable: string
    remainingAfterWithdraw: string
    isValid: boolean
    minAmount: string
    message: string | null
}

export function WithdrawPage() {
    const navigate = useNavigate()
    const { withdraw, balance, fetchBalance, isLoading, error, clearError } = useWalletStore()

    const [toAddress, setToAddress] = useState('')
    const [amount, setAmount] = useState('')
    const [success, setSuccess] = useState(false)
    const [feeEstimate, setFeeEstimate] = useState<FeeEstimate | null>(null)
    const [estimating, setEstimating] = useState(false)

    // Calcular máximo disponible
    const maxWithdrawable = Math.max(0, parseFloat(balance) - GAS_FEE)

    // Estimar fees cuando cambia el monto
    useEffect(() => {
        const numAmount = parseFloat(amount)
        if (!isNaN(numAmount) && numAmount > 0) {
            estimateFees(numAmount)
        } else {
            setFeeEstimate(null)
        }
    }, [amount])

    // Refresh balance al cargar
    useEffect(() => {
        fetchBalance()
    }, [fetchBalance])

    const estimateFees = async (numAmount: number) => {
        setEstimating(true)
        try {
            const response = await api.get<FeeEstimate>(`/v1/wallet/withdraw/estimate?amount=${numAmount}`)
            setFeeEstimate(response.data)
        } catch {
            // Fallback local si falla el endpoint
            const totalRequired = numAmount + GAS_FEE
            const currentBalance = parseFloat(balance)
            setFeeEstimate({
                amount: numAmount.toFixed(6),
                gasFee: GAS_FEE.toFixed(6),
                totalRequired: totalRequired.toFixed(6),
                currentBalance: currentBalance.toFixed(6),
                maxWithdrawable: maxWithdrawable.toFixed(6),
                remainingAfterWithdraw: (currentBalance - totalRequired).toFixed(6),
                isValid: currentBalance >= totalRequired && numAmount >= 0.01,
                minAmount: '0.010000',
                message: currentBalance < totalRequired
                    ? `Saldo insuficiente. Necesitas ${totalRequired.toFixed(6)} USDC`
                    : null,
            })
        } finally {
            setEstimating(false)
        }
    }

    const handleMaxClick = () => {
        if (maxWithdrawable > 0) {
            setAmount(maxWithdrawable.toFixed(2))
            clearError()
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const numAmount = parseFloat(amount)

        // Validación frontend
        if (isNaN(numAmount) || numAmount <= 0) {
            return
        }

        if (numAmount + GAS_FEE > parseFloat(balance)) {
            return // El error se mostrará por el feeEstimate
        }

        try {
            await withdraw(toAddress, numAmount)
            setSuccess(true)
            setTimeout(() => navigate('/dashboard'), 3000)
        } catch {
            // Error handled in store
        }
    }

    const isAmountValid = feeEstimate?.isValid ?? false
    const showFees = amount && parseFloat(amount) > 0

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

                {/* Balance section */}
                <div className="text-center mb-6 p-4 bg-neutral-800/50 rounded-xl">
                    <div className="flex justify-between text-sm mb-2">
                        <span className="text-neutral-400">Balance total</span>
                        <span className="text-white font-medium">${balance} USDC</span>
                    </div>
                    <div className="flex justify-between text-sm mb-2">
                        <span className="text-neutral-400">Comisión de gas</span>
                        <span className="text-yellow-500">-${GAS_FEE.toFixed(2)} USDC</span>
                    </div>
                    <div className="border-t border-neutral-700 pt-2 flex justify-between text-sm">
                        <span className="text-neutral-400">Disponible para retirar</span>
                        <span className="text-green-500 font-bold">
                            ${maxWithdrawable.toFixed(2)} USDC
                        </span>
                    </div>
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
                {(error || (feeEstimate && !feeEstimate.isValid && feeEstimate.message)) && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                        <p className="text-sm text-red-500">
                            {error || feeEstimate?.message}
                        </p>
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

                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-sm font-medium text-neutral-200">
                                Monto (USDC)
                            </label>
                            <button
                                type="button"
                                onClick={handleMaxClick}
                                disabled={maxWithdrawable <= 0}
                                className="text-xs px-2 py-1 bg-orange-500/20 text-orange-500 rounded-md hover:bg-orange-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                MÁXIMO
                            </button>
                        </div>
                        <Input
                            type="number"
                            placeholder="0.00"
                            value={amount}
                            onChange={(e) => {
                                setAmount(e.target.value)
                                clearError()
                            }}
                            min="0.01"
                            step="0.01"
                            max={maxWithdrawable}
                            required
                        />
                    </div>

                    {/* Fee breakdown */}
                    {showFees && (
                        <div className="p-4 bg-neutral-800/50 rounded-xl space-y-2">
                            <div className="flex items-center gap-2 text-sm text-neutral-400 mb-2">
                                <Info className="w-4 h-4" />
                                <span>Desglose del retiro</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-neutral-400">Monto a recibir</span>
                                <span className="text-white">${amount || '0.00'} USDC</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-neutral-400">Comisión de gas</span>
                                <span className="text-yellow-500">${GAS_FEE.toFixed(2)} USDC</span>
                            </div>
                            <div className="border-t border-neutral-700 pt-2 flex justify-between text-sm font-medium">
                                <span className="text-neutral-400">Total a descontar</span>
                                <span className={isAmountValid ? 'text-white' : 'text-red-500'}>
                                    ${(parseFloat(amount || '0') + GAS_FEE).toFixed(2)} USDC
                                </span>
                            </div>
                            {feeEstimate && isAmountValid && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-neutral-400">Balance restante</span>
                                    <span className="text-green-500">
                                        ${feeEstimate.remainingAfterWithdraw} USDC
                                    </span>
                                </div>
                            )}
                        </div>
                    )}

                    <Button
                        type="submit"
                        variant="destructive"
                        className="w-full"
                        size="lg"
                        isLoading={isLoading || estimating}
                        disabled={
                            !toAddress ||
                            !amount ||
                            parseFloat(amount) <= 0 ||
                            !isAmountValid ||
                            parseFloat(amount) + GAS_FEE > parseFloat(balance)
                        }
                    >
                        {isAmountValid ? (
                            <>Retirar ${amount || '0.00'} USDC</>
                        ) : (
                            'Saldo insuficiente'
                        )}
                    </Button>
                </form>

                <p className="text-xs text-neutral-500 text-center mt-4">
                    Mínimo: 0.01 USDC • Red: Polygon • Gas: ~${GAS_FEE} USDC
                </p>
            </Card>
        </div>
    )
}
