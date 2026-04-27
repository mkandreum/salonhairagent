'use client'

import { useState, useEffect } from 'react'
import { User, Phone, Mail, Calendar, MoreVertical, Plus, Search, X, Trash2, Edit2 } from 'lucide-react'
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
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  })

  const loadData = async () => {
    setLoading(true)
    try {
      const data = await fetchClients()
      setClients(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

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
      alert(editingClient ? 'Error al actualizar el cliente' : 'Error al añadir el cliente')
    }
  }

  const handleEdit = (client: Client) => {
    setEditingClient(client)
    setFormData({
      name: client.name,
      email: client.email,
      phone: client.phone
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (confirm('¿Estás seguro de que deseas eliminar este cliente?')) {
      try {
        await apiDeleteClient(id)
        loadData()
      } catch (err) {
        alert('Error al eliminar el cliente')
      }
    }
  }

  const effectiveSearchQuery = searchQuery || localSearchQuery

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(effectiveSearchQuery.toLowerCase()) ||
    (client.email && client.email.toLowerCase().includes(effectiveSearchQuery.toLowerCase())) ||
    (client.phone && client.phone.includes(effectiveSearchQuery))
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
              value={localSearchQuery}
              onChange={(e) => setLocalSearchQuery(e.target.value)}
              className="input-premium py-2 pl-9 pr-4 text-sm w-48"
            />
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="btn-premium py-2 px-4 text-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Añadir
          </button>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="glass-card p-8 w-full max-w-lg animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">{editingClient ? 'Editar Cliente' : 'Añadir Cliente'}</h3>
              <button onClick={() => { setIsModalOpen(false); setEditingClient(null); }} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Nombre</label>
                <input 
                  type="text" 
                  required
                  placeholder="Nombre del cliente"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="input-premium py-2"
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Email</label>
                <input 
                  type="email" 
                  required
                  placeholder="email@ejemplo.com"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className="input-premium py-2"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Teléfono</label>
                <input 
                  type="text" 
                  placeholder="+34 600 000 000"
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                  className="input-premium py-2"
                />
              </div>

              <button type="submit" className="btn-premium w-full mt-6 py-3">
                Guardar Cliente
              </button>
            </form>
          </div>
        </div>
      )}


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
                  <div className="flex items-center justify-end space-x-1">
                    <button 
                      onClick={() => handleEdit(client)}
                      className="p-2 hover:bg-indigo-50 dark:hover:bg-indigo-900/10 rounded-lg transition-all shadow-sm opacity-0 group-hover:opacity-100 text-indigo-500"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => handleDelete(client.id)}
                      className="p-2 hover:bg-rose-50 dark:hover:bg-rose-900/10 rounded-lg transition-all shadow-sm opacity-0 group-hover:opacity-100 text-rose-500"
                    >
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
        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
          <button 
            onClick={onViewAll}
            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 font-bold text-sm transition-colors"
          >
            Ver todos los clientes →
          </button>
        </div>
      )}
    </div>
  )
}
