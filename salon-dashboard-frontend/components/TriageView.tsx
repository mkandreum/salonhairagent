'use client'

import { useState, useEffect } from 'react'
import { Brain, Shield, Bug, Star, ArrowRight, RefreshCw, X, MessageSquare, Zap, Plus, Loader2, AlertCircle, CheckCircle2, Clock, Scissors, Sparkles } from 'lucide-react'
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

const CATEGORY_CONFIG: Record<string, { icon: any; color: string; bg: string; label: string }> = {
  cita:        { icon: Scissors,      color: 'text-[#E5C17B]', bg: 'bg-[#E5C17B]/10 border-[#E5C17B]/20', label: 'Cita' },
  queja:       { icon: AlertCircle,   color: 'text-rose-400',   bg: 'bg-rose-400/8 border-rose-400/15',   label: 'Queja' },
  consulta:    { icon: MessageSquare, color: 'text-blue-300',  bg: 'bg-blue-300/8 border-blue-300/15',  label: 'Consulta' },
  cancelacion: { icon: X,             color: 'text-orange-400', bg: 'bg-orange-400/8 border-orange-400/15', label: 'Cancelación' },
  pago:        { icon: CheckCircle2,  color: 'text-emerald-400', bg: 'bg-emerald-400/8 border-emerald-400/15', label: 'Pago' },
  auth:        { icon: Shield,        color: 'text-purple-300', bg: 'bg-purple-300/8 border-purple-300/15', label: 'Auth' },
  bug:         { icon: Bug,           color: 'text-rose-400',   bg: 'bg-rose-400/8 border-rose-400/15',   label: 'Bug' },
  feature:     { icon: Star,          color: 'text-[#E5C17B]', bg: 'bg-[#E5C17B]/10 border-[#E5C17B]/20', label: 'Feature' },
  otro:        { icon: Brain,         color: 'text-blue-300',  bg: 'bg-blue-300/8 border-blue-300/15',  label: 'Otro' },
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
    <div className="app-card p-5 sm:p-8 animate-fadeUp relative overflow-hidden">
      {/* Background elegant lighting spot inside panel */}
      <div className="absolute left-1/3 top-0 w-60 h-60 rounded-full bg-[#C084FC]/5 blur-3xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-6 sm:mb-8 pb-6 border-b border-white/[0.04] relative z-10">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#C084FC]/15 to-[#C084FC]/5 flex items-center justify-center border border-[#C084FC]/25 shadow-lg shadow-black/30">
            <Brain className="w-6 h-6 text-[#C084FC] drop-shadow-[0_0_8px_rgba(192,132,252,0.4)]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <span>Auditoría IA — Triage</span>
              <span className="led-pearl lavender pulse w-1.5 h-1.5" />
            </h2>
            <p className="text-xs sm:text-sm text-white/45 mt-1 leading-snug">Asistente Inteligente de Conserjería para clasificar y responder mensajes del salón</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button onClick={loadData} className="p-3 bg-white/[0.02] border border-white/5 hover:border-white/10 rounded-xl transition-all duration-300">
            <RefreshCw className={`w-4 h-4 text-white/50 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => { setShowAnalyzer(true); setAnalyzeError(''); setAnalyzeSuccess(false) }}
            className="btn-premium py-3 px-5 text-xs tracking-wider font-bold shadow-lg shadow-[#E5C17B]/5"
          >
            <Plus className="w-3.5 h-3.5 mr-2 stroke-[2.5]" />
            <span>Analizar con IA</span>
          </button>
        </div>
      </div>

      {/* Modal Analizar con IA */}
      {showAnalyzer && (
        <div className="fixed inset-0 bg-[#090709]/85 backdrop-blur-md z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="app-card-overlay rounded-t-[32px] sm:rounded-3xl w-full sm:max-w-lg p-6 sm:p-8 max-h-[85vh] overflow-y-auto pb-[calc(2.5rem+env(safe-area-inset-bottom))] animate-fadeUp border-[#C084FC]/20 shadow-2xl shadow-black/80 relative">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#C084FC]/30 to-transparent" />
            
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-[#C084FC]/10 flex items-center justify-center border border-[#C084FC]/20 shadow-inner">
                  <Zap className="w-5 h-5 text-[#C084FC] animate-pulse" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white tracking-tight">Analizar con IA</h3>
                  <p className="text-xs text-white/40">Conserje virtual procesa y clasifica el mensaje</p>
                </div>
              </div>
              <button onClick={() => setShowAnalyzer(false)} className="p-2 bg-white/[0.02] hover:bg-white/[0.06] rounded-xl transition-all duration-300">
                <X className="w-4 h-4 text-white/40" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="block font-mono text-[9px] uppercase tracking-widest text-white/40 font-bold px-1">Asunto / Nombre del Cliente</label>
                <input
                  type="text"
                  value={analyzeSubject}
                  onChange={e => setAnalyzeSubject(e.target.value)}
                  placeholder="Ej: Sofía Pérez - Reprogramar corte de pelo"
                  className="input-premium w-full text-sm"
                />
              </div>
              
              <div className="space-y-1.5">
                <label className="block font-mono text-[9px] uppercase tracking-widest text-white/40 font-bold px-1">Cuerpo del Mensaje</label>
                <textarea
                  value={analyzeBody}
                  onChange={e => setAnalyzeBody(e.target.value)}
                  placeholder="Pega aquí el mensaje del cliente de WhatsApp o Email..."
                  rows={4}
                  className="input-premium w-full text-sm resize-none"
                />
              </div>

              {analyzeError && (
                <div className="p-3.5 bg-rose-500/8 border border-rose-500/15 rounded-xl text-xs font-semibold text-rose-400">
                  ⚠️ {analyzeError}
                </div>
              )}
              {analyzeSuccess && (
                <div className="p-3.5 bg-emerald-500/8 border border-emerald-500/15 rounded-xl text-xs font-semibold text-emerald-400">
                  ✅ ¡Analizado y procesado con éxito por el Conserje IA!
                </div>
              )}

              <div className="flex space-x-3 pt-3">
                <button
                  onClick={handleAnalyze}
                  disabled={analyzing}
                  className="flex-1 btn-premium py-3.5 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:pointer-events-none shadow-md"
                >
                  {analyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  <span>{analyzing ? 'Procesando...' : 'Iniciar Análisis'}</span>
                </button>
                <button onClick={() => setShowAnalyzer(false)} className="flex-1 btn-accent py-3.5 rounded-xl">
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Detalle Ticket */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-[#090709]/85 backdrop-blur-md z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="app-card-overlay rounded-t-[32px] sm:rounded-3xl w-full sm:max-w-2xl p-6 sm:p-8 max-h-[85vh] overflow-y-auto pb-[calc(2.5rem+env(safe-area-inset-bottom))] animate-fadeUp border-white/10 shadow-2xl shadow-black/80 relative">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#E5C17B]/20 to-transparent" />
            
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-center shadow-inner">
                  {(() => { const cfg = getCategoryConfig(selectedTicket.category); const Icon = cfg.icon; return <Icon className={`w-5 h-5 ${cfg.color}`} /> })()}
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight leading-snug">{selectedTicket.subject}</h3>
                  <p className="text-[9px] text-[#E5C17B] font-mono font-bold uppercase tracking-widest mt-1">
                    {getCategoryConfig(selectedTicket.category).label} · Prioridad {selectedTicket.priority?.toUpperCase()}
                  </p>
                </div>
              </div>
              <button onClick={() => setSelectedTicket(null)} className="p-2 bg-white/[0.02] hover:bg-white/[0.06] rounded-xl transition-all duration-300">
                <X className="w-4 h-4 text-white/40" />
              </button>
            </div>
            
            <div className="space-y-5">
              {selectedTicket.body && (
                <div className="p-4 bg-white/[0.01] border border-white/5 rounded-2xl shadow-inner relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-white/[0.01] rounded-full blur-xl pointer-events-none" />
                  <div className="flex items-center space-x-2 mb-2.5 text-white/30 font-mono text-[9px] uppercase tracking-widest font-bold">
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Mensaje Recibido</span>
                  </div>
                  <p className="text-sm text-white/75 leading-relaxed italic font-medium px-1">"{selectedTicket.body}"</p>
                </div>
              )}
              
              <div className="p-4.5 bg-gradient-to-br from-[#E5C17B]/8 to-transparent border border-[#E5C17B]/15 rounded-2xl relative overflow-hidden">
                <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-[#E5C17B]/5 rounded-full blur-xl pointer-events-none" />
                <div className="flex items-center space-x-2 mb-2.5 text-[#E5C17B] font-mono text-[9px] uppercase tracking-widest font-bold">
                  <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                  <span>Respuesta Sugerida por Conserje IA</span>
                </div>
                <p className="text-sm font-semibold text-white/90 leading-relaxed px-1">
                  {selectedTicket.suggested_action || 'Revisar manualmente y agendar con estilista disponible.'}
                </p>
              </div>
              
              <div className="flex items-center space-x-2 text-[10px] text-white/30 font-mono font-medium">
                <Clock className="w-3.5 h-3.5" />
                <span>Fecha de recepción: {new Date(selectedTicket.timestamp).toLocaleString('es-ES')}</span>
              </div>
              
              <div className="flex space-x-3 pt-2">
                <button onClick={() => handleProcess(selectedTicket.id)} className="flex-1 btn-premium py-3.5 flex justify-center items-center font-bold">
                  <span>Marcar como Completado</span>
                </button>
                <button onClick={() => setSelectedTicket(null)} className="flex-1 btn-accent py-3.5 rounded-xl font-bold">
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lista de Auditoría */}
      <div className="space-y-3.5 relative z-10">
        {loading && (
          <div className="text-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-[#E5C17B] mx-auto" />
            <p className="text-xs text-white/35 font-mono tracking-widest uppercase mt-4">Cargando Auditoría...</p>
          </div>
        )}
        
        {!loading && results.length === 0 && (
          <div className="text-center py-20 bg-white/[0.005] border border-white/[0.02] rounded-3xl">
            <Brain className="w-10 h-10 text-white/15 mx-auto mb-4" />
            <p className="font-bold text-white/40 tracking-tight">Sin análisis en cola</p>
            <p className="text-xs text-white/25 mt-1.5 max-w-xs mx-auto">Pulsa el botón superior para simular e iniciar un análisis de conserjería con IA en tiempo real.</p>
          </div>
        )}
        
        {results.map((res) => {
          const cfg = getCategoryConfig(res.category)
          const Icon = cfg.icon
          return (
            <div
              key={res.id}
              onClick={() => setSelectedTicket(res)}
              className="p-4 bg-white/[0.01] border border-white/[0.04] rounded-2xl hover:border-[#E5C17B]/25 hover:bg-white/[0.02] flex items-center justify-between group transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md"
            >
              <div className="flex items-center space-x-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-inner ${cfg.bg}`}>
                  <Icon className={`w-4.5 h-4.5 ${cfg.color} stroke-[2.2]`} />
                </div>
                <div>
                  <p className="font-bold text-white/90 text-sm leading-snug group-hover:text-white transition-colors">{res.subject}</p>
                  <div className="flex items-center space-x-2.5 mt-1.5">
                    <span className={`text-[8px] font-extrabold px-2 py-0.5 rounded-md tracking-wider uppercase font-mono ${
                      res.priority === 'high' ? 'bg-rose-500/10 text-rose-300 border border-rose-500/15 shadow-sm' :
                      res.priority === 'medium' ? 'bg-[#E5C17B]/10 text-[#E5C17B] border border-[#E5C17B]/15' :
                      'bg-white/[0.04] text-white/40 border border-white/5'
                    }`}>{res.priority?.toUpperCase()}</span>
                    <span className="text-[9px] font-bold text-white/35 uppercase tracking-wider font-mono">{cfg.label}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <p className="text-[10px] text-white/30 font-mono hidden sm:block font-medium">{new Date(res.timestamp).toLocaleTimeString('es-ES', {hour: '2-digit', minute:'2-digit'})}</p>
                <div className="w-8 h-8 rounded-full bg-[#E5C17B]/10 flex items-center justify-center border border-[#E5C17B]/20 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-1 group-hover:translate-x-0 shadow-sm shadow-[#E5C17B]/5">
                  <ArrowRight className="w-3.5 h-3.5 text-[#E5C17B] stroke-[2.5]" />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
