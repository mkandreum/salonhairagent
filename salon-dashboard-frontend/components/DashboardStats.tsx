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

  if (loading) return <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
    {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl" />)}
  </div>

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.isArray(stats) && stats.map((stat) => {
        const Icon = stat.title?.includes('Citas') ? Calendar : 
                     stat.title?.includes('Clientes') ? Users : 
                     stat.title?.includes('Ingresos') ? DollarSign : TrendingUp

        return (
          <div key={stat.title} className="stat-card group">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{stat.title}</p>
                <h3 className="text-3xl font-bold text-slate-800 dark:text-white mt-2 group-hover:scale-105 transition-transform origin-left">{stat.value}</h3>
              </div>
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg transform group-hover:rotate-6 transition-transform`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
            </div>
            
            <div className="mt-6 flex items-center space-x-2">
              <div className={`flex items-center px-2 py-1 rounded-lg text-xs font-bold ${
                stat.trend === 'up' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30' : 'bg-red-100 text-red-600 dark:bg-red-900/30'
              }`}>
                {stat.trend === 'up' ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                {stat.change}
              </div>
              <span className="text-xs text-slate-400 font-medium">vs. ayer</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
