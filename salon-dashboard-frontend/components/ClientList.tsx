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
                className="w-full sm:w-40 px-4 py-2 pl-9 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
              />
            </div>
          )}
          <button onClick={() => setIsModalOpen(true)} className="btn-premium primary-btn py-2 px-4 text-sm ripple-host">
            <Plus className="w-4 h-4 mr-2 inline" />
            <span className="hidden sm:inline">Añadir</span>
          </button>
        </div>
      </div>

      {/* Mobile Cards View */}
      <div className="block md:hidden space-y-3">
        {displayClients.map((client: any) => (
          <div key={client.id} className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-700">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-sm font-bold text-slate-600 dark:text-slate-300">
                  {client.name?.split(' ').map((n: string) => n[0]).join('') || '??'}
                </div>
                <div>
                  <p className="font-bold text-slate-800 dark:text-white">{client.name}</p>
                  <p className="text-xs text-amber-600 font-medium">VIP</p>
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => handleEdit(client)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg">
                  <Edit2 className="w-4 h-4 text-slate-500" />
                </button>
                <button onClick={() => handleDelete(client.id)} className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg">
                  <Trash2 className="w-4 h-4 text-red-500" />
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
            <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
              <div className="flex items-center space-x-1 text-xs text-slate-500">
                <Calendar className="w-3 h-3" />
                <span>{client.lastVisit || 'Sin visitas'}</span>
              </div>
              <div className="flex items-center space-x-3 text-xs">
                <span className="px-2 py-1 bg-slate-200 dark:bg-slate-700 rounded-lg font-medium">{client.totalVisits || 0} visitas</span>
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
            <tr className="border-b border-slate-100 dark:border-slate-800">
              <th className="text-left py-3 px-2 text-xs font-bold text-slate-400 uppercase tracking-wider">Cliente</th>
              <th className="text-left py-3 px-2 text-xs font-bold text-slate-400 uppercase tracking-wider">Contacto</th>
              <th className="text-left py-3 px-2 text-xs font-bold text-slate-400 uppercase tracking-wider">Última Visita</th>
              <th className="text-center py-3 px-2 text-xs font-bold text-slate-400 uppercase tracking-wider">Visitas</th>
              <th className="text-left py-3 px-2 text-xs font-bold text-slate-400 uppercase tracking-wider">Total</th>
              <th className="text-right py-3 px-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
            {displayClients.map((client: any) => (
              <tr key={client.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                <td className="py-4 px-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-sm font-bold text-slate-600 dark:text-slate-300">
                      {client.name?.split(' ').map((n: string) => n[0]).join('')}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-100">{client.name}</p>
                      <p className="text-xs text-amber-600 font-medium">VIP</p>
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
                  <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400 font-medium text-sm">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span>{client.lastVisit || 'N/A'}</span>
                  </div>
                </td>
                <td className="py-4 px-2 text-center">
                  <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300">
                    {client.totalVisits || 0}
                  </span>
                </td>
                <td className="py-4 px-2">
                  <span className="font-bold text-slate-800 dark:text-white">€{client.totalSpent || 0}</span>
                </td>
                <td className="py-4 px-2 text-right">
                  <div className="flex items-center justify-end space-x-1">
                    <button onClick={() => handleEdit(client)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500">
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button onClick={() => handleDelete(client.id)} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg text-red-500">
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
        <div className="mt-4 md:mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
          <button onClick={onViewAll} className="text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-slate-800">
            Ver todos los clientes →
          </button>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="app-card rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md p-6 pb-[calc(2rem+env(safe-area-inset-bottom))] animate-fade-float-in">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">{editingClient ? 'Editar Cliente' : 'Añadir Cliente'}</h3>
              <button onClick={() => { setIsModalOpen(false); setEditingClient(null); }} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Nombre</label>
                <input type="text" required placeholder="Nombre del cliente" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Email</label>
                <input type="email" required placeholder="email@ejemplo.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Teléfono</label>
                <input type="text" placeholder="+34 600 000 000" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm" />
              </div>
              <button type="submit" className="btn-premium primary-btn w-full py-3 mt-4 ripple-host">Guardar</button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}