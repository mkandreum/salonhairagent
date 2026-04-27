'use client'

import { useState, useEffect } from 'react'
import { Brain, Shield, Bug, Star, ArrowRight, RefreshCw } from 'lucide-react'
import { fetchTriage } from '@/lib/api'

export default function TriageView() {
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

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

      <div className="space-y-4">
        {results.length === 0 && !loading && (
          <div className="text-center py-12 text-slate-400">
            No hay resultados de auditoría disponibles.
          </div>
        )}
        
        {results.map((res) => (
          <div key={res.id} className="p-4 bg-white/50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700 flex items-center justify-between group hover:border-indigo-500/30 transition-all">
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
