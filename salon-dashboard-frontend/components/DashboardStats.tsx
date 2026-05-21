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
    <div className="col-span-2 md:col-span-1 lg:col-span-4 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
      {[1, 2, 3, 4].map(i => <div key={i} className="h-28 md:h-32 rounded-2xl anim-shimmer" />)}
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
                <p className="text-xs md:text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate">{stat.title}</p>
                <h3 className="text-xl md:text-3xl font-bold text-slate-800 dark:text-white mt-1 md:mt-2 group-hover:scale-[1.02] transition-transform origin-left">{stat.value}</h3>
              </div>
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-amber-500/10 flex items-center justify-center shadow-sm flex-shrink-0 ml-2">
                <Icon className="w-5 h-5 md:w-6 md:h-6 text-amber-500" />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <div className={`flex items-center px-2 py-1 rounded-lg text-xs font-bold ${
                stat.trend === 'up' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30' : 'bg-red-100 text-red-600 dark:bg-red-900/30'
              }`}>
                {stat.trend === 'up' ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                {stat.change}
              </div>
              <span className="text-xs text-slate-400 font-medium hidden md:inline">vs. ayer</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}