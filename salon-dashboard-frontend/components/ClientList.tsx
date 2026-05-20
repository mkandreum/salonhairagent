'use client'

import { useState, useEffect } from 'react'
import { User, Phone, Mail, Calendar, Plus, Search, X, Trash2, Edit2 } from 'lucide-react'
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
    <div className="app-card animate-pulse h-[300px] md:h-[400px] bg-white/[0.01] border-white/5" />
  )

  const displayClients = filteredClients.slice(0, fullView ? undefined : 6)

  return (
    <div className="app-card p-5 md:p-8 animate-fadeUp">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8 pb-4 border-b border-white/[0.04]">
        <div className="flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-2xl bg-[#E5C17B]/10 border border-[#E5C17B]/20 flex items-center justify-center shadow-md">
            <User className="w-5 h-5 text-[#E5C17B]" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Fichas de Clientes</h2>
            <p className="text-white/40 font-mono text-[9px] uppercase tracking-widest hidden sm:block">{filteredClients.length} registrados</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {fullView && (
            <div className="relative flex-1 sm:flex-none">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type="text"
                placeholder="Buscar cliente..."
                value={localSearchQuery}
                onChange={(e) => setLocalSearchQuery(e.target.value)}
                className="input-premium w-full sm:w-48 pl-9.5 rounded-full"
              />
            </div>
          )}
          <button onClick={() => setIsModalOpen(true)} className="btn-premium py-2.5 px-4 text-xs">
            <Plus className="w-4 h-4 mr-1.5 inline stroke-[2.5]" />
            <span>Añadir Cliente</span>
          </button>
        </div>
      </div>

      {/* Mobile Cards View */}
      <div className="block md:hidden space-y-3.5">
        {displayClients.map((client: any) => (
          <div key={client.id} className="p-4 bg-white/[0.01] border border-white/[0.04] rounded-2xl hover:border-[#E5C17B]/20 transition-all duration-300">
            <div className="flex items-start justify-between mb-3.5">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-[#E5C17B]/10 border border-[#E5C17B]/20 flex items-center justify-center text-xs font-bold text-[#E5C17B] shadow-inner">
                  {client.name?.split(' ').map((n: string) => n[0]).join('') || '??'}
                </div>
                <div>
                  <p className="font-bold text-white text-sm leading-tight">{client.name}</p>
                  <span className="inline-flex px-2 py-0.5 rounded-md font-mono text-[8px] font-extrabold uppercase tracking-widest bg-[#E5C17B]/10 text-[#E5C17B] border border-[#E5C17B]/20 mt-1">VIP</span>
                </div>
              </div>
              <div className="flex gap-1.5">
                <button onClick={() => handleEdit(client)} className="p-2 bg-white/[0.01] border border-white/5 hover:border-[#E5C17B]/30 hover:text-[#E5C17B] rounded-xl text-white/40 transition-all duration-300">
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => handleDelete(client.id)} className="p-2 bg-white/[0.01] border border-white/5 hover:bg-rose-500/10 hover:text-rose-400 rounded-xl text-white/40 transition-all duration-300">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs text-white/45 pt-3 border-t border-white/[0.03]">
              <div className="flex items-center space-x-1.5">
                <Phone className="w-3.5 h-3.5 text-[#E5C17B]/60" />
                <span>{client.phone || '-'}</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <Mail className="w-3.5 h-3.5 text-[#E5C17B]/60" />
                <span className="truncate">{client.email || '-'}</span>
              </div>
            </div>
            <div className="flex justify-between items-center mt-4 pt-3.5 border-t border-white/[0.03]">
              <div className="flex items-center space-x-1 text-xs text-white/45">
                <Calendar className="w-3.5 h-3.5 text-[#E5C17B]/60" />
                <span>Última visita: {client.lastVisit || 'Sin visitas'}</span>
              </div>
              <div className="flex items-center space-x-2 text-xs">
                <span className="px-2 py-0.5 bg-white/[0.03] border border-white/5 rounded-md font-bold text-[8px] uppercase tracking-wider text-white/40">{client.totalVisits || 0} citas</span>
                <span className="font-extrabold text-[#E5C17B]">€{client.totalSpent || 0}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/[0.04]">
              <th className="text-left pb-4 px-3 font-mono text-[9px] text-white/35 uppercase tracking-widest">Cliente</th>
              <th className="text-left pb-4 px-3 font-mono text-[9px] text-white/35 uppercase tracking-widest">Contacto</th>
              <th className="text-left pb-4 px-3 font-mono text-[9px] text-white/35 uppercase tracking-widest">Última Visita</th>
              <th className="text-center pb-4 px-3 font-mono text-[9px] text-white/35 uppercase tracking-widest">Citas</th>
              <th className="text-left pb-4 px-3 font-mono text-[9px] text-white/35 uppercase tracking-widest">Total Gastado</th>
              <th className="text-right pb-4 px-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.03]">
            {displayClients.map((client: any) => (
              <tr key={client.id} className="hover:bg-white/[0.015] transition-colors duration-300">
                <td className="py-4.5 px-3">
                  <div className="flex items-center space-x-3.5">
                    <div className="w-9 h-9 rounded-xl bg-[#E5C17B]/10 border border-[#E5C17B]/20 flex items-center justify-center text-xs font-bold text-[#E5C17B] shadow-inner">
                      {client.name?.split(' ').map((n: string) => n[0]).join('')}
                    </div>
                    <div>
                      <p className="font-bold text-white/90">{client.name}</p>
                      <span className="inline-flex px-1.5 py-0.5 rounded-md font-mono text-[8px] font-extrabold uppercase tracking-widest bg-[#E5C17B]/10 text-[#E5C17B] border border-[#E5C17B]/20 mt-1">VIP</span>
                    </div>
                  </div>
                </td>
                <td className="py-4.5 px-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center space-x-2 text-white/45 text-xs font-medium">
                      <Phone className="w-3.5 h-3.5 text-[#E5C17B]/60" />
                      <span>{client.phone || '-'}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-white/45 text-xs font-medium">
                      <Mail className="w-3.5 h-3.5 text-[#E5C17B]/60" />
                      <span>{client.email || '-'}</span>
                    </div>
                  </div>
                </td>
                <td className="py-4.5 px-3">
                  <div className="flex items-center space-x-2 text-white font-bold text-sm">
                    <Calendar className="w-4 h-4 text-[#E5C17B]/60" />
                    <span>{client.lastVisit || 'Sin citas'}</span>
                  </div>
                </td>
                <td className="py-4.5 px-3 text-center">
                  <span className="px-2.5 py-1 bg-white/[0.03] border border-white/5 rounded-md text-xs font-bold text-white/70">
                    {client.totalVisits || 0}
                  </span>
                </td>
                <td className="py-4.5 px-3">
                  <span className="font-bold text-[#E5C17B]">€{client.totalSpent || 0}</span>
                </td>
                <td className="py-4.5 px-3 text-right">
                  <div className="flex items-center justify-end space-x-1.5">
                    <button onClick={() => handleEdit(client)} className="p-2 bg-white/[0.01] border border-white/5 hover:border-[#E5C17B]/30 hover:text-[#E5C17B] rounded-xl text-white/40 transition-all duration-300">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDelete(client.id)} className="p-2 bg-white/[0.01] border border-white/5 hover:bg-rose-500/10 hover:text-rose-400 rounded-xl text-white/40 transition-all duration-300">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!fullView && onViewAll && (
        <div className="mt-4 md:mt-6 pt-5 border-t border-white/[0.04] text-center">
          <button onClick={onViewAll} className="text-xs font-bold text-white/45 hover:text-[#E5C17B] tracking-wider uppercase transition-colors duration-300">
            Ver todas las fichas de clientes →
          </button>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-[#090709]/85 backdrop-blur-md z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="app-card rounded-t-[32px] sm:rounded-3xl w-full sm:max-w-md p-6 sm:p-8 pb-[calc(2rem+env(safe-area-inset-bottom))] max-h-[85vh] overflow-y-auto border-white/10 shadow-2xl relative">
            <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#E5C17B]/20 to-transparent" />
            
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white tracking-tight">{editingClient ? 'Editar Cliente' : 'Añadir Cliente'}</h3>
              <button onClick={() => { setIsModalOpen(false); setEditingClient(null); }} className="p-2 bg-white/[0.02] hover:bg-white/[0.06] rounded-xl transition-all">
                <X className="w-4.5 h-4.5 text-white/40" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-white/40 font-mono text-[9px] uppercase tracking-widest mb-2 px-1 font-bold">Nombre Completo</label>
                <input type="text" required placeholder="Ej: Carolina Herrera" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="input-premium w-full py-3" />
              </div>
              <div>
                <label className="block text-white/40 font-mono text-[9px] uppercase tracking-widest mb-2 px-1 font-bold">Email</label>
                <input type="email" required placeholder="ejemplo@salonaluxe.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="input-premium w-full py-3" />
              </div>
              <div>
                <label className="block text-white/40 font-mono text-[9px] uppercase tracking-widest mb-2 px-1 font-bold">Teléfono móvil</label>
                <input type="text" placeholder="+34 600 000 000" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="input-premium w-full py-3" />
              </div>
              <button type="submit" className="btn-premium w-full py-4 mt-4 shadow-lg shadow-[#E5C17B]/5">
                <span>{editingClient ? 'Guardar Cambios' : 'Confirmar Registro'}</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
