'use client'

import { useState, useEffect } from 'react'
import { Brain, Shield, Bug, Star, ArrowRight, RefreshCw, X, MessageSquare, Zap } from 'lucide-react'
import { fetchTriage } from '@/lib/api'

export default function TriageView() {
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTicket, setSelectedTicket] = useState<any>(null)

  const loadData = () => {
    setLoading(true)
    fetchTriage().then(data => {
      setResults(data)
      setLoading(false)
    }).catch(err => {
      console.error(err)
      setLoading(false)
    })
  }

  useEffect(() => {
    loadData()
  }, [])

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'auth': return <Shield className="w-5 h-5 text-purple-500" />
      case 'bug': return <Bug className="w-5 h-5 text-rose-500" />
      case 'feature': return <Star className="w-5 h-5 text-amber-500" />
      default: return <Brain className="w-5 h-5 text-blue-500" />
    }
  }

  const handleProcess = (id: string) => {
    // In a real app, we would call an API here
    setResults(results.filter(r => r.id !== id))
    setSelectedTicket(null)
    alert('Ticket procesado con éxito y asignado al departamento correspondiente.')
  }

  return (
    <div className="glass-card p-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center">
            <Brain className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Auditoría de IA (Triage)</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Clasificación automática de tickets</p>
          </div>
        </div>
        <button onClick={loadData} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all">
          <RefreshCw className={`w-5 h-5 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {selectedTicket && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="glass-card p-8 w-full max-w-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center">
                  {getCategoryIcon(selectedTicket.category)}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white">{selectedTicket.subject}</h3>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{selectedTicket.ticket_id}</p>
                </div>
              </div>
              <button onClick={() => setSelectedTicket(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700">
                <div className="flex items-center space-x-2 mb-2 text-slate-500">
                  <MessageSquare className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">Cuerpo del Ticket</span>
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed italic">
                  "{selectedTicket.body || 'No hay descripción disponible.'}"
                </p>
              </div>

              <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-900/30">
                <div className="flex items-center space-x-2 mb-2 text-indigo-600 dark:text-indigo-400">
                  <Zap className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">Acción Sugerida por IA</span>
                </div>
                <p className="text-sm font-semibold text-slate-800 dark:text-white">
                  {selectedTicket.suggested_action || 'Revisar manualmente el ticket y asignar al departamento correspondiente.'}
                </p>
              </div>

              <div className="flex space-x-3">
                <button onClick={() => handleProcess(selectedTicket.id)} className="flex-1 btn-premium py-3">Procesar Ahora</button>
                <button onClick={() => setSelectedTicket(null)} className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 py-3 rounded-xl text-sm font-bold transition-all">
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {results.length === 0 && !loading && (
          <div className="text-center py-12 text-slate-400">
            No hay resultados de auditoría disponibles.
          </div>
        )}
        
        {results.map((res) => (
          <div 
            key={res.id} 
            onClick={() => setSelectedTicket(res)}
            className="p-4 bg-white/50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700 flex items-center justify-between group hover:border-indigo-500/30 transition-all cursor-pointer"
          >
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center">
                {getCategoryIcon(res.category)}
              </div>
              <div>
                <p className="font-bold text-slate-800 dark:text-white">{res.subject}</p>
                <div className="flex items-center space-x-3 mt-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{res.ticket_id}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    res.priority === 'high' ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {res.priority.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-xs font-bold text-indigo-500 uppercase">{res.category}</p>
                <p className="text-[10px] text-slate-400">{new Date(res.timestamp).toLocaleString()}</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowRight className="w-4 h-4 text-indigo-600" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
