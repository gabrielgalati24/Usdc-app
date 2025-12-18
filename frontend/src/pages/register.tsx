import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores'
import { Button, Input } from '@/components/ui'
import { Mail, Lock, Sparkles, CheckCircle, ArrowRight } from 'lucide-react'

export function RegisterPage() {
    const navigate = useNavigate()
    const { register, isLoading, error, clearError } = useAuthStore()

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [passwordError, setPasswordError] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        e.stopPropagation()

        if (password !== confirmPassword) {
            setPasswordError('Las contraseñas no coinciden')
            return
        }

        if (password.length < 8) {
            setPasswordError('La contraseña debe tener al menos 8 caracteres')
            return
        }

        try {
            await register(email, password)
            navigate('/dashboard')
        } catch (err) {
            // Error is already set in store
            console.error('Register failed:', err)
        }
    }

    return (
        <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Animated gradient background */}
            <div className="absolute inset-0 gradient-mesh opacity-60" />
            <div className="absolute top-1/3 -right-20 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl animate-pulse-slow" />
            <div className="absolute bottom-1/3 -left-20 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1.5s' }} />

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
                        Crear cuenta
                    </h1>
                    <p className="text-neutral-400 text-center mb-6">
                        Obtén tu wallet de Polygon gratis
                    </p>

                    {/* Benefits */}
                    <div className="mb-6 p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-3">
                        {[
                            'Wallet de Polygon gratis',
                            'Recibe USDC automáticamente',
                            'Transferencias instantáneas',
                        ].map((benefit) => (
                            <div key={benefit} className="flex items-center gap-3">
                                <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                                    <CheckCircle className="w-3.5 h-3.5 text-green-400" />
                                </div>
                                <span className="text-sm text-neutral-300">{benefit}</span>
                            </div>
                        ))}
                    </div>

                    {/* Error */}
                    {(error || passwordError) && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl animate-slide-down">
                            <p className="text-sm text-red-400">{error || passwordError}</p>
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
                            placeholder="Mínimo 8 caracteres"
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value)
                                setPasswordError('')
                                clearError()
                            }}
                            leftIcon={<Lock className="w-5 h-5" />}
                            required
                        />

                        <Input
                            type="password"
                            label="Confirmar contraseña"
                            placeholder="Repite tu contraseña"
                            value={confirmPassword}
                            onChange={(e) => {
                                setConfirmPassword(e.target.value)
                                setPasswordError('')
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
                            Crear Cuenta
                            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </Button>
                    </form>

                    {/* Login Link */}
                    <p className="text-center text-neutral-400 mt-6">
                        ¿Ya tienes cuenta?{' '}
                        <Link
                            to="/login"
                            className="text-orange-400 hover:text-orange-300 font-medium transition-colors"
                        >
                            Inicia sesión
                        </Link>
                    </p>
                </div>

                {/* Footer */}
                <p className="text-center text-neutral-600 text-xs mt-8">
                    Al registrarte, aceptas nuestros términos y condiciones.
                </p>
            </div>
        </div>
    )
}
