'use client'

import { useState } from 'react'
import { Scissors, Mail, Lock, ArrowRight, Github, Chrome, Users } from 'lucide-react'

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
        body: JSON.stringify(body)
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || 'Algo salió mal')
      }

      // If it was registration, automatically log in or switch to login
      if (!isLogin) {
        setIsLogin(true)
        setLoading(false)
        alert('Cuenta creada con éxito. Ahora puedes iniciar sesión.')
        return
      }

      // Store token
      if (data.token) {
        localStorage.setItem('salon_pro_token', data.token)
      }

      setLoading(false)
      onLogin(data.user)
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }


  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
      <div className="absolute top-0 -right-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />

      <div className="w-full max-w-md glass-card p-10 relative z-10 transition-all duration-500">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-500/20 mb-6 group">
            <Scissors className="w-8 h-8 text-white group-hover:shake" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white">
            {isLogin ? 'Bienvenido' : 'Crear Cuenta'}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-center">
            {isLogin ? 'Gestiona tu salón con inteligencia artificial' : 'Únete a la nueva era de gestión inteligente'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl animate-in shake duration-500">
            <p className="text-sm text-red-600 dark:text-red-400 text-center font-semibold">{error}</p>
          </div>
        )}

        {isLogin && (
          <div className="mb-4 p-3 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-xl text-center">
            <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
              Demo: <strong>admin@salon.com</strong> / <strong>admin123</strong>
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">

          {!isLogin && (
            <div className="animate-in fade-in slide-in-from-top-4 duration-300">
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 px-1">Nombre Completo</label>
              <div className="relative group">
                <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                <input 
                  type="text" 
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Tu nombre"
                  className="input-premium pl-12"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 px-1">Email</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="input-premium pl-12"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2 px-1">
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Contraseña</label>
              {isLogin && (
                <button 
                  type="button" 
                  onClick={() => alert('Por favor, contacta con el administrador del sistema para restablecer tu contraseña.')}
                  className="text-xs font-bold text-indigo-500 hover:text-indigo-600"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              )}
            </div>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input-premium pl-12"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="btn-premium w-full group mt-4"
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>{isLogin ? 'Iniciar Sesión' : 'Registrarse'}</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {isLogin ? '¿No tienes una cuenta?' : '¿Ya tienes una cuenta?'}
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="ml-2 font-bold text-indigo-500 hover:text-indigo-600 underline underline-offset-4"
            >
              {isLogin ? 'Regístrate gratis' : 'Inicia sesión'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

