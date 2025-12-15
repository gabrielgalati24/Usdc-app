import { create } from 'zustand'
import { walletApi } from '@/lib/api'

export interface Transaction {
    id: string
    type: 'deposit' | 'withdrawal' | 'transfer'
    amount: string
    status: 'pending' | 'completed' | 'failed'
    txHash?: string
    externalAddress?: string
    fromUserId?: string
    toUserId?: string
    notes?: string
    createdAt: string
}

interface WalletState {
    balance: string
    walletAddress: string | null
    transactions: Transaction[]
    isLoading: boolean
    error: string | null

    // Stats
    totalIncoming: number
    totalOutgoing: number

    // Actions
    fetchBalance: () => Promise<void>
    fetchTransactions: (limit?: number) => Promise<void>
    deposit: (amount: number) => Promise<void>
    transfer: (toUserId: string, amount: number, notes?: string) => Promise<void>
    withdraw: (toAddress: string, amount: number) => Promise<void>
    clearError: () => void
}

export const useWalletStore = create<WalletState>((set, get) => ({
    balance: '0',
    walletAddress: null,
    transactions: [],
    isLoading: false,
    error: null,
    totalIncoming: 0,
    totalOutgoing: 0,

    fetchBalance: async () => {
        set({ isLoading: true })
        try {
            const { data } = await walletApi.getBalance()
            set({
                balance: data.usdcBalance,
                walletAddress: data.walletAddress,
                isLoading: false,
            })
        } catch (error) {
            set({ isLoading: false })
        }
    },

    fetchTransactions: async (limit = 20) => {
        set({ isLoading: true })
        try {
            const { data } = await walletApi.getTransactions(limit)

            // Get current user ID from auth store
            const authStore = (await import('./auth.store')).useAuthStore
            const currentUserId = authStore.getState().user?.id

            // Calculate stats
            let incoming = 0
            let outgoing = 0

            data.forEach((tx: Transaction) => {
                const amount = parseFloat(tx.amount)

                if (tx.type === 'deposit') {
                    // Deposits are always incoming
                    incoming += amount
                } else if (tx.type === 'withdrawal') {
                    // Withdrawals are always outgoing
                    outgoing += amount
                } else if (tx.type === 'transfer') {
                    // For transfers, check if we're the sender or receiver
                    if (tx.fromUserId === currentUserId) {
                        // We sent this transfer - outgoing
                        outgoing += amount
                    } else if (tx.toUserId === currentUserId) {
                        // We received this transfer - incoming
                        incoming += amount
                    }
                }
            })

            set({
                transactions: data,
                totalIncoming: incoming,
                totalOutgoing: outgoing,
                isLoading: false,
            })
        } catch (error) {
            set({ isLoading: false })
        }
    },

    deposit: async (amount) => {
        set({ isLoading: true, error: null })
        try {
            const { data } = await walletApi.deposit(amount)
            set({ balance: data.newBalance, isLoading: false })
            get().fetchTransactions()
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } }
            set({
                error: err.response?.data?.message || 'Error al depositar',
                isLoading: false,
            })
            throw error
        }
    },

    transfer: async (toUserId, amount, notes) => {
        set({ isLoading: true, error: null })
        try {
            const { data } = await walletApi.transfer(toUserId, amount, notes)
            set({ balance: data.yourNewBalance, isLoading: false })
            get().fetchTransactions()
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } }
            set({
                error: err.response?.data?.message || 'Error en transferencia',
                isLoading: false,
            })
            throw error
        }
    },

    withdraw: async (toAddress, amount) => {
        set({ isLoading: true, error: null })
        try {
            const { data } = await walletApi.withdraw(toAddress, amount)
            set({ balance: data.yourNewBalance, isLoading: false })
            get().fetchTransactions()
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } }
            set({
                error: err.response?.data?.message || 'Error al retirar',
                isLoading: false,
            })
            throw error
        }
    },

    clearError: () => set({ error: null }),
}))
