'use client'

import { useState, useEffect } from 'react'
import { Calendar, Users, DollarSign, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { fetchStats } from '@/lib/api'

export default function DashboardStats() {
  const [stats, setStats] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats().then(data => {
      setStats(data)
      setLoading(false)
    }).catch(err => {
      console.error("Failed to fetch stats", err)
      setLoading(false)
    })
  }, [])

  if (loading) return (
    <div className="col-span-2 md:col-span-4 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="app-card border border-amber-500/10 rounded-2xl h-28 md:h-32 anim-shimmer opacity-75" />
      ))}
    </div>
  )

  return (
    <div className="col-span-2 md:col-span-4 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
      {Array.isArray(stats) && stats.map((stat, index) => {
        const Icon = stat.title?.includes('Citas') ? Calendar :
                     stat.title?.includes('Clientes') ? Users :
                     stat.title?.includes('Ingresos') ? DollarSign : TrendingUp

        return (
          <div key={stat.title} className="app-card interactive-card p-4 md:p-6 group animate-fade-float-in" style={{ animationDelay: `${index * 60}ms` }}>
            <div className="flex items-start justify-between mb-3 md:mb-4">
              <div className="flex-1 min-w-0">
                <p className="text-[10px] md:text-xs font-bold text-slate-500 dark:text-slate-405 uppercase tracking-widest truncate">{stat.title}</p>
                <h3 className="text-xl md:text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 dark:from-amber-200 dark:via-amber-400 dark:to-amber-250 mt-1 md:mt-2 group-hover:scale-[1.03] transition-transform origin-left leading-none tracking-tight">{stat.value}</h3>
              </div>
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-slate-950 border border-amber-500/20 flex items-center justify-center shadow-lg flex-shrink-0 ml-2 group-hover:border-amber-500/40 group-hover:scale-105 transition-all duration-300">
                <Icon className="w-5 h-5 md:w-6 md:h-6 text-amber-400" />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <div className={`flex items-center px-2 py-0.5 md:py-1 rounded-full text-[10px] md:text-xs font-extrabold uppercase tracking-wider border ${
                stat.trend === 'up' 
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25 shadow-[0_0_8px_rgba(16,185,129,0.06)]' 
                  : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/25 shadow-[0_0_8px_rgba(244,63,94,0.06)]'
              }`}>
                {stat.trend === 'up' ? <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> : <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />}
                {stat.change}
              </div>
              <span className="text-[10px] md:text-xs text-slate-400 font-bold uppercase tracking-wider hidden md:inline">vs. ayer</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}