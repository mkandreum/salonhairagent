'use client'

import { useState, useEffect } from 'react'
import { User, Phone, Mail, Calendar, Plus, Search, X, Trash2, Edit2, ChevronRight } from 'lucide-react'
import { fetchClients, createClient, deleteClient as apiDeleteClient, updateClient } from '@/lib/api'
import ModalPortal from './ModalPortal'


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
    <div className="rounded-2xl anim-shimmer h-[300px] md:h-[400px] border border-slate-200 dark:border-slate-900" />
  )

  const displayClients = filteredClients.slice(0, fullView ? undefined : 6)

  return (
    <div className="app-card p-4 md:p-6 animate-fade-float-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 md:mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-zinc-950 border border-slate-200 dark:border-slate-900 flex items-center justify-center">
            <User className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </div>
          <div>
            <h2 className="text-base md:text-lg font-bold text-slate-800 dark:text-white">Clientes</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">{filteredClients.length} clientes registrados</p>
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
                className="w-full sm:w-40 px-4 py-2 pl-9 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-slate-900 focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/10 transition-all outline-none rounded-xl text-sm font-medium"
              />
            </div>
          )}
          <button onClick={() => setIsModalOpen(true)} className="btn-gold py-2 px-4 text-sm">
            <Plus className="w-4 h-4 mr-2 inline" />
            <span className="hidden sm:inline">Añadir</span>
          </button>
        </div>
      </div>

      {/* Mobile Cards View */}
      <div className="block md:hidden space-y-3">
        {displayClients.map((client: any) => (
          <div key={client.id} className="bg-slate-50 dark:bg-zinc-950/40 rounded-xl p-4 border border-slate-100 dark:border-slate-900">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-zinc-900 border border-slate-300 dark:border-slate-800 flex items-center justify-center text-sm font-bold text-slate-600 dark:text-slate-400">
                  {client.name?.split(' ').map((n: string) => n[0]).join('') || '??'}
                </div>
                <div>
                  <p className="font-bold text-slate-800 dark:text-white">{client.name}</p>
                  <span className="badge-warning inline-block mt-1">VIP</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(client)} className="p-3 bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-slate-800 hover:border-amber-500/30 rounded-xl min-w-[44px] min-h-[44px] flex items-center justify-center transition-all text-slate-500">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(client.id)} className="p-3 bg-red-50 dark:bg-red-950/20 border border-transparent hover:border-red-500/10 rounded-xl min-w-[44px] min-h-[44px] flex items-center justify-center transition-all text-red-500">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-500">
              <div className="flex items-center space-x-1">
                <Phone className="w-3 h-3" />
                <span>{client.phone || '-'}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Mail className="w-3 h-3" />
                <span className="truncate">{client.email || '-'}</span>
              </div>
            </div>
            <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-200 dark:border-slate-900">
              <div className="flex items-center space-x-1 text-xs text-slate-500">
                <Calendar className="w-3 h-3" />
                <span>{client.lastVisit || 'Sin visitas'}</span>
              </div>
              <div className="flex items-center space-x-3 text-xs">
                <span className="px-2 py-1 bg-slate-200 dark:bg-zinc-900 rounded-lg font-medium">{client.totalVisits || 0} visitas</span>
                <span className="font-bold text-slate-800 dark:text-white">€{client.totalSpent || 0}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-900">
              <th className="text-left py-3 px-2 text-xs font-bold text-slate-400 uppercase tracking-wider">Cliente</th>
              <th className="text-left py-3 px-2 text-xs font-bold text-slate-400 uppercase tracking-wider">Contacto</th>
              <th className="text-left py-3 px-2 text-xs font-bold text-slate-400 uppercase tracking-wider">Última Visita</th>
              <th className="text-center py-3 px-2 text-xs font-bold text-slate-400 uppercase tracking-wider">Visitas</th>
              <th className="text-left py-3 px-2 text-xs font-bold text-slate-400 uppercase tracking-wider">Total</th>
              <th className="text-right py-3 px-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-slate-900/30">
            {displayClients.map((client: any) => (
              <tr key={client.id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-950/30 transition-colors">
                <td className="py-4 px-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-slate-850 flex items-center justify-center text-sm font-bold text-slate-600 dark:text-slate-400">
                      {client.name?.split(' ').map((n: string) => n[0]).join('')}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-100">{client.name}</p>
                      <span className="badge-warning mt-1 inline-block">VIP</span>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-2">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2 text-slate-500 text-xs">
                      <Phone className="w-3.5 h-3.5" />
                      <span>{client.phone || '-'}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-slate-500 text-xs">
                      <Mail className="w-3.5 h-3.5" />
                      <span>{client.email || '-'}</span>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-2">
                  <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400 font-semibold text-sm">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span>{client.lastVisit || 'N/A'}</span>
                  </div>
                </td>
                <td className="py-4 px-2 text-center">
                  <span className="px-2.5 py-1 bg-slate-100 dark:bg-zinc-900 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300">
                    {client.totalVisits || 0}
                  </span>
                </td>
                <td className="py-4 px-2">
                  <span className="font-bold text-slate-800 dark:text-white">€{client.totalSpent || 0}</span>
                </td>
                <td className="py-4 px-2 text-right">
                  <div className="flex items-center justify-end space-x-1">
                    <button onClick={() => handleEdit(client)} className="p-2 hover:bg-slate-100 dark:hover:bg-zinc-900 rounded-lg text-slate-500">
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button onClick={() => handleDelete(client.id)} className="p-2 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg text-red-500">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!fullView && onViewAll && (
        <div className="mt-4 md:mt-6 pt-4 border-t border-slate-100 dark:border-slate-900 text-center">
          <button onClick={onViewAll} className="text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200">
            Ver todos los clientes →
          </button>
        </div>
      )}

      {/* Modal */}
      <ModalPortal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingClient(null); }}
        title={editingClient ? 'Editar Cliente' : 'Añadir Cliente'}
        maxWidthClass="sm:max-w-md"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nombre Completo</label>
            <input 
              type="text" 
              required 
              placeholder="Ej: Daniel González" 
              value={formData.name} 
              onChange={e => setFormData({...formData, name: e.target.value})} 
              className="input-premium" 
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email</label>
            <input 
              type="email" 
              required 
              placeholder="daniel@ejemplo.com" 
              value={formData.email} 
              onChange={e => setFormData({...formData, email: e.target.value})} 
              className="input-premium" 
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Teléfono</label>
            <input 
              type="text" 
              placeholder="+34 600 000 000" 
              value={formData.phone} 
              onChange={e => setFormData({...formData, phone: e.target.value})} 
              className="input-premium" 
            />
          </div>
          <button type="submit" className="btn-gold w-full py-3.5 mt-6 font-bold hover:scale-[1.01] active:scale-[0.98] transition-all">
            Guardar Cambios
          </button>
        </form>
      </ModalPortal>
    </div>
  )
}