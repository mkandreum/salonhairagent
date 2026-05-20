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
    <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 md:p-6 animate-pulse h-[300px] md:h-[400px]" />
  )

  const displayClients = filteredClients.slice(0, fullView ? undefined : 6)

  return (
    <div className="app-card p-4 md:p-6 animate-fade-float-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 md:mb-6">
        <div className="flex items-center space-x-3">
          <div className="section-icon">
            <User className="w-4 h-4" />
          </div>
          <div>
            <h2 className="section-title">Clientes</h2>
            <p className="text-xs text-white/50 hidden sm:block">{filteredClients.length} clientes</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {fullView && (
            <div className="relative flex-1 sm:flex-none">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type="text"
                placeholder="Buscar..."
                value={localSearchQuery}
                onChange={(e) => setLocalSearchQuery(e.target.value)}
                className="input-premium w-full sm:w-48 pl-9 rounded-full"
              />
            </div>
          )}
          <button onClick={() => setIsModalOpen(true)} className="btn-premium py-2 px-4 text-sm ripple-host">
            <Plus className="w-4 h-4 mr-2 inline" />
            <span className="hidden sm:inline">Añadir Cliente</span>
            <span className="sm:hidden">+</span>
          </button>
        </div>
      </div>

      {/* Mobile Cards View */}
      <div className="block md:hidden space-y-3">
        {displayClients.map((client: any) => (
          <div key={client.id} className="bg-white/[0.02] border border-white/10 rounded-2xl p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-[#D4A843]/10 flex items-center justify-center text-sm font-bold text-[#D4A843]">
                  {client.name?.split(' ').map((n: string) => n[0]).join('') || '??'}
                </div>
                <div>
                  <p className="font-bold text-white leading-tight">{client.name}</p>
                  <span className="inline-flex px-1.5 py-0.5 rounded-full font-mono text-[9px] font-extrabold uppercase tracking-widest bg-[#D4A843]/10 text-[#D4A843] border border-[#D4A843]/20 mt-1.5">VIP</span>
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => handleEdit(client)} className="p-2 hover:bg-[#D4A843]/10 hover:text-[#D4A843] rounded-lg text-white/40 transition-colors">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(client.id)} className="p-2 hover:bg-rose-500/15 hover:text-rose-500 rounded-lg text-white/40 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs text-white/50">
              <div className="flex items-center space-x-1.5">
                <Phone className="w-3.5 h-3.5 text-[#D4A843]/70" />
                <span>{client.phone || '-'}</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <Mail className="w-3.5 h-3.5 text-[#D4A843]/70" />
                <span className="truncate">{client.email || '-'}</span>
              </div>
            </div>
            <div className="flex justify-between items-center mt-4 pt-3 border-t border-white/5">
              <div className="flex items-center space-x-1 text-xs text-white/50">
                <Calendar className="w-3.5 h-3.5 text-[#D4A843]/70" />
                <span>{client.lastVisit || 'Sin visitas'}</span>
              </div>
              <div className="flex items-center space-x-3 text-xs">
                <span className="px-2 py-1 bg-white/[0.04] border border-white/5 rounded-lg font-bold text-[10px] uppercase tracking-wider text-white/40">{client.totalVisits || 0} visitas</span>
                <span className="font-extrabold text-white">€{client.totalSpent || 0}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5">
              <th className="text-left py-3 px-2 font-mono text-[10px] text-white/40 uppercase tracking-widest">Cliente</th>
              <th className="text-left py-3 px-2 font-mono text-[10px] text-white/40 uppercase tracking-widest">Contacto</th>
              <th className="text-left py-3 px-2 font-mono text-[10px] text-white/40 uppercase tracking-widest">Última Visita</th>
              <th className="text-center py-3 px-2 font-mono text-[10px] text-white/40 uppercase tracking-widest">Visitas</th>
              <th className="text-left py-3 px-2 font-mono text-[10px] text-white/40 uppercase tracking-widest">Total</th>
              <th className="text-right py-3 px-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {displayClients.map((client: any) => (
              <tr key={client.id} className="hover:bg-white/[0.02] border-b border-white/5 transition-colors">
                <td className="py-4 px-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-[#D4A843]/10 flex items-center justify-center text-sm font-bold text-[#D4A843]">
                      {client.name?.split(' ').map((n: string) => n[0]).join('')}
                    </div>
                    <div>
                      <p className="font-bold text-white">{client.name}</p>
                      <span className="inline-flex px-1.5 py-0.5 rounded-full font-mono text-[9px] font-extrabold uppercase tracking-widest bg-[#D4A843]/10 text-[#D4A843] border border-[#D4A843]/20 mt-1">VIP</span>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-2">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2 text-white/50 text-xs">
                      <Phone className="w-3.5 h-3.5 text-[#D4A843]/70" />
                      <span>{client.phone || '-'}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-white/50 text-xs">
                      <Mail className="w-3.5 h-3.5 text-[#D4A843]/70" />
                      <span>{client.email || '-'}</span>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-2">
                  <div className="flex items-center space-x-2 text-white font-bold text-sm">
                    <Calendar className="w-4 h-4 text-[#D4A843]" />
                    <span>{client.lastVisit || 'N/A'}</span>
                  </div>
                </td>
                <td className="py-4 px-2 text-center">
                  <span className="px-2.5 py-1 bg-white/[0.04] border border-white/5 rounded-lg text-xs font-bold text-white">
                    {client.totalVisits || 0}
                  </span>
                </td>
                <td className="py-4 px-2">
                  <span className="font-bold text-white">€{client.totalSpent || 0}</span>
                </td>
                <td className="py-4 px-2 text-right">
                  <div className="flex items-center justify-end space-x-1">
                    <button onClick={() => handleEdit(client)} className="p-2 hover:bg-[#D4A843]/10 hover:text-[#D4A843] rounded-lg text-white/40 transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(client.id)} className="p-2 hover:bg-rose-500/15 hover:text-rose-500 rounded-lg text-white/40 transition-colors">
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
        <div className="mt-4 md:mt-6 pt-4 border-t border-white/5 text-center">
          <button onClick={onViewAll} className="text-sm font-bold text-[#D4A843] hover:text-[#F0CC70]">
            Ver todos los clientes →
          </button>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-[#080608]/80 backdrop-blur-md z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="app-card rounded-t-[32px] sm:rounded-2xl w-full sm:max-w-md p-6 pb-[calc(2rem+env(safe-area-inset-bottom))] max-h-[85vh] overflow-y-auto animate-fade-float-in">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white">{editingClient ? 'Editar Cliente' : 'Añadir Cliente'}</h3>
              <button onClick={() => { setIsModalOpen(false); setEditingClient(null); }} className="p-2 hover:bg-white/[0.06] rounded-full transition-colors">
                <X className="w-5 h-5 text-white/40" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-white/50 font-mono text-[10px] uppercase tracking-wider mb-2">Nombre</label>
                <input type="text" required placeholder="Nombre del cliente" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="input-premium w-full" />
              </div>
              <div>
                <label className="block text-white/50 font-mono text-[10px] uppercase tracking-wider mb-2">Email</label>
                <input type="email" required placeholder="email@ejemplo.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="input-premium w-full" />
              </div>
              <div>
                <label className="block text-white/50 font-mono text-[10px] uppercase tracking-wider mb-2">Teléfono</label>
                <input type="text" placeholder="+34 600 000 000" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="input-premium w-full" />
              </div>
              <button type="submit" className="btn-premium w-full py-3.5 mt-2 flex items-center justify-center space-x-2">
                <span>Guardar Cliente</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
