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
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 dark:bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
            <BarChart3 className="w-6 h-6 text-amber-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Análisis de Negocio</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Rendimiento del período seleccionado</p>
          </div>
        </div>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="input-premium py-2 px-4 text-xs font-bold w-44"
        >
          <option>Últimos 7 días</option>
          <option>Últimos 30 días</option>
          <option>Últimos 3 meses</option>
          <option>Último año</option>
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div>
          <h3 className="font-bold text-slate-700 dark:text-slate-200 mb-6 text-sm uppercase tracking-wider">Tendencia de Ingresos</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d4af37" stopOpacity={0.28}/>
                    <stop offset="95%" stopColor="#d4af37" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'rgba(5, 8, 12, 0.95)', borderRadius: '16px', border: '1px solid rgba(212, 175, 55, 0.3)', boxShadow: '0 10px 30px rgba(0,0,0,0.6)', backdropFilter: 'blur(12px)' }}
                  itemStyle={{ color: '#fff' }}
                  labelStyle={{ color: '#d4af37', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#d4af37" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" dot={{ r: 4, fill: '#d4af37', strokeWidth: 2, stroke: '#0c101b' }} activeDot={{ r: 6 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-between mt-6 p-5 bg-slate-100/35 dark:bg-slate-950/45 rounded-3xl border border-slate-200/20 dark:border-slate-800/40 shadow-inner">
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">Total Ingresos</p>
              <p className="text-2xl font-extrabold text-slate-800 dark:text-white">€{(totalRevenue || 0).toLocaleString()}</p>
              <div className={`flex items-center text-xs font-bold mt-1 ${revenueChangePct >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                {revenueChangePct >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                <span>{revenueChangePct >= 0 ? '+' : ''}{revenueChangePct}% vs período anterior</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">Citas Totales</p>
              <p className="text-2xl font-extrabold text-slate-800 dark:text-white">{(totalAppointments || 0).toLocaleString()}</p>
              <div className={`flex items-center text-xs font-bold mt-1 justify-end ${apptsChangePct >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                {apptsChangePct >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                <span>{apptsChangePct >= 0 ? '+' : ''}{apptsChangePct}% vs período anterior</span>
              </div>
            </div>
          </div>
        </div>
        <div>
          <h3 className="font-bold text-slate-700 dark:text-slate-200 mb-6 text-sm uppercase tracking-wider">Distribución de Servicios</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={serviceData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" horizontal={false} />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 500}} width={80} />
                <Tooltip
                  cursor={{fill: 'rgba(255, 255, 255, 0.03)'}}
                  contentStyle={{ backgroundColor: 'rgba(5, 8, 12, 0.95)', borderRadius: '16px', border: '1px solid rgba(212, 175, 55, 0.3)', boxShadow: '0 10px 30px rgba(0,0,0,0.6)', backdropFilter: 'blur(12px)' }}
                  itemStyle={{ color: '#fff' }}
                  labelStyle={{ color: '#d4af37', fontWeight: 'bold' }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                  {Array.isArray(serviceData) && serviceData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color || '#d4af37'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-6 space-y-3">
            {Array.isArray(serviceData) && serviceData.slice(0, 3).map((service: any) => (
              <div key={service.name} className="flex items-center justify-between p-2.5 hover:bg-slate-100/40 dark:hover:bg-slate-950/40 rounded-[14px] transition-colors border border-transparent hover:border-slate-200/20 dark:hover:border-slate-800/40">
                <div className="flex items-center space-x-3">
                  <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: service.color || '#d4af37' }} />
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{service.name}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-bold text-slate-800 dark:text-white">{service.value}%</span>
                  <div className="w-24 bg-slate-200 dark:bg-slate-950/80 rounded-full h-1.5 overflow-hidden border border-slate-200/10 dark:border-slate-800/30">
                    <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${service.value}%`, backgroundColor: service.color || '#d4af37' }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {!fullView && (
        <div className="mt-8 pt-6 border-t border-slate-200/50 dark:border-slate-800 text-center">
          <button
            onClick={onViewAll}
            className="text-amber-600 dark:text-amber-400 hover:text-amber-500 font-bold text-sm transition-colors flex items-center justify-center mx-auto space-x-1"
          >
            <span>Ver informes detallados</span>
            <span>→</span>
          </button>
        </div>
      )}
    </div>
  )
}
