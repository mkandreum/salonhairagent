'use client'

import { useState, useEffect } from 'react'
import { BarChart3, TrendingUp, TrendingDown } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Cell } from 'recharts'
import { fetchAnalytics } from '@/lib/api'

interface AnalyticsDashboardProps {
  fullView?: boolean
}

export default function AnalyticsDashboard({ fullView = false }: AnalyticsDashboardProps) {
  const [data, setData] = useState<{revenueData: any[], serviceData: any[]} | null>(null)

  useEffect(() => {
    fetchAnalytics().then(setData)
  }, [])

  if (!data) return <div className="h-96 animate-pulse bg-slate-100 dark:bg-slate-800 rounded-2xl" />

  const { revenueData, serviceData } = data

  return (
    <div className="glass-card p-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Análisis de Negocio</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Rendimiento mensual</p>
          </div>
        </div>
        <select className="input-premium py-2 px-4 text-xs font-bold w-40">
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
              <LineChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Line type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={3} dot={{ r: 4, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-between mt-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
            <div>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Total Ingresos</p>
              <p className="text-2xl font-bold text-slate-800 dark:text-white">$35,300</p>
              <div className="flex items-center text-emerald-500 text-xs font-bold mt-1">
                <TrendingUp className="w-3 h-3 mr-1" />
                <span>+12.5% vs mes anterior</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Citas Totales</p>
              <p className="text-2xl font-bold text-slate-800 dark:text-white">962</p>
              <div className="flex items-center text-emerald-500 text-xs font-bold mt-1 justify-end">
                <TrendingUp className="w-3 h-3 mr-1" />
                <span>+8.2% vs mes anterior</span>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-bold text-slate-700 dark:text-slate-200 mb-6 text-sm uppercase tracking-wider">Distribución de Servicios</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={serviceData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontWeight: 600}} width={80} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                  {serviceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-6 space-y-3">
            {serviceData.slice(0, 3).map((service) => (
              <div key={service.name} className="flex items-center justify-between p-2 hover:bg-slate-50 dark:hover:bg-slate-800/30 rounded-xl transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: service.color }} />
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{service.name}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-bold text-slate-800 dark:text-white">{service.value}%</span>
                  <div className="w-24 bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-1000" 
                      style={{ width: `${service.value}%`, backgroundColor: service.color }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {!fullView && (
        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
          <button className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 font-bold text-sm transition-colors">
            Ver informes detallados →
          </button>
        </div>
      )}
    </div>
  )
}