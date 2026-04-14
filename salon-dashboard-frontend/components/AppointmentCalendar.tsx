'use client'

import { useState } from 'react'
import { Calendar as CalendarIcon, Clock, User, Scissors, MoreVertical } from 'lucide-react'

interface Appointment {
  id: number
  time: string
  client: string
  service: string
  stylist: string
  status: 'confirmed' | 'pending' | 'cancelled'
}

const appointments: Appointment[] = [
  { id: 1, time: '09:00 AM', client: 'Sarah Johnson', service: 'Haircut & Style', stylist: 'Emma Wilson', status: 'confirmed' },
  { id: 2, time: '10:30 AM', client: 'Michael Brown', service: 'Beard Trim', stylist: 'James Miller', status: 'confirmed' },
  { id: 3, time: '11:45 AM', client: 'Lisa Anderson', service: 'Color Treatment', stylist: 'Sophia Davis', status: 'pending' },
  { id: 4, time: '02:00 PM', client: 'Robert Taylor', service: 'Haircut', stylist: 'Emma Wilson', status: 'confirmed' },
  { id: 5, time: '03:30 PM', client: 'Jennifer Lee', service: 'Highlights', stylist: 'Sophia Davis', status: 'confirmed' },
  { id: 6, time: '04:45 PM', client: 'David Wilson', service: 'Shave', stylist: 'James Miller', status: 'cancelled' },
]

interface AppointmentCalendarProps {
  fullView?: boolean
}

export default function AppointmentCalendar({ fullView = false }: AppointmentCalendarProps) {
  const [selectedDate, setSelectedDate] = useState(new Date())

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <CalendarIcon className="w-6 h-6 text-primary-600" />
          <h2 className="text-xl font-bold text-gray-800">Today's Appointments</h2>
        </div>
        <button className="btn-primary">
          + New Appointment
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-4 text-gray-600 font-medium">Time</th>
              <th className="text-left py-3 px-4 text-gray-600 font-medium">Client</th>
              <th className="text-left py-3 px-4 text-gray-600 font-medium">Service</th>
              <th className="text-left py-3 px-4 text-gray-600 font-medium">Stylist</th>
              <th className="text-left py-3 px-4 text-gray-600 font-medium">Status</th>
              <th className="text-left py-3 px-4 text-gray-600 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((appointment) => (
              <tr key={appointment.id} className="border-b hover:bg-gray-50">
                <td className="py-3 px-4">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="font-medium">{appointment.time}</span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span>{appointment.client}</span>
                  </div>
                </td>
                <td className="py-3 px-4">{appointment.service}</td>
                <td className="py-3 px-4">
                  <div className="flex items-center space-x-2">
                    <Scissors className="w-4 h-4 text-gray-400" />
                    <span>{appointment.stylist}</span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                    {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <button className="p-1 hover:bg-gray-100 rounded">
                    <MoreVertical className="w-5 h-5 text-gray-400" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!fullView && (
        <div className="mt-6 text-center">
          <button className="text-primary-600 hover:text-primary-700 font-medium">
            View All Appointments →
          </button>
        </div>
      )}
    </div>
  )
}