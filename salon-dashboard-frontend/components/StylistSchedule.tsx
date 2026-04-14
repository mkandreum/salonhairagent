'use client'

import { useState } from 'react'
import { Scissors, Clock, CheckCircle, XCircle, MoreVertical } from 'lucide-react'

interface Stylist {
  id: number
  name: string
  specialization: string
  todayAppointments: number
  availability: 'available' | 'busy' | 'off'
  nextAvailable: string
  rating: number
}

const stylists: Stylist[] = [
  { id: 1, name: 'Emma Wilson', specialization: 'Color Specialist', todayAppointments: 8, availability: 'busy', nextAvailable: '2:00 PM', rating: 4.9 },
  { id: 2, name: 'James Miller', specialization: 'Barber', todayAppointments: 6, availability: 'available', nextAvailable: 'Now', rating: 4.8 },
  { id: 3, name: 'Sophia Davis', specialization: 'Stylist', todayAppointments: 7, availability: 'busy', nextAvailable: '3:30 PM', rating: 4.7 },
  { id: 4, name: 'Alex Johnson', specialization: 'Extensions', todayAppointments: 4, availability: 'available', nextAvailable: 'Now', rating: 4.6 },
]

interface StylistScheduleProps {
  fullView?: boolean
}

export default function StylistSchedule({ fullView = false }: StylistScheduleProps) {
  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'available': return 'bg-green-100 text-green-800'
      case 'busy': return 'bg-yellow-100 text-yellow-800'
      case 'off': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
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

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Scissors className="w-6 h-6 text-primary-600" />
          <h2 className="text-xl font-bold text-gray-800">Stylist Schedule</h2>
        </div>
        <button className="btn-primary">
          + Add Stylist
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {stylists.map((stylist) => (
          <div key={stylist.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                  <Scissors className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">{stylist.name}</h3>
                  <p className="text-sm text-gray-500">{stylist.specialization}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-yellow-500">★</span>
                    <span className="text-sm font-medium">{stylist.rating}</span>
                  </div>
                </div>
              </div>
              <button className="p-1 hover:bg-gray-100 rounded">
                <MoreVertical className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Today's Appointments</p>
                <p className="text-lg font-bold text-gray-800">{stylist.todayAppointments}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Next Available</p>
                <p className="text-lg font-bold text-gray-800">{stylist.nextAvailable}</p>
              </div>
            </div>

            <div className="mt-4">
              <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full ${getAvailabilityColor(stylist.availability)}`}>
                {getAvailabilityIcon(stylist.availability)}
                <span className="text-sm font-medium">
                  {stylist.availability.charAt(0).toUpperCase() + stylist.availability.slice(1)}
                </span>
              </div>
            </div>

            <div className="mt-4 flex space-x-2">
              <button className="flex-1 btn-primary py-2">
                Schedule
              </button>
              <button className="flex-1 btn-secondary py-2">
                Message
              </button>
            </div>
          </div>
        ))}
      </div>

      {!fullView && (
        <div className="mt-6 text-center">
          <button className="text-primary-600 hover:text-primary-700 font-medium">
            View All Stylists →
          </button>
        </div>
      )}
    </div>
  )
}