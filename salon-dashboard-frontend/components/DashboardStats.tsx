'use client'

import { useState, useEffect } from 'react'
import { Calendar, Users, DollarSign, TrendingUp, ArrowUpRight, ArrowDownRight, Sparkles } from 'lucide-react'
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
        <div key={i} className="mcard h-32 opacity-40 animate-pulse bg-white/[0.01] border-white/5" />
      ))}
    </div>
  )

  return (
    <div className="col-span-2 md:col-span-4 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
      {Array.isArray(stats) && stats.map((stat, index) => {
        const isCitas = stat.title?.includes('Citas')
        const isClientes = stat.title?.includes('Clientes')
        const isIngresos = stat.title?.includes('Ingresos')
        
        const Icon = isCitas ? Calendar :
                     isClientes ? Users :
                     isIngresos ? DollarSign : TrendingUp

        // Warm Luxe LED Configs
        const ledColor = isCitas ? 'gold' :
                         isClientes ? 'lavender' :
                         isIngresos ? 'green' : 'gold'

        return (
          <div 
            key={stat.title} 
            className="mcard relative group overflow-hidden" 
            style={{ animationDelay: `${index * 0.08}s` }}
          >
            {/* Soft Ambient Light inside Card */}
            <div className={`absolute -right-8 -top-8 w-20 h-20 rounded-full blur-2xl opacity-10 transition-opacity duration-500 group-hover:opacity-20 ${
              isCitas ? 'bg-[#E5C17B]' :
              isClientes ? 'bg-[#C084FC]' :
              isIngresos ? 'bg-[#34D399]' : 'bg-[#E5C17B]'
            }`} />

            <div className="mcard-header">
              <div className="flex items-center gap-2">
                <span className={`led-pearl ${ledColor} ${stat.trend === 'up' ? 'pulse' : ''}`} />
                <div className="mcard-label">{stat.title}</div>
              </div>
              <div className="mcard-icon transition-all duration-300">
                <Icon size={14} className="stroke-[2.5]" />
              </div>
            </div>
            
            <div className="mt-3">
              <div className="mcard-value font-extrabold flex items-baseline gap-1">
                <span>{stat.value}</span>
                {!stat.value?.toString().includes('%') && !stat.value?.toString().includes('€') && stat.title?.includes('Ocupación') && (
                  <span className="text-xs text-white/30 font-medium">%</span>
                )}
              </div>
              
              <div className="flex items-center justify-between mt-2 pt-1">
                <span className={`mcard-delta ${stat.trend === 'up' ? 'delta-up' : 'delta-down'}`}>
                  {stat.trend === 'up' ? <ArrowUpRight size={10} className="stroke-[3]" /> : <ArrowDownRight size={10} className="stroke-[3]" />}
                  <span>{stat.change}</span>
                </span>
                
                {stat.trend === 'up' && isIngresos && (
                  <span className="text-[9px] font-bold text-[#E5C17B]/60 tracking-wider uppercase flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5" />
                    <span>Luxe</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
