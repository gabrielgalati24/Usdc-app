import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores'
import { Button, Input } from '@/components/ui'
import { Mail, Lock, Sparkles, ArrowRight } from 'lucide-react'

export function LoginPage() {
    const navigate = useNavigate()
    const { login, isLoading, error, clearError } = useAuthStore()

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        e.stopPropagation()

        try {
            await login(email, password)
            navigate('/dashboard')
        } catch (err) {
            // Error is already set in store, just prevent any default behavior
            console.error('Login failed:', err)
        }
    }

    return (
        <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Animated gradient background */}
            <div className="absolute inset-0 gradient-mesh opacity-60" />
            <div className="absolute top-1/4 -left-20 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl animate-pulse-slow" />
            <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1.5s' }} />

            <div className="w-full max-w-md relative z-10 animate-scale-in">
                {/* Logo */}
                <div className="flex items-center justify-center gap-3 mb-8">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-xl shadow-orange-500/30 animate-float">
                        <Sparkles className="w-7 h-7 text-white" />
                    </div>
                    <div>
                        <span className="text-3xl font-bold text-white">UsdcApp</span>
                        <p className="text-xs text-neutral-500 font-medium tracking-wider">POWERED BY POLYGON</p>
                    </div>
                </div>

                {/* Card */}
                <div className="glass-card rounded-3xl p-8 shadow-2xl">
                    <h1 className="text-2xl font-bold text-white text-center mb-2">
                        Bienvenido de vuelta
                    </h1>
                    <p className="text-neutral-400 text-center mb-8">
                        Inicia sesión para continuar
                    </p>

                    {/* Error */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl animate-slide-down">
                            <p className="text-sm text-red-400">{error}</p>
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
                            className="w-full group"
                            size="lg"
                            isLoading={isLoading}
                        >
                            Iniciar Sesión
                            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </Button>
                    </form>

                    {/* Register Link */}
                    <p className="text-center text-neutral-400 mt-6">
                        ¿No tienes cuenta?{' '}
                        <Link
                            to="/register"
                            className="text-orange-400 hover:text-orange-300 font-medium transition-colors"
                        >
                            Regístrate
                        </Link>
                    </p>
                </div>

                {/* Footer */}
                <p className="text-center text-neutral-600 text-xs mt-8">
                    Tus fondos están seguros en la blockchain de Polygon
                </p>
            </div>
        </div>
    )
}
