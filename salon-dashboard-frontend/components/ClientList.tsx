'use client'

import { useState, useEffect } from 'react'
import { User, Phone, Mail, Calendar, Plus, Search, X, Trash2, Edit2, ChevronRight } from 'lucide-react'
import { fetchClients, createClient, deleteClient as apiDeleteClient, updateClient } from '@/lib/api'


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
  onViewAll?: () => void
  searchQuery?: string
}

export default function ClientList({ fullView = false, onViewAll, searchQuery = '' }: ClientListProps) {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [localSearchQuery, setLocalSearchQuery] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  })

  const loadData = async () => {
    setLoading(true)
    try {
      const data = await fetchClients()
      setClients(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingClient) {
        await updateClient(editingClient.id, formData)
      } else {
        await createClient(formData)
      }
      setIsModalOpen(false)
      setEditingClient(null)
      loadData()
      setFormData({ name: '', email: '', phone: '' })
    } catch (err) {
      alert(editingClient ? 'Error al actualizar' : 'Error al añadir')
    }
  }

  const handleEdit = (client: Client) => {
    setEditingClient(client)
    setFormData({ name: client.name, email: client.email, phone: client.phone })
    setIsModalOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (confirm('¿Eliminar este cliente?')) {
      try {
        await apiDeleteClient(id)
        loadData()
      } catch (err) { alert('Error al eliminar') }
    }
  }

  const effectiveSearchQuery = searchQuery || localSearchQuery
  const filteredClients = Array.isArray(clients) ? clients.filter(client =>
    (client.name && client.name.toLowerCase().includes(effectiveSearchQuery.toLowerCase())) ||
    (client.email && client.email.toLowerCase().includes(effectiveSearchQuery.toLowerCase())) ||
    (client.phone && client.phone.includes(effectiveSearchQuery))
  ) : []

  if (loading) return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 md:p-6 shadow-sm border border-slate-200 dark:border-slate-800 animate-pulse h-[300px] md:h-[400px]" />
  )

  const displayClients = filteredClients.slice(0, fullView ? undefined : 6)

  return (
    <div className="app-card p-4 md:p-6 animate-fade-float-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 md:mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <User className="w-5 h-5 text-slate-600 dark:text-slate-300" />
          </div>
          <div>
            <h2 className="text-base md:text-lg font-bold text-slate-800 dark:text-white">Clientes</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">{filteredClients.length} clientes</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {fullView && (
            <div className="relative flex-1 sm:flex-none">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar..."
                value={localSearchQuery}
                onChange={(e) => setLocalSearchQuery(e.target.value)}
                className="w-full sm:w-48 px-4 py-2 pl-9 bg-white/70 dark:bg-[#0a0d16]/75 border border-slate-200/40 dark:border-amber-500/10 rounded-full focus:outline-none focus:border-amber-500/50 focus:ring-4 focus:ring-amber-500/10 text-xs sm:text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 transition-all duration-300 shadow-sm"
              />
            </div>
          )}
          <button onClick={() => setIsModalOpen(true)} className="btn-premium primary-btn py-2 px-4 text-sm ripple-host">
            <Plus className="w-4 h-4 mr-2 inline" />
            <span className="hidden sm:inline">Añadir Cliente</span>
            <span className="sm:hidden">+</span>
          </button>
        </div>
      </div>

      {/* Mobile Cards View */}
      <div className="block md:hidden space-y-3">
        {displayClients.map((client: any) => (
          <div key={client.id} className="bg-slate-50/50 dark:bg-slate-950/40 rounded-2xl p-4 border border-slate-200/40 dark:border-slate-800/60 shadow-sm hover:border-amber-500/20 transition-all">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0c101b] to-[#1e293b] border border-amber-500/20 flex items-center justify-center text-sm font-bold text-amber-400 shadow-md">
                  {client.name?.split(' ').map((n: string) => n[0]).join('') || '??'}
                </div>
                <div>
                  <p className="font-bold text-slate-800 dark:text-white leading-tight">{client.name}</p>
                  <span className="inline-flex px-1.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-widest bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shadow-[0_0_8px_rgba(212,175,55,0.06)] mt-1.5">VIP</span>
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => handleEdit(client)} className="p-2 hover:bg-amber-500/10 hover:text-amber-500 rounded-lg text-slate-400 dark:text-slate-500 transition-colors">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(client.id)} className="p-2 hover:bg-rose-500/15 hover:text-rose-500 rounded-lg text-slate-400 dark:text-slate-500 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center space-x-1.5">
                <Phone className="w-3.5 h-3.5 text-amber-500/70" />
                <span>{client.phone || '-'}</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <Mail className="w-3.5 h-3.5 text-amber-500/70" />
                <span className="truncate">{client.email || '-'}</span>
              </div>
            </div>
            <div className="flex justify-between items-center mt-4 pt-3 border-t border-slate-200/40 dark:border-slate-800/40">
              <div className="flex items-center space-x-1 text-xs text-slate-500 dark:text-slate-400">
                <Calendar className="w-3.5 h-3.5 text-amber-500/70" />
                <span>{client.lastVisit || 'Sin visitas'}</span>
              </div>
              <div className="flex items-center space-x-3 text-xs">
                <span className="px-2 py-1 bg-slate-100 dark:bg-slate-900 border border-slate-200/20 dark:border-slate-800 rounded-lg font-bold text-[10px] uppercase tracking-wider text-slate-600 dark:text-slate-400">{client.totalVisits || 0} visitas</span>
                <span className="font-extrabold text-slate-800 dark:text-white">€{client.totalSpent || 0}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200/40 dark:border-slate-800/50">
              <th className="text-left py-3 px-2 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Cliente</th>
              <th className="text-left py-3 px-2 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Contacto</th>
              <th className="text-left py-3 px-2 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Última Visita</th>
              <th className="text-center py-3 px-2 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Visitas</th>
              <th className="text-left py-3 px-2 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Total</th>
              <th className="text-right py-3 px-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100/40 dark:divide-slate-800/30">
            {displayClients.map((client: any) => (
              <tr key={client.id} className="hover:bg-slate-50/50 dark:hover:bg-[#0c101b]/50 border-b border-slate-100 dark:border-slate-800/40 transition-colors">
                <td className="py-4 px-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0c101b] to-[#1e293b] border-2 border-amber-500/20 hover:border-amber-500/40 flex items-center justify-center text-sm font-bold text-amber-400 shadow-md transition-all duration-300">
                      {client.name?.split(' ').map((n: string) => n[0]).join('')}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-100">{client.name}</p>
                      <span className="inline-flex px-1.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-widest bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shadow-[0_0_8px_rgba(212,175,55,0.06)] mt-1">VIP</span>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-2">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2 text-slate-500 dark:text-slate-400 text-xs">
                      <Phone className="w-3.5 h-3.5 text-amber-500/70" />
                      <span>{client.phone || '-'}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-slate-500 dark:text-slate-400 text-xs">
                      <Mail className="w-3.5 h-3.5 text-amber-500/70" />
                      <span>{client.email || '-'}</span>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-2">
                  <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400 font-bold text-sm">
                    <Calendar className="w-4 h-4 text-amber-500" />
                    <span>{client.lastVisit || 'N/A'}</span>
                  </div>
                </td>
                <td className="py-4 px-2 text-center">
                  <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-900 border border-slate-200/20 dark:border-slate-800 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300">
                    {client.totalVisits || 0}
                  </span>
                </td>
                <td className="py-4 px-2">
                  <span className="font-bold text-slate-800 dark:text-white">€{client.totalSpent || 0}</span>
                </td>
                <td className="py-4 px-2 text-right">
                  <div className="flex items-center justify-end space-x-1">
                    <button onClick={() => handleEdit(client)} className="p-2 hover:bg-amber-500/10 hover:text-amber-500 rounded-lg text-slate-400 dark:text-slate-500 transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(client.id)} className="p-2 hover:bg-rose-500/15 hover:text-rose-500 rounded-lg text-slate-400 dark:text-slate-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!fullView && onViewAll && (
        <div className="mt-4 md:mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
          <button onClick={onViewAll} className="text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-slate-800">
            Ver todos los clientes →
          </button>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/65 backdrop-blur-md z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="app-card rounded-t-[32px] sm:rounded-2xl w-full sm:max-w-md p-6 pb-[calc(2rem+env(safe-area-inset-bottom))] max-h-[85vh] overflow-y-auto animate-fade-float-in border-t border-slate-200/50 dark:border-amber-500/10">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">{editingClient ? 'Editar Cliente' : 'Añadir Cliente'}</h3>
              <button onClick={() => { setIsModalOpen(false); setEditingClient(null); }} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider mb-2">Nombre</label>
                <input type="text" required placeholder="Nombre del cliente" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="input-premium w-full" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider mb-2">Email</label>
                <input type="email" required placeholder="email@ejemplo.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="input-premium w-full" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider mb-2">Teléfono</label>
                <input type="text" placeholder="+34 600 000 000" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="input-premium w-full" />
              </div>
              <button type="submit" className="btn-premium primary-btn w-full py-3.5 mt-2 flex items-center justify-center space-x-2">
                <span>Guardar Cliente</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}