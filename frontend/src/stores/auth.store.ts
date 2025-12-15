import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authApi } from '@/lib/api'

export interface User {
    id: string
    email: string
    usdcBalance: string
    walletAddress?: string
    createdAt?: string
}

interface AuthState {
    user: User | null
    token: string | null
    isAuthenticated: boolean
    isLoading: boolean
    error: string | null

    // Actions
    login: (email: string, password: string) => Promise<void>
    register: (email: string, password: string) => Promise<void>
    logout: () => void
    fetchProfile: () => Promise<void>
    clearError: () => void
    updateBalance: (balance: string) => void
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,

            login: async (email, password) => {
                set({ isLoading: true, error: null })
                try {
                    const { data } = await authApi.login(email, password)
                    localStorage.setItem('token', data.accessToken)
                    set({
                        user: data.user,
                        token: data.accessToken,
                        isAuthenticated: true,
                        isLoading: false,
                    })
                } catch (error: unknown) {
                    const err = error as { response?: { data?: { message?: string } } }
                    set({
                        error: err.response?.data?.message || 'Error al iniciar sesión',
                        isLoading: false,
                    })
                    throw error
                }
            },

            register: async (email, password) => {
                set({ isLoading: true, error: null })
                try {
                    const { data } = await authApi.register(email, password)
                    localStorage.setItem('token', data.accessToken)
                    set({
                        user: data.user,
                        token: data.accessToken,
                        isAuthenticated: true,
                        isLoading: false,
                    })
                } catch (error: unknown) {
                    const err = error as { response?: { data?: { message?: string } } }
                    set({
                        error: err.response?.data?.message || 'Error al registrar',
                        isLoading: false,
                    })
                    throw error
                }
            },

            logout: () => {
                localStorage.removeItem('token')
                set({
                    user: null,
                    token: null,
                    isAuthenticated: false,
                })
            },

            fetchProfile: async () => {
                if (!get().token) return

                set({ isLoading: true })
                try {
                    const { data } = await authApi.getProfile()
                    set({
                        user: data,
                        isLoading: false,
                    })
                } catch (error) {
                    set({ isLoading: false })
                    throw error
                }
            },

            clearError: () => set({ error: null }),

            updateBalance: (balance) => {
                const user = get().user
                if (user) {
                    set({ user: { ...user, usdcBalance: balance } })
                }
            },
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({
                token: state.token,
                user: state.user,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
)
