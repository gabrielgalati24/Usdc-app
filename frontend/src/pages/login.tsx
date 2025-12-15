import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores'
import { Button, Input } from '@/components/ui'
import { Mail, Lock, Sparkles } from 'lucide-react'

export function LoginPage() {
    const navigate = useNavigate()
    const { login, isLoading, error, clearError } = useAuthStore()

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            await login(email, password)
            navigate('/dashboard')
        } catch {
            // Error is handled in store
        }
    }

    return (
        <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="flex items-center justify-center gap-3 mb-8">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                        <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-2xl font-bold text-white">UsdcApp</span>
                </div>

                {/* Card */}
                <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8">
                    <h1 className="text-2xl font-bold text-white text-center mb-2">
                        Bienvenido de vuelta
                    </h1>
                    <p className="text-neutral-400 text-center mb-8">
                        Inicia sesión para continuar
                    </p>

                    {/* Error */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                            <p className="text-sm text-red-500">{error}</p>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <Input
                            type="email"
                            label="Email"
                            placeholder="tu@email.com"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value)
                                clearError()
                            }}
                            leftIcon={<Mail className="w-5 h-5" />}
                            required
                        />

                        <Input
                            type="password"
                            label="Contraseña"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value)
                                clearError()
                            }}
                            leftIcon={<Lock className="w-5 h-5" />}
                            required
                        />

                        <Button
                            type="submit"
                            className="w-full"
                            size="lg"
                            isLoading={isLoading}
                        >
                            Iniciar Sesión
                        </Button>
                    </form>

                    {/* Register Link */}
                    <p className="text-center text-neutral-400 mt-6">
                        ¿No tienes cuenta?{' '}
                        <Link
                            to="/register"
                            className="text-orange-500 hover:text-orange-400 font-medium"
                        >
                            Regístrate
                        </Link>
                    </p>
                </div>

                {/* Footer */}
                <p className="text-center text-neutral-500 text-sm mt-8">
                </p>
            </div>
        </div>
    )
}
