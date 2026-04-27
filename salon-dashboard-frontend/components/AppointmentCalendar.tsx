'use client'

import { useState, useEffect } from 'react'
import { Calendar as CalendarIcon, Clock, User, Scissors, MoreVertical, Plus, X, Trash2, Check, AlertCircle, Edit2 } from 'lucide-react'
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
  
  // Form state
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
      setAppointments(apps)
      setClients(cls)
      setStylists(sts)
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
      if (editingAppointment) {
        await updateAppointment(editingAppointment.id, formData)
      } else {
        await createAppointment(formData)
      }
      setIsModalOpen(false)
      setEditingAppointment(null)
      loadData() // Refresh
      setFormData({ client_id: '', stylist_id: '', service: '', time: '', date: new Date().toISOString().split('T')[0], price: 30.0, status: 'pending' })
    } catch (err) {
      alert(editingAppointment ? 'Error al actualizar la cita' : 'Error al crear la cita')
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
    if (confirm('¿Estás seguro de que deseas eliminar esta cita?')) {
      try {
        await apiDeleteAppointment(id)
        loadData()
      } catch (err) {
        alert('Error al eliminar la cita')
      }
    }
  }

  const handleStatusChange = async (id: number, currentStatus: string) => {
    const nextStatus: Record<string, string> = {
      'pending': 'confirmed',
      'confirmed': 'cancelled',
      'cancelled': 'pending'
    }
    const status = nextStatus[currentStatus] || 'pending'
    try {
      await updateAppointmentStatus(id, status)
      loadData()
    } catch (err) {
      alert('Error al actualizar el estado')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
      case 'pending': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
      case 'cancelled': return 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
    }
  }

  const filteredAppointments = appointments.filter(a => 
    (a.client?.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (a.service?.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (a.stylist?.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  if (loading && appointments.length === 0) return <div className="glass-card p-8 animate-pulse h-[400px]" />

  return (
    <div className="glass-card p-8 relative">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center">
            <CalendarIcon className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Agenda de Citas</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Gestión integral de horarios</p>
          </div>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn-premium py-2 px-4 text-sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nueva Cita
        </button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="glass-card p-8 w-full max-w-lg animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">{editingAppointment ? 'Editar Cita' : 'Nueva Cita'}</h3>
              <button onClick={() => { setIsModalOpen(false); setEditingAppointment(null); }} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Cliente</label>
                <select 
                  required
                  value={formData.client_id}
                  onChange={e => setFormData({...formData, client_id: e.target.value})}
                  className="input-premium py-2"
                >
                  <option value="">Seleccionar cliente</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Estilista</label>
                <select 
                  required
                  value={formData.stylist_id}
                  onChange={e => setFormData({...formData, stylist_id: e.target.value})}
                  className="input-premium py-2"
                >
                  <option value="">Seleccionar estilista</option>
                  {stylists.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Servicio</label>
                <input 
                  type="text" 
                  required
                  placeholder="Ej: Corte"
                  value={formData.service}
                  onChange={e => setFormData({...formData, service: e.target.value})}
                  className="input-premium py-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Fecha</label>
                  <input 
                    type="date" 
                    required
                    value={formData.date}
                    onChange={e => setFormData({...formData, date: e.target.value})}
                    className="input-premium py-2"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Hora</label>
                  <input 
                    type="time" 
                    required
                    value={formData.time}
                    onChange={e => setFormData({...formData, time: e.target.value})}
                    className="input-premium py-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Precio (€)</label>
                <input 
                  type="number" 
                  step="0.01"
                  required
                  value={formData.price}
                  onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})}
                  className="input-premium py-2"
                />
              </div>

              <button type="submit" className="btn-premium w-full mt-6 py-3">
                {editingAppointment ? 'Actualizar Cita' : 'Crear Cita'}
              </button>
            </form>
          </div>
        </div>
      )}


      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800">
              <th className="text-left py-4 px-2 text-slate-400 font-bold uppercase tracking-wider text-xs">Fecha/Hora</th>
              <th className="text-left py-4 px-2 text-slate-400 font-bold uppercase tracking-wider text-xs">Cliente</th>
              <th className="text-left py-4 px-2 text-slate-400 font-bold uppercase tracking-wider text-xs">Servicio</th>
              <th className="text-left py-4 px-2 text-slate-400 font-bold uppercase tracking-wider text-xs">Estilista</th>
              <th className="text-left py-4 px-2 text-slate-400 font-bold uppercase tracking-wider text-xs">Estado</th>
              <th className="text-left py-4 px-2 text-slate-400 font-bold uppercase tracking-wider text-xs"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
            {filteredAppointments.map((appointment: any) => (
              <tr key={appointment.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                <td className="py-4 px-2">
                  <div className="flex flex-col">
                    <div className="flex items-center space-x-2">
                      <CalendarIcon className="w-3 h-3 text-slate-400" />
                      <span className="text-xs font-medium text-slate-500">{appointment.date}</span>
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <span className="font-bold text-slate-700 dark:text-slate-200">{appointment.time}</span>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-400">
                      {appointment.client?.split(' ').map((n: string) => n[0]).join('') || '??'}
                    </div>
                    <span className="font-semibold text-slate-800 dark:text-slate-100">{appointment.client}</span>
                  </div>
                </td>
                <td className="py-4 px-2 text-slate-600 dark:text-slate-400 font-medium">{appointment.service}</td>
                <td className="py-4 px-2">
                  <div className="flex items-center space-x-2">
                    <Scissors className="w-4 h-4 text-indigo-400" />
                    <span className="text-slate-600 dark:text-slate-400 font-medium">{appointment.stylist}</span>
                  </div>
                </td>
                <td className="py-4 px-2">
                  <button 
                    onClick={() => handleStatusChange(appointment.id, appointment.status)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all hover:scale-105 active:scale-95 ${getStatusColor(appointment.status)}`}
                  >
                    {appointment.status.toUpperCase()}
                  </button>
                </td>
                <td className="py-4 px-2 text-right">
                  <div className="flex items-center justify-end space-x-1">
                    <button 
                      onClick={() => handleEdit(appointment)}
                      className="p-2 hover:bg-indigo-50 dark:hover:bg-indigo-900/10 rounded-lg transition-all shadow-sm opacity-0 group-hover:opacity-100 text-indigo-500"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => handleDelete(appointment.id)}
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
            Ver todas las citas →
          </button>
        </div>
      )}
    </div>
  )
}