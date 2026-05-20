'use client'

import { useState } from 'react'
import { Scissors, Mail, Lock, ArrowRight, Users } from 'lucide-react'

interface LoginProps {
  onLogin: (user: any) => void
}

export default function Login({ onLogin }: LoginProps) {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const endpoint = isLogin ? '/api/login' : '/api/register'
    const body = isLogin ? { email, password } : { name, email, password }

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const contentType = res.headers.get('content-type') || ''
      if (!contentType.includes('application/json')) {
        throw new Error(`Error del servidor (${res.status}). Verifica que el backend esté en funcionamiento.`)
      }

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Algo salió mal')
      }

      if (!isLogin) {
        setIsLogin(true)
        setLoading(false)
        alert('Cuenta creada con éxito. Ahora puedes iniciar sesión.')
        return
      }

      if (data.token && typeof window !== 'undefined') {
        try {
          localStorage.setItem('salon_pro_token', data.token)
        } catch {
          console.warn('No se pudo guardar el token en localStorage.')
        }
      }

      setLoading(false)
      onLogin(data.user)
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#080608] relative overflow-hidden flex items-center justify-center p-4 sm:p-6">
      {/* Ambient orbs */}
      <div className="absolute top-[-80px] right-[-100px] w-[320px] h-[320px] rounded-full bg-[#D4A843]/10 blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[240px] h-[240px] rounded-full bg-purple-500/6 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-60px] left-[-80px] w-[200px] h-[200px] rounded-full bg-teal-400/5 blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8 animate-fadeIn">
          <div className="w-16 h-16 bg-[#D4A843]/10 border border-[#D4A843]/30 rounded-2xl flex items-center justify-center mx-auto mb-5 transition-transform duration-300 hover:scale-105">
            <Scissors className="w-8 h-8 text-[#D4A843] drop-shadow-[0_0_4px_rgba(212,168,67,0.4)]" />
          </div>
          <h1 className="text-white text-2xl font-bold tracking-tight uppercase">
            {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
          </h1>
          <p className="text-white/40 mt-2 text-xs sm:text-sm tracking-wide font-medium">
            {isLogin ? 'Luxe Concierge — Gestión de Salón' : 'Únete a nuestra plataforma premium'}
          </p>
        </div>

        <div className="app-card rounded-[32px] p-6 sm:p-8 relative overflow-hidden border border-[#D4A843]/20">
          {error && (
            <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl animate-fadeIn">
              <p className="text-xs sm:text-sm text-rose-400 text-center font-semibold">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-white/40 font-mono text-[10px] uppercase tracking-widest mb-2 px-1">Nombre Completo</label>
                <div className="relative group">
                  <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-white/30 group-focus-within:text-[#D4A843] transition-colors" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Tu nombre completo"
                    className="input-premium w-full pl-11"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-white/40 font-mono text-[10px] uppercase tracking-widest mb-2 px-1">Email</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-white/30 group-focus-within:text-[#D4A843] transition-colors" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@luxe.com"
                  className="input-premium w-full pl-11"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2 px-1">
                <label className="block text-white/40 font-mono text-[10px] uppercase tracking-widest">Contraseña</label>
                {isLogin && (
                  <button
                    type="button"
                    onClick={() => alert('Contacta con el administrador para restablecer tu contraseña.')}
                    className="text-white/40 hover:text-[#D4A843] font-mono text-[9px] uppercase tracking-wider transition-colors"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                )}
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-white/30 group-focus-within:text-[#D4A843] transition-colors" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-premium w-full pl-11"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-premium primary-btn w-full mt-4 py-3.5 flex items-center justify-center space-x-2 ripple-host disabled:opacity-50 disabled:pointer-events-none"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>{isLogin ? 'Ingresar al Portal' : 'Registrar Cuenta'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center border-t border-white/5 pt-6">
            <p className="text-xs text-white/50 font-medium">
              {isLogin ? '¿No tienes una cuenta?' : '¿Ya tienes una cuenta?'}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="ml-2 font-bold text-[#D4A843] hover:text-[#D4A843]/80 transition-colors underline underline-offset-4"
              >
                {isLogin ? 'Regístrate aquí' : 'Inicia sesión'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
