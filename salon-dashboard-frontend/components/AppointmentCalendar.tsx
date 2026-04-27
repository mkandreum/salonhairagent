'use client'

import { useState, useEffect } from 'react'
import { Calendar as CalendarIcon, Clock, User, Scissors, MoreVertical, Plus, X } from 'lucide-react'
import { fetchAppointments, createAppointment, fetchClients, fetchStylists } from '@/lib/api'

interface Appointment {
  id: number
  time: string
  client: string
  service: string
  stylist: string
  status: 'confirmed' | 'pending' | 'cancelled'
}

interface AppointmentCalendarProps {
  fullView?: boolean
}

export default function AppointmentCalendar({ fullView = false }: AppointmentCalendarProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [clients, setClients] = useState<any[]>([])
  const [stylists, setStylists] = useState<any[]>([])
  
  // Form state
  const [formData, setFormData] = useState({
    client_id: '',
    stylist_id: '',
    service: '',
    time: ''
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
      await createAppointment(formData)
      setIsModalOpen(false)
      loadData() // Refresh
      setFormData({ client_id: '', stylist_id: '', service: '', time: '' })
    } catch (err) {
      alert('Error al crear la cita')
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

  if (loading && appointments.length === 0) return <div className="glass-card p-8 animate-pulse h-[400px]" />

  return (
    <div className="glass-card p-8 relative">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center">
            <CalendarIcon className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Citas de Hoy</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Lunes, 27 de Abril</p>
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
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">Nueva Cita</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
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

              <div className="grid grid-cols-2 gap-4">
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

              <button type="submit" className="btn-premium w-full mt-6 py-3">
                Crear Cita
              </button>
            </form>
          </div>
        </div>
      )}


      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800">
              <th className="text-left py-4 px-2 text-slate-400 font-bold uppercase tracking-wider text-xs">Hora</th>
              <th className="text-left py-4 px-2 text-slate-400 font-bold uppercase tracking-wider text-xs">Cliente</th>
              <th className="text-left py-4 px-2 text-slate-400 font-bold uppercase tracking-wider text-xs">Servicio</th>
              <th className="text-left py-4 px-2 text-slate-400 font-bold uppercase tracking-wider text-xs">Estilista</th>
              <th className="text-left py-4 px-2 text-slate-400 font-bold uppercase tracking-wider text-xs">Estado</th>
              <th className="text-left py-4 px-2 text-slate-400 font-bold uppercase tracking-wider text-xs"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
            {appointments.map((appointment) => (
              <tr key={appointment.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                <td className="py-4 px-2">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span className="font-bold text-slate-700 dark:text-slate-200">{appointment.time}</span>
                  </div>
                </td>
                <td className="py-4 px-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-400">
                      {appointment.client.split(' ').map(n => n[0]).join('')}
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
                  <span className={`px-3 py-1 rounded-lg text-xs font-bold ${getStatusColor(appointment.status)}`}>
                    {appointment.status.toUpperCase()}
                  </span>
                </td>
                <td className="py-4 px-2 text-right">
                  <button className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-all shadow-sm border border-transparent hover:border-slate-100 dark:hover:border-slate-600 opacity-0 group-hover:opacity-100">
                    <MoreVertical className="w-5 h-5 text-slate-400" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!fullView && (
        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
          <button className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 font-bold text-sm transition-colors">
            Ver todas las citas →
          </button>
        </div>
      )}
    </div>
  )
}
