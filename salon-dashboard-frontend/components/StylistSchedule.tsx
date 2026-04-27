'use client'

import { useState, useEffect } from 'react'
import { Scissors, Clock, CheckCircle, XCircle, MoreVertical, Star, Plus, MessageSquare, Calendar, X, Trash2, Edit2 } from 'lucide-react'
import { fetchStylists, createStylist, updateStylist, deleteStylist as apiDeleteStylist } from '@/lib/api'

interface Stylist {
  id: number
  name: string
  specialization: string
  todayAppointments: number
  availability: 'available' | 'busy' | 'off'
  nextAvailable: string
  rating: number
}

interface StylistScheduleProps {
  fullView?: boolean
  onViewAll?: () => void
  onTabChange?: (tab: string) => void
  searchQuery?: string
}

export default function StylistSchedule({ fullView = false, onViewAll, onTabChange, searchQuery = '' }: StylistScheduleProps) {
  const [stylists, setStylists] = useState<Stylist[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingStylist, setEditingStylist] = useState<Stylist | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    specialization: '',
    rating: 5.0,
    availability: 'available',
    next_available: 'Ahora'
  })

  const loadData = () => {
    setLoading(true)
    fetchStylists().then(data => {
      setStylists(data)
      setLoading(false)
    }).catch(err => {
      console.error("Failed to fetch stylists", err)
      setLoading(false)
    })
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingStylist) {
        await updateStylist(editingStylist.id, formData)
      } else {
        await createStylist(formData)
      }
      setIsModalOpen(false)
      setEditingStylist(null)
      loadData()
      setFormData({ name: '', specialization: '', rating: 5.0, availability: 'available', next_available: 'Ahora' })
    } catch (err) {
      alert(editingStylist ? 'Error al actualizar estilista' : 'Error al añadir estilista')
    }
  }

  const handleEdit = (stylist: Stylist) => {
    setEditingStylist(stylist)
    setFormData({
      name: stylist.name,
      specialization: stylist.specialization,
      rating: stylist.rating,
      availability: stylist.availability,
      next_available: stylist.nextAvailable
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (confirm('¿Estás seguro de que deseas eliminar este estilista?')) {
      try {
        await apiDeleteStylist(id)
        loadData()
      } catch (err) {
        alert('Error al eliminar estilista')
      }
    }
  }

  const filteredStylists = stylists.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.specialization.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'available': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
      case 'busy': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
      case 'off': return 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
    }
  }

  const getAvailabilityIcon = (availability: string) => {
    switch (availability) {
      case 'available': return <CheckCircle className="w-4 h-4" />
      case 'busy': return <Clock className="w-4 h-4" />
      case 'off': return <XCircle className="w-4 h-4" />
      default: return null
    }
  }

  if (loading) return <div className="glass-card p-8 animate-pulse h-[400px]" />

  return (
    <div className="glass-card p-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center">
            <Scissors className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Equipo de Estilistas</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Disponibilidad en tiempo real</p>
          </div>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn-premium py-2 px-4 text-sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Añadir Estilista
        </button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="glass-card p-8 w-full max-w-lg animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">{editingStylist ? 'Editar Estilista' : 'Añadir Estilista'}</h3>
              <button onClick={() => { setIsModalOpen(false); setEditingStylist(null); }} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Nombre</label>
                <input 
                  type="text" 
                  required
                  placeholder="Nombre completo"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="input-premium py-2"
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Especialidad</label>
                <input 
                  type="text" 
                  required
                  placeholder="Ej: Coloración, Corte"
                  value={formData.specialization}
                  onChange={e => setFormData({...formData, specialization: e.target.value})}
                  className="input-premium py-2"
                />
              </div>

               <button type="submit" className="btn-premium w-full mt-6 py-3">
                {editingStylist ? 'Actualizar Estilista' : 'Guardar Estilista'}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredStylists.map((stylist) => (
          <div key={stylist.id} className="p-6 bg-slate-50/50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-700 hover:border-indigo-500/50 transition-all group">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg">
                    <span className="text-xl font-bold">{stylist.name[0]}</span>
                  </div>
                  <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-4 border-white dark:border-slate-900 flex items-center justify-center ${
                    stylist.availability === 'available' ? 'bg-emerald-500' : stylist.availability === 'busy' ? 'bg-amber-500' : 'bg-rose-500'
                  }`}>
                    {getAvailabilityIcon(stylist.availability)}
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-white leading-tight">{stylist.name}</h3>
                  <p className="text-xs font-bold text-indigo-500 uppercase tracking-wider mt-1">{stylist.specialization}</p>
                  <div className="flex items-center space-x-1 mt-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-3 h-3 ${i < Math.floor(stylist.rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                    ))}
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400 ml-1">{stylist.rating}</span>
                  </div>
                </div>
              </div>
                 <div className="flex flex-col space-y-1">
                <button 
                  onClick={() => handleEdit(stylist)}
                  className="p-2 hover:bg-indigo-50 dark:hover:bg-indigo-900/10 rounded-lg transition-all text-indigo-500 opacity-0 group-hover:opacity-100"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleDelete(stylist.id)}
                  className="p-2 hover:bg-rose-50 dark:hover:bg-rose-900/10 rounded-lg transition-all text-rose-500 opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="p-3 bg-white dark:bg-slate-900/50 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Citas Hoy</p>
                <p className="text-xl font-bold text-slate-800 dark:text-white mt-1">{stylist.todayAppointments || 0}</p>
              </div>
              <div className="p-3 bg-white dark:bg-slate-900/50 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Próxima Libre</p>
                <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">{stylist.nextAvailable}</p>
              </div>
            </div>

            <div className="mt-6 flex space-x-3">
              <button 
                onClick={() => onTabChange ? onTabChange('appointments') : alert('Cambiando a citas...')}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2"
              >
                <Calendar className="w-4 h-4" />
                <span>Agendar</span>
              </button>
              <button 
                onClick={() => alert(`Abriendo chat con ${stylist.name}...`)}
                className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Mensaje</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {!fullView && onViewAll && (
        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
          <button 
            onClick={onViewAll}
            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 font-bold text-sm transition-colors"
          >
            Ver todo el equipo →
          </button>
        </div>
      )}
    </div>
  )
}
