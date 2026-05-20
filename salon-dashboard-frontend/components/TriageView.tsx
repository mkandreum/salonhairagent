'use client'

import { useState, useEffect } from 'react'
import { Brain, Shield, Bug, Star, ArrowRight, RefreshCw, X, MessageSquare, Zap, Plus, Loader2, AlertCircle, CheckCircle2, Clock, Scissors } from 'lucide-react'
import { fetchTriage, deleteTriage } from '@/lib/api'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || ''

async function analyzeWithAI(subject: string, body: string) {
  const token = typeof window !== 'undefined' ? (() => { try { return localStorage.getItem('salon_pro_token') } catch { return null } })() : null
  const res = await fetch(`${API_BASE}/api/triage/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify({ subject, body })
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || 'Error al analizar')
  }
  return res.json()
}

const CATEGORY_CONFIG: Record<string, { icon: any; color: string; label: string }> = {
  cita:        { icon: Scissors,    color: 'text-indigo-500',  label: 'Cita' },
  queja:       { icon: AlertCircle, color: 'text-rose-500',    label: 'Queja' },
  consulta:    { icon: MessageSquare,color: 'text-blue-500',   label: 'Consulta' },
  cancelacion: { icon: X,           color: 'text-orange-500',  label: 'Cancelación' },
  pago:        { icon: CheckCircle2,color: 'text-emerald-500', label: 'Pago' },
  auth:        { icon: Shield,       color: 'text-purple-500', label: 'Auth' },
  bug:         { icon: Bug,          color: 'text-rose-500',   label: 'Bug' },
  feature:     { icon: Star,         color: 'text-amber-500',  label: 'Feature' },
  otro:        { icon: Brain,        color: 'text-blue-500',   label: 'Otro' },
}

function getCategoryConfig(cat: string) {
  return CATEGORY_CONFIG[cat] || CATEGORY_CONFIG['otro']
}

export default function TriageView() {
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTicket, setSelectedTicket] = useState<any>(null)
  const [showAnalyzer, setShowAnalyzer] = useState(false)
  const [analyzeSubject, setAnalyzeSubject] = useState('')
  const [analyzeBody, setAnalyzeBody] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [analyzeError, setAnalyzeError] = useState('')
  const [analyzeSuccess, setAnalyzeSuccess] = useState(false)

  const loadData = () => {
    setLoading(true)
    fetchTriage().then(data => { setResults(data); setLoading(false) })
      .catch(err => { console.error(err); setLoading(false) })
  }

  useEffect(() => { loadData() }, [])

  const handleProcess = async (id: string) => {
    try {
      await deleteTriage(id)
      setResults(results.filter(r => r.id !== id))
      setSelectedTicket(null)
    } catch { alert('Error al procesar el ticket') }
  }

  const handleAnalyze = async () => {
    if (!analyzeSubject.trim() && !analyzeBody.trim()) {
      setAnalyzeError('Escribe al menos el asunto o el mensaje del cliente.')
      return
    }
    setAnalyzing(true)
    setAnalyzeError('')
    setAnalyzeSuccess(false)
    try {
      await analyzeWithAI(analyzeSubject, analyzeBody)
      setAnalyzeSuccess(true)
      setAnalyzeSubject('')
      setAnalyzeBody('')
      setTimeout(() => { setShowAnalyzer(false); setAnalyzeSuccess(false); loadData() }, 1200)
    } catch (err: any) {
      setAnalyzeError(err.message || 'Error desconocido')
    } finally {
      setAnalyzing(false)
    }
  }

  return (
    <div className="app-card p-4 sm:p-6 animate-fade-float-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 sm:mb-6">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
            <Brain className="w-6 h-6 text-indigo-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Auditoría IA — Triage</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Analiza mensajes de clientes con IA y clasifícalos automáticamente</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button onClick={loadData} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all">
            <RefreshCw className={`w-5 h-5 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => { setShowAnalyzer(true); setAnalyzeError(''); setAnalyzeSuccess(false) }}
            className="btn-premium primary-btn py-2.5 px-4 text-sm ripple-host"
          >
            <Plus className="w-4 h-4 mr-2" />
            <span>Analizar con IA</span>
          </button>
        </div>
      </div>

      {/* Modal Analizar con IA */}
      {showAnalyzer && (
        <div className="fixed inset-0 bg-slate-950/65 backdrop-blur-md z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="app-card rounded-t-[32px] sm:rounded-2xl w-full sm:max-w-lg p-6 max-h-[85vh] overflow-y-auto pb-[calc(2rem+env(safe-area-inset-bottom))] animate-fade-float-in border-t border-slate-200/50 dark:border-amber-500/10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                  <Zap className="w-5 h-5 text-indigo-500" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white">Analizar Mensaje con IA</h3>
                  <p className="text-xs text-slate-400">Gemini / OpenAI clasifica el mensaje automáticamente</p>
                </div>
              </div>
              <button onClick={() => setShowAnalyzer(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Asunto o nombre del cliente</label>
                <input
                  type="text"
                  value={analyzeSubject}
                  onChange={e => setAnalyzeSubject(e.target.value)}
                  placeholder="Ej: Quiero cancelar mi cita de mañana"
                  className="input-premium w-full text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Mensaje del cliente</label>
                <textarea
                  value={analyzeBody}
                  onChange={e => setAnalyzeBody(e.target.value)}
                  placeholder="Pega aquí el mensaje completo del cliente..."
                  rows={4}
                  className="input-premium w-full text-sm resize-none"
                />
              </div>

              {analyzeError && (
                <div className="p-3 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800/30 rounded-xl text-sm text-rose-700 dark:text-rose-300">
                  ⚠️ {analyzeError}
                </div>
              )}
              {analyzeSuccess && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/30 rounded-xl text-sm text-emerald-700 dark:text-emerald-300">
                  ✅ ¡Analizado y guardado correctamente!
                </div>
              )}

              <div className="flex space-x-3 pt-2">
                <button
                  onClick={handleAnalyze}
                  disabled={analyzing}
                  className="flex-1 btn-premium primary-btn py-3 flex items-center justify-center space-x-2 disabled:opacity-60"
                >
                  {analyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                  <span>{analyzing ? 'Analizando...' : 'Analizar Ahora'}</span>
                </button>
                <button onClick={() => setShowAnalyzer(false)} className="flex-1 btn-accent py-3 rounded-2xl">
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Detalle Ticket */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-slate-950/65 backdrop-blur-md z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="app-card rounded-t-[32px] sm:rounded-2xl w-full sm:max-w-2xl p-6 sm:p-8 max-h-[85vh] overflow-y-auto pb-[calc(2rem+env(safe-area-inset-bottom))] animate-fade-float-in border-t border-slate-200/50 dark:border-amber-500/10 animate-fade-float-in">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-950/80 border border-slate-200/20 dark:border-slate-800/40 flex items-center justify-center">
                  {(() => { const cfg = getCategoryConfig(selectedTicket.category); const Icon = cfg.icon; return <Icon className={`w-5 h-5 ${cfg.color}`} /> })()}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white">{selectedTicket.subject}</h3>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{getCategoryConfig(selectedTicket.category).label} · {selectedTicket.priority?.toUpperCase()}</p>
                </div>
              </div>
              <button onClick={() => setSelectedTicket(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <div className="space-y-6">
              {selectedTicket.body && (
                <div className="p-4 bg-slate-100/35 dark:bg-slate-950/60 rounded-2xl border border-slate-200/10 dark:border-slate-800/40">
                  <div className="flex items-center space-x-2 mb-2 text-slate-500">
                    <MessageSquare className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">Mensaje del Cliente</span>
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed italic">"{selectedTicket.body}"</p>
                </div>
              )}
              <div className="p-4 bg-indigo-50/40 dark:bg-indigo-950/30 rounded-2xl border border-indigo-500/15 dark:border-indigo-500/10">
                <div className="flex items-center space-x-2 mb-2 text-indigo-500 dark:text-indigo-400">
                  <Zap className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">Acción Sugerida por IA</span>
                </div>
                <p className="text-sm font-semibold text-slate-800 dark:text-white">
                  {selectedTicket.suggested_action || 'Revisar manualmente y asignar al equipo.'}
                </p>
              </div>
              <div className="flex items-center space-x-3 text-xs text-slate-400">
                <Clock className="w-3.5 h-3.5 animate-pulse" />
                <span>{new Date(selectedTicket.timestamp).toLocaleString('es-ES')}</span>
              </div>
              <div className="flex space-x-3">
                <button onClick={() => handleProcess(selectedTicket.id)} className="flex-1 btn-premium primary-btn py-3 flex justify-center items-center">Marcar como Procesado</button>
                <button onClick={() => setSelectedTicket(null)} className="flex-1 btn-accent py-3 rounded-2xl">Cerrar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lista */}
      <div className="space-y-4">
        {loading && (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mx-auto" />
          </div>
        )}
        {!loading && results.length === 0 && (
          <div className="text-center py-16">
            <Brain className="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto mb-4" />
            <p className="font-bold text-slate-500 dark:text-slate-400">Sin análisis aún</p>
            <p className="text-sm text-slate-400 mt-1">Pulsa <strong>Analizar con IA</strong> para clasificar un mensaje de cliente</p>
          </div>
        )}
        {results.map((res) => {
          const cfg = getCategoryConfig(res.category)
          const Icon = cfg.icon
          return (
            <div
              key={res.id}
              onClick={() => setSelectedTicket(res)}
              className="p-4 bg-slate-50/20 dark:bg-slate-950/40 rounded-2xl border border-slate-200/40 dark:border-slate-800 hover:border-indigo-500/30 dark:hover:border-indigo-500/30 hover:bg-slate-50/40 dark:hover:bg-slate-950/60 shadow-sm flex items-center justify-between group transition-all duration-300 cursor-pointer"
            >
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-950 flex items-center justify-center border border-slate-200/20 dark:border-slate-800/40">
                  <Icon className={`w-5 h-5 ${cfg.color}`} />
                </div>
                <div>
                  <p className="font-bold text-slate-800 dark:text-white leading-snug">{res.subject}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                      res.priority === 'high' ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20' :
                      res.priority === 'medium' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20' :
                      'bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
                    }`}>{res.priority?.toUpperCase()}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">{cfg.label}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <p className="text-[10px] text-slate-400 hidden sm:block">{new Date(res.timestamp).toLocaleString('es-ES')}</p>
                <div className="w-8 h-8 rounded-full bg-indigo-500/10 dark:bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowRight className="w-4 h-4 text-indigo-500" />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
