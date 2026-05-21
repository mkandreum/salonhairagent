'use client'

import { useState, useEffect } from 'react'
import { Scissors, Clock, CheckCircle, XCircle, MoreVertical, Star, Plus, MessageSquare, Calendar, X, Trash2, Edit2 } from 'lucide-react'
import { fetchStylists, createStylist, updateStylist, deleteStylist as apiDeleteStylist } from '@/lib/api'
import ModalPortal from './ModalPortal'

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
      setStylists(Array.isArray(data) ? data : [])
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

  const filteredStylists = Array.isArray(stylists) ? stylists.filter(s => 
    (s.name && s.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (s.specialization && s.specialization.toLowerCase().includes(searchQuery.toLowerCase()))
  ) : []

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

  if (loading) return <div className="anim-shimmer rounded-2xl h-[300px] sm:h-[400px]" />

  return (
    <div className="app-card p-4 sm:p-6 animate-fade-float-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 sm:mb-6">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
            <Scissors className="w-6 h-6 text-amber-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Equipo de Estilistas</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Disponibilidad en tiempo real</p>
          </div>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-gold py-2 px-4 text-sm ripple-host"
        >
          <Plus className="w-4 h-4 mr-2" />
          Añadir Estilista
        </button>
      </div>

      <ModalPortal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingStylist(null); }}
        title={editingStylist ? 'Editar Estilista' : 'Añadir Estilista'}
        maxWidthClass="sm:max-w-md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nombre Completo</label>
            <input 
              type="text" 
              required
              placeholder="Nombre del estilista"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              className="input-premium text-sm" 
            />
          </div>
          
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Especialidad</label>
            <input 
              type="text" 
              required
              placeholder="Ej: Coloración, Corte y Peinado"
              value={formData.specialization}
              onChange={e => setFormData({...formData, specialization: e.target.value})}
              className="input-premium text-sm" 
            />
          </div>

          <button type="submit" className="btn-gold w-full py-3.5 mt-6">
            {editingStylist ? 'Actualizar Estilista' : 'Guardar Estilista'}
          </button>
        </form>
      </ModalPortal>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredStylists.map((stylist: any) => (
          <div key={stylist.id} className="p-6 bg-slate-50/50 dark:bg-black rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-amber-500/30 transition-all group shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 flex items-center justify-center text-slate-800 dark:text-amber-400 font-bold shadow-sm">
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
                  <p className="text-xs font-bold text-amber-500 dark:text-amber-400 uppercase tracking-wider mt-1">{stylist.specialization}</p>
                  <div className="flex items-center space-x-1 mt-2">
                    {[...Array(5)].map((_, i: number) => (
                      <Star key={i} className={`w-3 h-3 ${i < Math.floor(stylist.rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-700'}`} />
                    ))}
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400 ml-1">{stylist.rating}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <button 
                  onClick={() => handleEdit(stylist)}
                  className="p-3 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-xl transition-all text-slate-500 dark:text-slate-400 md:opacity-0 md:group-hover:opacity-100 flex items-center justify-center min-w-[44px] min-h-[44px]"
                  aria-label="Editar"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleDelete(stylist.id)}
                  className="p-3 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-all text-rose-500 md:opacity-0 md:group-hover:opacity-100 flex items-center justify-center min-w-[44px] min-h-[44px]"
                  aria-label="Eliminar"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="p-3 bg-white dark:bg-black/60 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800/80">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Citas Hoy</p>
                <p className="text-xl font-bold text-slate-800 dark:text-white mt-1">{stylist.todayAppointments || 0}</p>
              </div>
              <div className="p-3 bg-white dark:bg-black/60 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800/80">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Próxima Libre</p>
                <p className="text-xl font-bold text-amber-500 dark:text-amber-400 mt-1">{stylist.nextAvailable}</p>
              </div>
            </div>

            <div className="mt-6 flex space-x-3">
              <button 
                onClick={() => onTabChange ? onTabChange('appointments') : alert('Cambiando a citas...')}
                className="btn-gold flex-1 py-2.5 text-xs rounded-xl flex items-center justify-center space-x-2 active:scale-[0.98] transition-all"
              >
                <Calendar className="w-4 h-4" />
                <span>Agendar</span>
              </button>
              <button 
                onClick={() => alert(`Abriendo chat con ${stylist.name}...`)}
                className="btn-dark flex-1 py-2.5 text-xs rounded-xl flex items-center justify-center space-x-2 active:scale-[0.98] transition-all"
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
            className="text-amber-500 dark:text-amber-400 hover:text-amber-600 font-bold text-sm transition-colors"
          >
            Ver todo el equipo →
          </button>
        </div>
      )}
    </div>
  )
}
