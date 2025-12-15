import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
})

// Interceptor para agregar token automáticamente
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

// Interceptor para manejar errores
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            window.location.href = '/login'
        }
        return Promise.reject(error)
    }
)

// Auth API
export const authApi = {
    register: (email: string, password: string) =>
        api.post('/v1/auth/register', { email, password }),

    login: (email: string, password: string) =>
        api.post('/v1/auth/login', { email, password }),

    getProfile: () => api.get('/v1/auth/profile'),

    searchUsers: (query: string, limit?: number) =>
        api.get('/v1/auth/users/search', { params: { q: query, limit } }),
}

// Wallet API
export const walletApi = {
    getBalance: () => api.get('/v1/wallet/balance'),

    deposit: (amount: number) =>
        api.post('/v1/wallet/deposit', { amount }),

    transfer: (toUserId: string, amount: number, notes?: string) =>
        api.post('/v1/wallet/transfer', { toUserId, amount, notes }),

    withdraw: (toAddress: string, amount: number) =>
        api.post('/v1/wallet/withdraw', { toAddress, amount }),

    getTransactions: (limit?: number) =>
        api.get('/v1/wallet/transactions', { params: { limit } }),
}

// Agents API
export const agentsApi = {
    analyze: (type: string, data: Record<string, unknown>) =>
        api.post('/v1/agents/analyze', { type, data }),

    analyzeSync: (type: string, data: Record<string, unknown>) =>
        api.post('/v1/agents/analyze/sync', { type, data }),

    getTask: (taskId: string) =>
        api.get(`/v1/agents/tasks/${taskId}`),

    getTasks: (limit?: number) =>
        api.get('/v1/agents/tasks', { params: { limit } }),

    chat: (message: string) =>
        api.post('/v1/agents/chat', { message }),

    chatStream: async (message: string, onChunk: (content: string) => void, onComplete: () => void, onError: (error: string) => void) => {
        const token = localStorage.getItem('token')
        if (!token) {
            onError('No autenticado')
            return null
        }

        try {
            const response = await fetch(`${API_BASE_URL}/v1/agents/chat/stream?message=${encodeURIComponent(message)}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'text/event-stream',
                },
            })

            if (!response.ok) {
                throw new Error('Error en la solicitud')
            }

            const reader = response.body?.getReader()
            const decoder = new TextDecoder()

            if (!reader) {
                throw new Error('No se pudo obtener el lector del stream')
            }

            let buffer = ''

            const processStream = async () => {
                try {
                    while (true) {
                        const { done, value } = await reader.read()

                        if (done) {
                            break
                        }

                        // Decode and add to buffer
                        buffer += decoder.decode(value, { stream: true })

                        // Process complete lines
                        const lines = buffer.split('\n')
                        // Keep last incomplete line in buffer
                        buffer = lines.pop() || ''

                        for (const line of lines) {
                            const trimmed = line.trim()

                            if (trimmed.startsWith('data:')) {
                                // Remove 'data:' prefix and trim
                                const jsonStr = trimmed.slice(5).trim()

                                if (!jsonStr) continue

                                try {
                                    const parsed = JSON.parse(jsonStr)

                                    if (parsed.error) {
                                        onError(parsed.error)
                                        reader.cancel()
                                        return
                                    } else if (parsed.done) {
                                        onComplete()
                                        reader.cancel()
                                        return
                                    } else if (parsed.content) {
                                        onChunk(parsed.content)
                                    }
                                } catch (e) {
                                    console.error('Error parsing SSE JSON:', jsonStr, e)
                                }
                            }
                        }
                    }

                    // Stream ended naturally
                    onComplete()
                } catch (error) {
                    console.error('Error reading stream:', error)
                    onError('Error leyendo la respuesta')
                }
            }

            processStream()

            return { cancel: () => reader.cancel() }
        } catch (error) {
            console.error('Error in chatStream:', error)
            onError('Error de conexión')
            return null
        }
    },
}

// Crypto API
export const cryptoApi = {
    getServerAddress: () => api.get('/v1/crypto/usdc/address'),

    getUsdcBalance: (address: string) =>
        api.get(`/v1/crypto/usdc/balance/${address}`),

    getMaticBalance: (address: string) =>
        api.get(`/v1/crypto/matic/balance/${address}`),

    getHistory: (address: string, options?: { blocks?: number; direction?: string }) =>
        api.get(`/v1/crypto/usdc/history/${address}`, { params: options }),
}

// Health API
export const healthApi = {
    check: () => api.get('/v1/health'),
    checkDb: () => api.get('/v1/health/db'),
}
