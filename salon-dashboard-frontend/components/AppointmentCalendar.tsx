'use client'

import { useState, useEffect } from 'react'
import { Calendar as CalendarIcon, Clock, User, Scissors, Plus, X, Trash2, Edit2, ChevronLeft, ChevronRight } from 'lucide-react'
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
      case 'confirmed': return 'badge-confirmed'
      case 'pending': return 'badge-pending'
      case 'cancelled': return 'badge-cancelled'
      default: return 'badge-pending'
    }
  }

  const filteredAppointments = Array.isArray(appointments) ? appointments.filter(a => 
    (a.client?.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (a.service?.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (a.stylist?.toLowerCase().includes(searchQuery.toLowerCase()))
  ) : []

  if (loading && appointments.length === 0) return (
    <div className="app-card animate-pulse h-[300px] md:h-[400px] bg-white/[0.01] border-white/5" />
  )

  return (
    <div className="app-card p-5 md:p-8 animate-fadeUp">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8 pb-4 border-b border-white/[0.04]">
        <div className="flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-2xl bg-[#E5C17B]/10 border border-[#E5C17B]/20 flex items-center justify-center shadow-md">
            <CalendarIcon className="w-5 h-5 text-[#E5C17B]" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Agenda de Citas</h2>
            <p className="text-white/40 font-mono text-[9px] uppercase tracking-widest hidden sm:block">Gestión de tocadores e historial</p>
          </div>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn-premium py-2.5 px-4 text-xs">
          <Plus className="w-4 h-4 mr-1.5 inline stroke-[2.5]" />
          <span>Nueva Cita</span>
        </button>
      </div>

      {/* Mobile Cards View */}
      <div className="block md:hidden space-y-3.5">
        {filteredAppointments.slice(0, fullView ? undefined : 5).map((appointment: any) => (
          <div key={appointment.id} className="p-4 bg-white/[0.01] border border-white/[0.04] rounded-2xl hover:border-[#E5C17B]/20 transition-all duration-300">
            <div className="flex justify-between items-start mb-3.5">
              <div>
                <p className="font-bold text-white text-sm">{appointment.client || 'Cliente'}</p>
                <p className="text-xs text-white/40 mt-1 font-semibold">{appointment.service}</p>
              </div>
              <button 
                onClick={() => handleStatusChange(appointment.id, appointment.status)} 
                className={`text-[9px] font-extrabold font-mono tracking-widest px-2.5 py-1 rounded-md uppercase ${getStatusColor(appointment.status)}`}
              >
                {appointment.status}
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2 text-[10px] text-white/45 pt-3 border-t border-white/[0.03]">
              <div className="flex items-center space-x-1.5">
                <CalendarIcon className="w-3.5 h-3.5 text-[#E5C17B]/60" />
                <span>{appointment.date}</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <Clock className="w-3.5 h-3.5 text-[#E5C17B]/60" />
                <span className="font-semibold text-white/80">{appointment.time}</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <Scissors className="w-3.5 h-3.5 text-[#E5C17B]/60" />
                <span className="truncate">{appointment.stylist}</span>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4 pt-3.5 border-t border-white/[0.03]">
              <button onClick={() => handleEdit(appointment)} className="p-2 bg-white/[0.02] border border-white/5 hover:border-[#E5C17B]/30 hover:text-[#E5C17B] rounded-xl text-white/40 transition-all duration-300">
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => handleDelete(appointment.id)} className="p-2 bg-white/[0.02] border border-white/5 hover:bg-rose-500/10 hover:text-rose-400 rounded-xl text-white/40 transition-all duration-300">
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
            <tr className="border-b border-white/[0.04]">
              <th className="text-left pb-4 px-3 text-white/35 font-mono text-[9px] uppercase tracking-widest">Fecha/Hora</th>
              <th className="text-left pb-4 px-3 text-white/35 font-mono text-[9px] uppercase tracking-widest">Cliente</th>
              <th className="text-left pb-4 px-3 text-white/35 font-mono text-[9px] uppercase tracking-widest">Servicio</th>
              <th className="text-left pb-4 px-3 text-white/35 font-mono text-[9px] uppercase tracking-widest">Estilista</th>
              <th className="text-left pb-4 px-3 text-white/35 font-mono text-[9px] uppercase tracking-widest">Estado</th>
              <th className="text-right pb-4 px-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.03]">
            {filteredAppointments.slice(0, fullView ? undefined : 5).map((appointment: any) => (
              <tr key={appointment.id} className="hover:bg-white/[0.015] transition-colors duration-300">
                <td className="py-4.5 px-3">
                  <div className="flex flex-col">
                    <div className="flex items-center space-x-2">
                      <CalendarIcon className="w-3 h-3 text-white/35" />
                      <span className="text-[11px] font-semibold text-white/45">{appointment.date}</span>
                    </div>
                    <div className="flex items-center space-x-2 mt-1.5">
                      <Clock className="w-4 h-4 text-[#E5C17B]" />
                      <span className="font-bold text-white/90 text-sm">{appointment.time}</span>
                    </div>
                  </div>
                </td>
                <td className="py-4.5 px-3">
                  <div className="flex items-center space-x-3.5">
                    <div className="w-9 h-9 rounded-xl bg-[#E5C17B]/10 border border-[#E5C17B]/20 flex items-center justify-center text-xs font-bold text-[#E5C17B] shadow-inner">
                      {appointment.client?.split(' ').map((n: string) => n[0]).join('') || '??'}
                    </div>
                    <span className="font-bold text-white/90">{appointment.client}</span>
                  </div>
                </td>
                <td className="py-4.5 px-3 text-white/80 font-bold text-sm">{appointment.service}</td>
                <td className="py-4.5 px-3">
                  <div className="flex items-center space-x-2.5">
                    <Scissors className="w-4 h-4 text-white/35" />
                    <span className="text-white/70 font-semibold text-sm">{appointment.stylist}</span>
                  </div>
                </td>
                <td className="py-4.5 px-3">
                  <button 
                    onClick={() => handleStatusChange(appointment.id, appointment.status)} 
                    className={`text-[9px] font-extrabold font-mono tracking-widest px-2.5 py-1 rounded-md uppercase transition-all duration-300 ${getStatusColor(appointment.status)}`}
                  >
                    {appointment.status.toUpperCase()}
                  </button>
                </td>
                <td className="py-4.5 px-3 text-right">
                  <div className="flex items-center justify-end space-x-1.5">
                    <button onClick={() => handleEdit(appointment)} className="p-2 bg-white/[0.01] border border-white/5 hover:border-[#E5C17B]/30 hover:text-[#E5C17B] rounded-xl text-white/40 transition-all duration-300">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDelete(appointment.id)} className="p-2 bg-white/[0.01] border border-white/5 hover:bg-rose-500/10 hover:text-rose-400 rounded-xl text-white/40 transition-all duration-300">
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
            Ver todas las citas de la agenda →
          </button>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-[#090709]/85 backdrop-blur-md z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="app-card-overlay rounded-t-[32px] sm:rounded-3xl w-full sm:max-w-lg p-6 sm:p-8 pb-[calc(2rem+env(safe-area-inset-bottom))] max-h-[85vh] overflow-y-auto border-white/10 shadow-2xl relative">
            <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#E5C17B]/20 to-transparent" />
            
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white tracking-tight">{editingAppointment ? 'Editar Cita' : 'Nueva Cita en Agenda'}</h3>
              <button onClick={() => { setIsModalOpen(false); setEditingAppointment(null); }} className="p-2 bg-white/[0.02] hover:bg-white/[0.06] rounded-xl transition-all">
                <X className="w-4.5 h-4.5 text-white/40" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-white/40 font-mono text-[9px] uppercase tracking-widest mb-2 px-1 font-bold">Cliente</label>
                <select required value={formData.client_id} onChange={e => setFormData({...formData, client_id: e.target.value})} className="input-premium py-3 font-semibold text-white/80 bg-[#0c0a0c]">
                  <option value="">Seleccionar cliente</option>
                  {Array.isArray(clients) && clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              
              <div>
                <label className="block text-white/40 font-mono text-[9px] uppercase tracking-widest mb-2 px-1 font-bold">Estilista</label>
                <select required value={formData.stylist_id} onChange={e => setFormData({...formData, stylist_id: e.target.value})} className="input-premium py-3 font-semibold text-white/80 bg-[#0c0a0c]">
                  <option value="">Seleccionar estilista</option>
                  {Array.isArray(stylists) && stylists.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-white/40 font-mono text-[9px] uppercase tracking-widest mb-2 px-1 font-bold">Servicio</label>
                <input type="text" required placeholder="Ej: Corte & Peinado" value={formData.service} onChange={e => setFormData({...formData, service: e.target.value})} className="input-premium py-3 font-semibold" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/40 font-mono text-[9px] uppercase tracking-widest mb-2 px-1 font-bold">Fecha</label>
                  <input type="date" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="input-premium py-3 font-semibold" style={{colorScheme: 'dark'}} />
                </div>
                <div>
                  <label className="block text-white/40 font-mono text-[9px] uppercase tracking-widest mb-2 px-1 font-bold">Hora</label>
                  <input type="time" required value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} className="input-premium py-3 font-semibold" style={{colorScheme: 'dark'}} />
                </div>
              </div>

              <div>
                <label className="block text-white/40 font-mono text-[9px] uppercase tracking-widest mb-2 px-1 font-bold">Tarifa (€)</label>
                <input type="number" step="0.01" required value={formData.price} onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})} className="input-premium py-3 font-semibold" />
              </div>

              <button type="submit" className="btn-premium w-full py-4 mt-4 shadow-lg shadow-[#E5C17B]/5">
                <span>{editingAppointment ? 'Actualizar Registro' : 'Confirmar Cita'}</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
