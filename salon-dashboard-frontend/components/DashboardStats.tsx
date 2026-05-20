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
        <div key={i} className="mcard h-28 md:h-32 opacity-60 animate-pulse" />
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
          <div key={stat.title} className="mcard" style={{ animationDelay: `${index * 0.05}s` }}>
            <div className="mcard-header">
              <div className="mcard-label">{stat.title}</div>
              <div className="mcard-icon">
                <Icon size={14} />
              </div>
            </div>
            <div className="mcard-value">{stat.value}</div>
            <span className={`mcard-delta delta-${stat.trend === 'up' ? 'up' : 'down'}`}>
              {stat.trend === 'up' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
              {stat.change}
            </span>
          </div>
        )
      })}
    </div>
  )
}
