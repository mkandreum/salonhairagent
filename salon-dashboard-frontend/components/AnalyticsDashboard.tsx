'use client'

import { useState, useEffect } from 'react'
import { BarChart3, TrendingUp, TrendingDown } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, Cell } from 'recharts'
import { fetchAnalytics } from '@/lib/api'

interface AnalyticsDashboardProps {
  fullView?: boolean
  onViewAll?: () => void
}

const RANGE_MAP: Record<string, string> = {
  'Últimos 7 días': '7d',
  'Últimos 30 días': '30d',
  'Últimos 3 meses': '3m',
  'Último año': '1y',
}

export default function AnalyticsDashboard({ fullView = false, onViewAll }: AnalyticsDashboardProps) {
  const [data, setData] = useState<any>(null)
  const [timeRange, setTimeRange] = useState('Últimos 30 días')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    fetchAnalytics(RANGE_MAP[timeRange] || '30d')
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [timeRange])

  if (!data || loading) return <div className="h-96 animate-pulse app-card rounded-3xl" />

  const { revenueData = [], serviceData = [], totalRevenue = 0, totalAppointments = 0,
          revenueChangePct = 0, apptsChangePct = 0 } = data

  return (
    <div className="app-card p-4 sm:p-6 animate-fade-float-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 sm:mb-6">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-[#D4A843]/10 flex items-center justify-center border border-[#D4A843]/20">
            <BarChart3 className="w-6 h-6 text-[#D4A843]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Análisis de Negocio</h2>
            <p className="text-sm text-white/50 font-medium">Rendimiento del período seleccionado</p>
          </div>
        </div>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="input-premium py-2 px-4 text-xs font-bold w-44 text-white font-mono"
        >
          <option>Últimos 7 días</option>
          <option>Últimos 30 días</option>
          <option>Últimos 3 meses</option>
          <option>Último año</option>
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div>
          <h3 className="font-bold text-white mb-6 text-sm uppercase tracking-wider">Tendencia de Ingresos</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D4A843" stopOpacity={0.28}/>
                    <stop offset="95%" stopColor="#D4A843" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: 'rgba(255,255,255,0.4)', fontSize: 11}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: 'rgba(255,255,255,0.4)', fontSize: 12}} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'rgba(8,6,8,0.98)', borderRadius: '16px', border: '1px solid rgba(212,168,67,0.3)', boxShadow: '0 10px 30px rgba(0,0,0,0.6)', backdropFilter: 'blur(12px)' }}
                  itemStyle={{ color: '#fff' }}
                  labelStyle={{ color: '#D4A843', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#D4A843" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" dot={{ r: 4, fill: '#D4A843', strokeWidth: 2, stroke: '#0c101b' }} activeDot={{ r: 6 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-between mt-6 p-5 bg-white/[0.02] border border-white/5 rounded-2xl">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-white/40">Total Ingresos</p>
              <p className="text-white text-2xl font-bold">€{(totalRevenue || 0).toLocaleString()}</p>
              <div className={`flex items-center text-xs font-bold mt-1 ${revenueChangePct >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {revenueChangePct >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                <span>{revenueChangePct >= 0 ? '+' : ''}{revenueChangePct}% vs período anterior</span>
              </div>
            </div>
            <div className="text-right">
              <p className="font-mono text-[10px] uppercase tracking-widest text-white/40">Citas Totales</p>
              <p className="text-white text-2xl font-bold">{(totalAppointments || 0).toLocaleString()}</p>
              <div className={`flex items-center text-xs font-bold mt-1 justify-end ${apptsChangePct >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {apptsChangePct >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                <span>{apptsChangePct >= 0 ? '+' : ''}{apptsChangePct}% vs período anterior</span>
              </div>
            </div>
          </div>
        </div>
        <div>
          <h3 className="font-bold text-white mb-6 text-sm uppercase tracking-wider">Distribución de Servicios</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={serviceData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: 500}} width={80} />
                <Tooltip
                  cursor={{fill: 'rgba(255, 255, 255, 0.03)'}}
                  contentStyle={{ backgroundColor: 'rgba(8,6,8,0.98)', borderRadius: '16px', border: '1px solid rgba(212,168,67,0.3)', boxShadow: '0 10px 30px rgba(0,0,0,0.6)', backdropFilter: 'blur(12px)' }}
                  itemStyle={{ color: '#fff' }}
                  labelStyle={{ color: '#D4A843', fontWeight: 'bold' }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                  {Array.isArray(serviceData) && serviceData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color || '#D4A843'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-6 space-y-3">
            {Array.isArray(serviceData) && serviceData.slice(0, 3).map((service: any) => (
              <div key={service.name} className="flex items-center justify-between p-2.5 bg-white/[0.02] hover:bg-white/[0.04] rounded-xl transition-colors border border-transparent hover:border-white/5">
                <div className="flex items-center space-x-3">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: service.color || '#D4A843' }} />
                  <span className="text-sm font-semibold text-white/70">{service.name}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-bold text-white">{service.value}%</span>
                  <div className="w-24 bg-white/[0.05] rounded-full h-1.5 overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${service.value}%`, backgroundColor: service.color || '#D4A843' }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {!fullView && (
        <div className="mt-8 pt-6 border-t border-white/10 text-center">
          <button
            onClick={onViewAll}
            className="text-[#D4A843] hover:text-[#D4A843] font-bold text-sm transition-colors flex items-center justify-center mx-auto space-x-1"
          >
            <span>Ver informes detallados</span>
            <span>→</span>
          </button>
        </div>
      )}
    </div>
  )
}
