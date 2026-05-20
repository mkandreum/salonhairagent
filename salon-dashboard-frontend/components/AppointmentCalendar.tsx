'use client'

import { useState, useEffect } from 'react'
import { Calendar as CalendarIcon, Clock, User, Scissors, Plus, X, Trash2, Check, Edit2, ChevronLeft, ChevronRight, Filter } from 'lucide-react'
import { fetchAppointments, createAppointment, updateAppointment, fetchClients, fetchStylists, deleteAppointment as apiDeleteAppointment, updateAppointmentStatus } from '@/lib/api'


interface Appointment {
  id: number
  time: string
  date: string
  client: string
  client_id?: number
  service: string
  stylist: string
  stylist_id?: number
  status: 'confirmed' | 'pending' | 'cancelled'
}

interface AppointmentCalendarProps {
  fullView?: boolean
  onViewAll?: () => void
  searchQuery?: string
}

export default function AppointmentCalendar({ fullView = false, onViewAll, searchQuery = '' }: AppointmentCalendarProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null)
  const [clients, setClients] = useState<any[]>([])
  const [stylists, setStylists] = useState<any[]>([])
  
  const [formData, setFormData] = useState({
    client_id: '',
    stylist_id: '',
    service: '',
    time: '',
    date: new Date().toISOString().split('T')[0],
    price: 30.0,
    status: 'pending'
  })

  const loadData = async () => {
    setLoading(true)
    try {
      const [apps, cls, sts] = await Promise.all([
        fetchAppointments(),
        fetchClients(),
        fetchStylists()
      ])
      setAppointments(Array.isArray(apps) ? apps : [])
      setClients(Array.isArray(cls) ? cls : [])
      setStylists(Array.isArray(sts) ? sts : [])
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
      if (editingAppointment) {
        await updateAppointment(editingAppointment.id, formData)
      } else {
        await createAppointment(formData)
      }
      setIsModalOpen(false)
      setEditingAppointment(null)
      loadData()
      setFormData({ client_id: '', stylist_id: '', service: '', time: '', date: new Date().toISOString().split('T')[0], price: 30.0, status: 'pending' })
    } catch (err) {
      alert(editingAppointment ? 'Error al actualizar' : 'Error al crear')
    }
  }

  const handleEdit = (appointment: Appointment) => {
    setEditingAppointment(appointment)
    setFormData({
      client_id: appointment.client_id?.toString() || '',
      stylist_id: appointment.stylist_id?.toString() || '',
      service: appointment.service,
      time: appointment.time,
      date: appointment.date,
      price: (appointment as any).price || 30.0,
      status: appointment.status
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (confirm('¿Eliminar esta cita?')) {
      try {
        await apiDeleteAppointment(id)
        loadData()
      } catch (err) { alert('Error al eliminar') }
    }
  }

  const handleStatusChange = async (id: number, currentStatus: string) => {
    const nextStatus: Record<string, string> = { 'pending': 'confirmed', 'confirmed': 'cancelled', 'cancelled': 'pending' }
    const status = nextStatus[currentStatus] || 'pending'
    try {
      await updateAppointmentStatus(id, status)
      loadData()
    } catch (err) { alert('Error al actualizar') }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'badge-success'
      case 'pending': return 'badge-warning'
      case 'cancelled': return 'badge-danger'
      default: return 'badge-info'
    }
  }

  const filteredAppointments = Array.isArray(appointments) ? appointments.filter(a => 
    (a.client?.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (a.service?.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (a.stylist?.toLowerCase().includes(searchQuery.toLowerCase()))
  ) : []

  if (loading && appointments.length === 0) return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 md:p-6 shadow-sm border border-slate-200 dark:border-slate-800 animate-pulse h-[300px] md:h-[400px]" />
  )

  return (
    <div className="app-card p-4 md:p-6 animate-fade-float-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 md:mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <CalendarIcon className="w-5 h-5 text-slate-600 dark:text-slate-300" />
          </div>
          <div>
            <h2 className="text-base md:text-lg font-bold text-slate-800 dark:text-white">Agenda de Citas</h2>
            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-medium hidden sm:block">Gestión integral</p>
          </div>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn-premium primary-btn py-2 px-4 text-sm whitespace-nowrap ripple-host">
          <Plus className="w-4 h-4 mr-2 inline" />
          <span className="hidden sm:inline">Nueva Cita</span>
          <span className="sm:hidden">+</span>
        </button>
      </div>      {/* Mobile Cards View */}
      <div className="block md:hidden space-y-3">
        {filteredAppointments.slice(0, fullView ? undefined : 5).map((appointment: any) => (
          <div key={appointment.id} className="bg-slate-50/50 dark:bg-slate-950/40 rounded-2xl p-4 border border-slate-200/40 dark:border-slate-800/60 shadow-sm hover:border-amber-500/20 transition-all">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="font-bold text-slate-800 dark:text-white">{appointment.client || 'Cliente'}</p>
                <p className="text-xs text-slate-500 mt-0.5">{appointment.service}</p>
              </div>
              <button onClick={() => handleStatusChange(appointment.id, appointment.status)} className={`${getStatusColor(appointment.status)}`}>
                {appointment.status}
              </button>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center space-x-1.5">
                <CalendarIcon className="w-3.5 h-3.5 text-amber-500/70" />
                <span>{appointment.date}</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-500/70" />
                <span>{appointment.time}</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <Scissors className="w-3.5 h-3.5 text-amber-500/70" />
                <span>{appointment.stylist}</span>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/40">
              <button onClick={() => handleEdit(appointment)} className="p-2 hover:bg-amber-500/10 hover:text-amber-500 rounded-lg text-slate-400 dark:text-slate-500 transition-colors bg-slate-100 dark:bg-slate-900 border border-slate-200/30 dark:border-slate-800">
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => handleDelete(appointment.id)} className="p-2 hover:bg-rose-500/15 hover:text-rose-500 rounded-lg text-slate-400 dark:text-slate-500 transition-colors bg-slate-100 dark:bg-slate-900 border border-slate-200/30 dark:border-slate-800">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200/40 dark:border-slate-800/50">
              <th className="text-left py-3 px-2 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Fecha/Hora</th>
              <th className="text-left py-3 px-2 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Cliente</th>
              <th className="text-left py-3 px-2 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Servicio</th>
              <th className="text-left py-3 px-2 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Estilista</th>
              <th className="text-left py-3 px-2 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Estado</th>
              <th className="text-right py-3 px-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100/40 dark:divide-slate-800/30">
            {filteredAppointments.slice(0, fullView ? undefined : 5).map((appointment: any) => (
              <tr key={appointment.id} className="hover:bg-slate-50/50 dark:hover:bg-[#0c101b]/50 border-b border-slate-100 dark:border-slate-800/40 transition-colors">
                <td className="py-3 px-2">
                  <div className="flex flex-col">
                    <div className="flex items-center space-x-2">
                      <CalendarIcon className="w-3 h-3 text-slate-400" />
                      <span className="text-xs font-medium text-slate-500">{appointment.date}</span>
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      <Clock className="w-4 h-4 text-amber-500" />
                      <span className="font-bold text-slate-700 dark:text-slate-200">{appointment.time}</span>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200/40 dark:border-slate-700/50 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-amber-400 shadow-sm">
                      {appointment.client?.split(' ').map((n: string) => n[0]).join('') || '??'}
                    </div>
                    <span className="font-bold text-slate-800 dark:text-slate-100">{appointment.client}</span>
                  </div>
                </td>
                <td className="py-3 px-2 text-slate-600 dark:text-slate-400 font-bold text-sm">{appointment.service}</td>
                <td className="py-3 px-2">
                  <div className="flex items-center space-x-2">
                    <Scissors className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-600 dark:text-slate-400 font-semibold">{appointment.stylist}</span>
                  </div>
                </td>
                <td className="py-3 px-2">
                  <button onClick={() => handleStatusChange(appointment.id, appointment.status)} className={`transition-all ${getStatusColor(appointment.status)}`}>
                    {appointment.status.toUpperCase()}
                  </button>
                </td>
                <td className="py-3 px-2 text-right">
                  <div className="flex items-center justify-end space-x-1">
                    <button onClick={() => handleEdit(appointment)} className="p-2 hover:bg-amber-500/10 hover:text-amber-500 rounded-lg text-slate-400 dark:text-slate-500 transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(appointment.id)} className="p-2 hover:bg-rose-500/15 hover:text-rose-500 rounded-lg text-slate-400 dark:text-slate-500 transition-colors">
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
          <button onClick={onViewAll} className="text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200">
            Ver todas las citas →
          </button>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/65 backdrop-blur-md z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="app-card rounded-t-[32px] sm:rounded-2xl w-full sm:max-w-lg p-6 pb-[calc(2rem+env(safe-area-inset-bottom))] max-h-[85vh] overflow-y-auto animate-fade-float-in border-t border-slate-200/50 dark:border-amber-500/10">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">{editingAppointment ? 'Editar Cita' : 'Nueva Cita'}</h3>
              <button onClick={() => { setIsModalOpen(false); setEditingAppointment(null); }} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-widest mb-2">Cliente</label>
                <select required value={formData.client_id} onChange={e => setFormData({...formData, client_id: e.target.value})} className="input-premium py-2.5 dark:bg-[#0c101b]">
                  <option value="" className="dark:bg-[#0c101b]">Seleccionar cliente</option>
                  {Array.isArray(clients) && clients.map(c => <option key={c.id} value={c.id} className="dark:bg-[#0c101b]">{c.name}</option>)}
                </select>
              </div>
              
              <div>
                <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-widest mb-2">Estilista</label>
                <select required value={formData.stylist_id} onChange={e => setFormData({...formData, stylist_id: e.target.value})} className="input-premium py-2.5 dark:bg-[#0c101b]">
                  <option value="" className="dark:bg-[#0c101b]">Seleccionar estilista</option>
                  {Array.isArray(stylists) && stylists.map(s => <option key={s.id} value={s.id} className="dark:bg-[#0c101b]">{s.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-widest mb-2">Servicio</label>
                <input type="text" required placeholder="Ej: Corte" value={formData.service} onChange={e => setFormData({...formData, service: e.target.value})} className="input-premium" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-widest mb-2">Fecha</label>
                  <input type="date" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="input-premium" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-widest mb-2">Hora</label>
                  <input type="time" required value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} className="input-premium" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-widest mb-2">Precio (€)</label>
                <input type="number" step="0.01" required value={formData.price} onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})} className="input-premium" />
              </div>

              <button type="submit" className="btn-premium primary-btn w-full py-4 mt-2 font-bold flex items-center justify-center space-x-2">
                <span>{editingAppointment ? 'Actualizar Cita' : 'Crear Cita'}</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}