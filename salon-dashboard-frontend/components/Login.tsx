'use client'

import { useState } from 'react'
import { Scissors, Mail, Lock, ArrowRight, Users, Sparkles } from 'lucide-react'

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
    <div className="min-h-screen bg-[#0A090A] relative overflow-hidden flex items-center justify-center p-4 sm:p-6">
      
      {/* Luxury Ambience Lights (Spotlights) */}
      <div className="absolute top-[-100px] right-[-100px] w-[500px] h-[500px] rounded-full bg-[#E5C17B]/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-100px] left-[-100px] w-[450px] h-[450px] rounded-full bg-[#C084FC]/4 blur-[110px] pointer-events-none" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[300px] h-[300px] rounded-full bg-white/[0.015] blur-[90px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        
        {/* Luxe branding header */}
        <div className="text-center mb-8 animate-fadeUp">
          <div className="w-16 h-16 bg-gradient-to-br from-[#E5C17B]/12 to-white/[0.01] border border-[#E5C17B]/20 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-2xl transition-transform duration-500 hover:scale-105 group">
            <Scissors className="w-7 h-7 text-[#E5C17B] drop-shadow-[0_0_8px_rgba(229,193,123,0.3)] transition-transform duration-500 group-hover:rotate-12" />
          </div>
          <h1 className="text-white text-xl font-bold tracking-[0.25em] uppercase leading-none">
            SALÓN <span className="text-[#E5C17B]">LUXE</span>
          </h1>
          <p className="text-white/30 mt-2.5 text-xs tracking-widest font-mono uppercase">
            {isLogin ? 'Acceso al Portal Concierge' : 'Registro de Cuenta Luxe'}
          </p>
        </div>

        {/* Floating Gloss Card */}
        <div className="app-card rounded-[32px] p-6 sm:p-8 relative overflow-hidden border-white/[0.06] shadow-2xl shadow-black/90">
          
          {/* Subtle top laser border shimmer */}
          <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#E5C17B]/20 to-transparent" />

          {error && (
            <div className="mb-6 p-4 bg-rose-500/8 border border-rose-500/15 rounded-2xl animate-fadeUp">
              <p className="text-xs sm:text-sm text-rose-400 text-center font-bold">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div>
                <label className="block text-white/40 font-mono text-[9px] uppercase tracking-widest mb-2 px-1 font-bold">Nombre Completo</label>
                <div className="relative group">
                  <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/35 group-focus-within:text-[#E5C17B] transition-colors" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Tu nombre y apellido"
                    className="input-premium w-full pl-11.5"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-white/40 font-mono text-[9px] uppercase tracking-widest mb-2 px-1 font-bold">Email de Acceso</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/35 group-focus-within:text-[#E5C17B] transition-colors" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@salonaluxe.com"
                  className="input-premium w-full pl-11.5"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2 px-1">
                <label className="block text-white/40 font-mono text-[9px] uppercase tracking-widest font-bold">Contraseña</label>
                {isLogin && (
                  <button
                    type="button"
                    onClick={() => alert('Contacta con soporte técnico de Salón Luxe para restablecer tu contraseña.')}
                    className="text-white/30 hover:text-[#E5C17B] font-mono text-[8px] uppercase tracking-wider transition-colors font-bold"
                  >
                    ¿La olvidaste?
                  </button>
                )}
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/35 group-focus-within:text-[#E5C17B] transition-colors" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-premium w-full pl-11.5"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-premium w-full mt-6 py-4 flex items-center justify-center space-x-2 shadow-lg shadow-[#E5C17B]/5 disabled:opacity-50 disabled:pointer-events-none"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-[#E5C17B]/30 border-t-[#E5C17B] rounded-full animate-spin" />
              ) : (
                <>
                  <span className="font-bold tracking-widest text-xs uppercase">{isLogin ? 'Ingresar al Salón' : 'Crear Cuenta Luxe'}</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center border-t border-white/5 pt-6 relative">
            <p className="text-xs text-white/45 font-medium flex items-center justify-center gap-1.5">
              <span>{isLogin ? '¿Nuevo en el equipo?' : '¿Ya eres miembro?'}</span>
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="font-bold text-[#E5C17B] hover:text-[#F2D8A7] transition-colors underline underline-offset-4 decoration-[#E5C17B]/30"
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
