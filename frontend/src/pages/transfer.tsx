import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWalletStore } from '@/stores'
import { authApi } from '@/lib/api'
import { Button, Input, Card } from '@/components/ui'
import { Send, ChevronLeft, CheckCircle, User, Search, X, Loader2 } from 'lucide-react'

interface UserResult {
    id: string
    email: string
}

export function TransferPage() {
    const navigate = useNavigate()
    const { transfer, balance, isLoading, error, clearError } = useWalletStore()

    const [searchQuery, setSearchQuery] = useState('')
    const [selectedUser, setSelectedUser] = useState<UserResult | null>(null)
    const [searchResults, setSearchResults] = useState<UserResult[]>([])
    const [isSearching, setIsSearching] = useState(false)
    const [showResults, setShowResults] = useState(false)
    const [amount, setAmount] = useState('')
    const [notes, setNotes] = useState('')
    const [success, setSuccess] = useState(false)

    const searchRef = useRef<HTMLDivElement>(null)
    const debounceRef = useRef<NodeJS.Timeout | null>(null)

    // Close search results when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
                setShowResults(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Search users with debounce
    useEffect(() => {
        if (debounceRef.current) {
            clearTimeout(debounceRef.current)
        }

        if (searchQuery.length < 2) {
            setSearchResults([])
            setShowResults(false)
            return
        }

        debounceRef.current = setTimeout(async () => {
            setIsSearching(true)
            try {
                const { data } = await authApi.searchUsers(searchQuery, 10)
                setSearchResults(data)
                setShowResults(true)
            } catch (err) {
                console.error('Error searching users:', err)
                setSearchResults([])
            } finally {
                setIsSearching(false)
            }
        }, 300)

        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current)
            }
        }
    }, [searchQuery])

    const handleSelectUser = (user: UserResult) => {
        setSelectedUser(user)
        setSearchQuery(user.email)
        setShowResults(false)
    }

    const handleClearUser = () => {
        setSelectedUser(null)
        setSearchQuery('')
        setSearchResults([])
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedUser) return

        const numAmount = parseFloat(amount)
        if (isNaN(numAmount) || numAmount <= 0) return

        try {
            await transfer(selectedUser.id, numAmount, notes || undefined)
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
                        ¡Transferencia exitosa!
                    </h2>
                    <p className="text-neutral-400">
                        ${amount} USDC han sido enviados a {selectedUser?.email}
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
                    <h1 className="text-xl font-bold text-white">Enviar</h1>
                    <p className="text-sm text-neutral-400">
                        Transfiere a otro usuario
                    </p>
                </div>
            </div>

            <Card>
                {/* Icon */}
                <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-6">
                    <Send className="w-8 h-8 text-blue-500" />
                </div>

                {/* Balance */}
                <div className="text-center mb-6">
                    <p className="text-sm text-neutral-400">Disponible</p>
                    <p className="text-2xl font-bold text-white">${balance} USDC</p>
                </div>

                {/* Error */}
                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                        <p className="text-sm text-red-500">{error}</p>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* User Search */}
                    <div ref={searchRef} className="relative">
                        <label className="block text-sm font-medium text-neutral-300 mb-2">
                            Destinatario
                        </label>

                        {selectedUser ? (
                            // Selected user display
                            <div className="flex items-center justify-between p-3 bg-neutral-800 rounded-xl border border-neutral-700">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                                        <User className="w-4 h-4 text-blue-500" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-white">{selectedUser.email}</p>
                                        <p className="text-xs text-neutral-500 font-mono">
                                            {selectedUser.id.slice(0, 8)}...
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleClearUser}
                                    className="p-1.5 hover:bg-neutral-700 rounded-lg transition-colors"
                                >
                                    <X className="w-4 h-4 text-neutral-400" />
                                </button>
                            </div>
                        ) : (
                            // Search input
                            <>
                                <div className="relative">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500">
                                        {isSearching ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <Search className="w-5 h-5" />
                                        )}
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Buscar por email..."
                                        value={searchQuery}
                                        onChange={(e) => {
                                            setSearchQuery(e.target.value)
                                            clearError()
                                        }}
                                        onFocus={() => searchResults.length > 0 && setShowResults(true)}
                                        className="w-full pl-10 pr-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all"
                                    />
                                </div>

                                {/* Search Results Dropdown */}
                                {showResults && searchResults.length > 0 && (
                                    <div className="absolute z-10 w-full mt-2 bg-neutral-800 border border-neutral-700 rounded-xl overflow-hidden shadow-xl">
                                        {searchResults.map((user) => (
                                            <button
                                                key={user.id}
                                                type="button"
                                                onClick={() => handleSelectUser(user)}
                                                className="w-full flex items-center gap-3 p-3 hover:bg-neutral-700 transition-colors text-left"
                                            >
                                                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                                                    <User className="w-4 h-4 text-blue-500" />
                                                </div>
                                                <div className="overflow-hidden">
                                                    <p className="text-sm text-white truncate">{user.email}</p>
                                                    <p className="text-xs text-neutral-500 font-mono">
                                                        ID: {user.id.slice(0, 8)}...
                                                    </p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {/* No results */}
                                {showResults && searchQuery.length >= 2 && searchResults.length === 0 && !isSearching && (
                                    <div className="absolute z-10 w-full mt-2 p-4 bg-neutral-800 border border-neutral-700 rounded-xl text-center">
                                        <p className="text-sm text-neutral-400">No se encontraron usuarios</p>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

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

                    <Input
                        label="Nota (opcional)"
                        placeholder="Ej: Pago por servicios"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                    />

                    <Button
                        type="submit"
                        className="w-full"
                        size="lg"
                        isLoading={isLoading}
                        disabled={!selectedUser || !amount || parseFloat(amount) <= 0}
                    >
                        Enviar ${amount || '0.00'} USDC
                    </Button>
                </form>

                <p className="text-xs text-neutral-500 text-center mt-4">
                    Las transferencias internas son instantáneas y sin comisiones.
                </p>
            </Card>
        </div>
    )
}
