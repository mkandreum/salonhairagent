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
      case 'available': return 'bg-emerald-500/10 text-emerald-500 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-500/20'
      case 'busy': return 'bg-amber-500/10 text-amber-500 dark:bg-amber-950/30 dark:text-amber-400 border border-amber-500/20'
      case 'off': return 'bg-rose-500/10 text-rose-500 dark:bg-rose-950/30 dark:text-rose-400 border border-rose-500/20'
      default: return 'bg-slate-500/10 text-slate-500 dark:bg-slate-950/30 dark:text-slate-400 border border-slate-500/10'
    }
  }

  const getAvailabilityIcon = (availability: string) => {
    switch (availability) {
      case 'available': return <CheckCircle className="w-3.5 h-3.5 text-white" />
      case 'busy': return <Clock className="w-3.5 h-3.5 text-white" />
      case 'off': return <XCircle className="w-3.5 h-3.5 text-white" />
      default: return null
    }
  }

  if (loading) return (
    <div className="app-card p-6 animate-pulse h-[350px] flex flex-col justify-between">
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 rounded-xl bg-slate-800" />
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-slate-800 rounded w-1/3" />
          <div className="h-3 bg-slate-800 rounded w-1/4" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="h-24 bg-slate-800 rounded-xl" />
        <div className="h-24 bg-slate-800 rounded-xl" />
      </div>
    </div>
  )

  return (
    <div className="app-card p-4 sm:p-6 animate-fade-float-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 sm:mb-6">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 dark:bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
            <Scissors className="w-6 h-6 text-amber-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Equipo de Estilistas</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Disponibilidad en tiempo real</p>
          </div>
        </div>
        <button
          onClick={() => {
            setEditingStylist(null);
            setFormData({ name: '', specialization: '', rating: 5.0, availability: 'available', next_available: 'Ahora' });
            setIsModalOpen(true);
          }}
          className="btn-premium primary-btn py-2.5 px-4 text-sm ripple-host"
        >
          <Plus className="w-4 h-4 mr-2" />
          Añadir Estilista
        </button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/65 backdrop-blur-md z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
          {/* Close on clicking backdrop */}
          <div className="absolute inset-0" onClick={() => { setIsModalOpen(false); setEditingStylist(null); }} />
          
          <div className="app-card rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md p-6 pb-[calc(2rem+env(safe-area-inset-bottom))] animate-fade-float-in z-10 max-h-[90vh] overflow-y-auto relative border border-amber-500/10 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                {editingStylist ? 'Editar Estilista' : 'Añadir Estilista'}
              </h3>
              <button 
                onClick={() => { setIsModalOpen(false); setEditingStylist(null); }} 
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Nombre</label>
                <input 
                  type="text" 
                  required
                  placeholder="Ej: Sofía Martínez"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="input-premium w-full"
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Especialidad</label>
                <input 
                  type="text" 
                  required
                  placeholder="Ej: Coloración, Corte, Estilismo"
                  value={formData.specialization}
                  onChange={e => setFormData({...formData, specialization: e.target.value})}
                  className="input-premium w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Valoración</label>
                  <input 
                    type="number" 
                    step="0.1"
                    min="1.0"
                    max="5.0"
                    required
                    value={formData.rating}
                    onChange={e => setFormData({...formData, rating: parseFloat(e.target.value)})}
                    className="input-premium w-full"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Disponibilidad</label>
                  <select 
                    value={formData.availability}
                    onChange={e => setFormData({...formData, availability: e.target.value as any})}
                    className="input-premium w-full font-semibold"
                  >
                    <option value="available">Disponible</option>
                    <option value="busy">Ocupado/a</option>
                    <option value="off">No trabaja hoy</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Próxima Libre</label>
                <input 
                  type="text" 
                  required
                  placeholder="Ej: Ahora, 15:30, Mañana"
                  value={formData.next_available}
                  onChange={e => setFormData({...formData, next_available: e.target.value})}
                  className="input-premium w-full"
                />
              </div>

               <button type="submit" className="btn-premium primary-btn w-full mt-6 py-3.5 flex items-center justify-center space-x-2">
                <span>{editingStylist ? 'Actualizar Estilista' : 'Guardar Estilista'}</span>
              </button>
            </form>
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredStylists.map((stylist: any) => (
          <div key={stylist.id} className="p-6 bg-slate-50/15 dark:bg-slate-950/40 rounded-[24px] border border-slate-200/40 dark:border-amber-500/10 hover:border-amber-500/35 dark:hover:border-amber-500/30 hover:shadow-[0_12px_32px_rgba(0,0,0,0.12)] hover:shadow-amber-500/5 transition-all duration-300 group relative">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0c101b] to-[#1e293b] border border-amber-500/30 shadow-md flex items-center justify-center text-amber-400 font-bold text-xl uppercase">
                    <span>{stylist.name ? stylist.name[0] : 'E'}</span>
                  </div>
                  <div className={`absolute -bottom-1 -right-1 w-5.5 h-5.5 rounded-full border-4 border-white dark:border-slate-950 flex items-center justify-center ${
                    stylist.availability === 'available' ? 'bg-emerald-500' : stylist.availability === 'busy' ? 'bg-amber-500' : 'bg-rose-500'
                  }`}>
                    {getAvailabilityIcon(stylist.availability)}
                  </div>
                </div>
                <div>
                   <h3 className="font-bold text-slate-800 dark:text-white leading-tight text-base">{stylist.name}</h3>
                  <span className={`inline-block text-[10px] font-bold uppercase tracking-wider mt-1.5 px-2 py-0.5 rounded-md ${getAvailabilityColor(stylist.availability)}`}>
                    {stylist.specialization}
                  </span>
                  <div className="flex items-center space-x-1 mt-2">
                    {[...Array(5)].map((_, i: number) => (
                      <Star key={i} className={`w-3.5 h-3.5 ${i < Math.floor(stylist.rating) ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_3px_rgba(251,191,36,0.45)]' : 'text-slate-300 dark:text-slate-800'}`} />
                    ))}
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400 ml-1">{parseFloat(stylist.rating).toFixed(1)}</span>
                  </div>
                </div>
              </div>
              
              {/* Responsive Edit/Delete - visible on hover for desktop, always visible on mobile */}
              <div className="flex items-center space-x-1 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-200">
                <button 
                  onClick={() => handleEdit(stylist)}
                  className="p-2 hover:bg-amber-500/10 rounded-xl transition-all text-amber-500"
                  title="Editar estilista"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleDelete(stylist.id)}
                  className="p-2 hover:bg-rose-500/10 rounded-xl transition-all text-rose-500"
                  title="Eliminar estilista"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="p-3.5 bg-slate-100/30 dark:bg-slate-950/60 rounded-2xl border border-slate-200/10 dark:border-slate-800/40">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Citas Hoy</p>
                <p className="text-lg font-extrabold text-slate-800 dark:text-white mt-1">{stylist.todayAppointments || 0}</p>
              </div>
              <div className="p-3.5 bg-slate-100/30 dark:bg-[#06080e]/60 rounded-2xl border border-slate-200/10 dark:border-slate-800/40">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Próxima Libre</p>
                <p className="text-lg font-extrabold text-amber-600 dark:text-amber-400 mt-1">{stylist.nextAvailable || 'Ahora'}</p>
              </div>
            </div>

            <div className="mt-6 flex space-x-3">
              <button 
                onClick={() => onTabChange ? onTabChange('appointments') : alert('Cambiando a citas...')}
                className="btn-accent py-2.5 px-3 flex-1 text-xs font-bold"
              >
                <Calendar className="w-4 h-4 text-amber-500" />
                <span>Agendar</span>
              </button>
              <button 
                onClick={() => alert(`Abriendo chat con ${stylist.name}...`)}
                className="bg-slate-100/50 dark:bg-slate-950/45 hover:bg-slate-200/50 dark:hover:bg-slate-900/60 border border-slate-200/20 dark:border-slate-800/60 text-slate-700 dark:text-slate-300 py-2.5 px-3 flex-1 text-xs font-bold transition-all duration-300 rounded-[16px] flex items-center justify-center space-x-2 ripple-host"
              >
                <MessageSquare className="w-4 h-4 text-slate-400 dark:text-slate-400" />
                <span>Mensaje</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {!fullView && onViewAll && (
        <div className="mt-8 pt-6 border-t border-slate-200/50 dark:border-slate-800 text-center">
          <button 
            onClick={onViewAll}
            className="text-amber-600 dark:text-amber-400 hover:text-amber-500 font-bold text-sm transition-colors flex items-center justify-center mx-auto space-x-1"
          >
            <span>Ver todo el equipo</span>
            <span>→</span>
          </button>
        </div>
      )}
    </div>
  )
}
