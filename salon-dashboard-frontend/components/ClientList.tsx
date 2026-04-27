'use client'

import { useState, useEffect } from 'react'
import { User, Phone, Mail, Calendar, MoreVertical, Plus, Search } from 'lucide-react'
import { fetchClients } from '@/lib/api'

interface Client {
  id: number
  name: string
  phone: string
  email: string
  lastVisit: string
  totalVisits: number
  totalSpent: number
}

interface ClientListProps {
  fullView?: boolean
}

export default function ClientList({ fullView = false }: ClientListProps) {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchClients().then(data => {
      setClients(data)
      setLoading(false)
    }).catch(err => {
      console.error("Failed to fetch clients", err)
      setLoading(false)
    })
  }, [])

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.phone.includes(searchQuery)
  )

  if (loading) return <div className="glass-card p-8 animate-pulse h-[400px]" />

  return (
    <div className="glass-card p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center">
            <User className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Clientes Recientes</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Gestión de cartera</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-premium py-2 pl-9 pr-4 text-sm w-48"
            />
          </div>
          <button className="btn-premium py-2 px-4 text-sm">
            <Plus className="w-4 h-4 mr-2" />
            Añadir
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800">
              <th className="text-left py-4 px-2 text-slate-400 font-bold uppercase tracking-wider text-xs">Cliente</th>
              <th className="text-left py-4 px-2 text-slate-400 font-bold uppercase tracking-wider text-xs">Contacto</th>
              <th className="text-left py-4 px-2 text-slate-400 font-bold uppercase tracking-wider text-xs">Última Visita</th>
              <th className="text-left py-4 px-2 text-slate-400 font-bold uppercase tracking-wider text-xs text-center">Visitas</th>
              <th className="text-left py-4 px-2 text-slate-400 font-bold uppercase tracking-wider text-xs">Total</th>
              <th className="text-left py-4 px-2 text-slate-400 font-bold uppercase tracking-wider text-xs"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
            {filteredClients.map((client) => (
              <tr key={client.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                <td className="py-4 px-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center text-sm font-bold text-slate-600 dark:text-slate-300">
                      {client.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-100 leading-tight">{client.name}</p>
                      <p className="text-xs text-indigo-500 font-bold uppercase tracking-tighter mt-0.5">VIP</p>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-2">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2 text-slate-500 dark:text-slate-400">
                      <Phone className="w-3.5 h-3.5" />
                      <span className="text-xs font-medium">{client.phone}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-slate-500 dark:text-slate-400">
                      <Mail className="w-3.5 h-3.5" />
                      <span className="text-xs font-medium">{client.email}</span>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-2">
                  <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400 font-medium text-sm">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span>{client.lastVisit}</span>
                  </div>
                </td>
                <td className="py-4 px-2 text-center">
                  <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300">
                    {client.totalVisits}
                  </span>
                </td>
                <td className="py-4 px-2">
                  <span className="font-bold text-slate-800 dark:text-white">${client.totalSpent}</span>
                </td>
                <td className="py-4 px-2 text-right">
                  <button className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-all shadow-sm opacity-0 group-hover:opacity-100">
                    <MoreVertical className="w-5 h-5 text-slate-400" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!fullView && (
        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
          <button className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 font-bold text-sm transition-colors">
            Ver todos los clientes →
          </button>
        </div>
      )}
    </div>
  )
}
