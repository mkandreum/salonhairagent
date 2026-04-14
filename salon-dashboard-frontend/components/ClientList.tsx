'use client'

import { useState } from 'react'
import { User, Phone, Mail, Calendar, MoreVertical } from 'lucide-react'

interface Client {
  id: number
  name: string
  phone: string
  email: string
  lastVisit: string
  totalVisits: number
  totalSpent: number
}

const clients: Client[] = [
  { id: 1, name: 'Sarah Johnson', phone: '(555) 123-4567', email: 'sarah@email.com', lastVisit: '2024-04-08', totalVisits: 12, totalSpent: 850 },
  { id: 2, name: 'Michael Brown', phone: '(555) 234-5678', email: 'michael@email.com', lastVisit: '2024-04-07', totalVisits: 8, totalSpent: 520 },
  { id: 3, name: 'Lisa Anderson', phone: '(555) 345-6789', email: 'lisa@email.com', lastVisit: '2024-04-06', totalVisits: 15, totalSpent: 1200 },
  { id: 4, name: 'Robert Taylor', phone: '(555) 456-7890', email: 'robert@email.com', lastVisit: '2024-04-05', totalVisits: 6, totalSpent: 380 },
  { id: 5, name: 'Jennifer Lee', phone: '(555) 567-8901', email: 'jennifer@email.com', lastVisit: '2024-04-04', totalVisits: 10, totalSpent: 750 },
]

interface ClientListProps {
  fullView?: boolean
}

export default function ClientList({ fullView = false }: ClientListProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.phone.includes(searchQuery)
  )

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <User className="w-6 h-6 text-primary-600" />
          <h2 className="text-xl font-bold text-gray-800">Recent Clients</h2>
        </div>
        <div className="flex items-center space-x-4">
          <input
            type="text"
            placeholder="Search clients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field"
          />
          <button className="btn-primary">
            + Add Client
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-4 text-gray-600 font-medium">Client</th>
              <th className="text-left py-3 px-4 text-gray-600 font-medium">Contact</th>
              <th className="text-left py-3 px-4 text-gray-600 font-medium">Last Visit</th>
              <th className="text-left py-3 px-4 text-gray-600 font-medium">Total Visits</th>
              <th className="text-left py-3 px-4 text-gray-600 font-medium">Total Spent</th>
              <th className="text-left py-3 px-4 text-gray-600 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredClients.map((client) => (
              <tr key={client.id} className="border-b hover:bg-gray-50">
                <td className="py-3 px-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <p className="font-medium">{client.name}</p>
                      <p className="text-sm text-gray-500">VIP Client</p>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">{client.phone}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">{client.email}</span>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span>{client.lastVisit}</span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span className="font-medium">{client.totalVisits}</span>
                </td>
                <td className="py-3 px-4">
                  <span className="font-medium">${client.totalSpent}</span>
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
            View All Clients →
          </button>
        </div>
      )}
    </div>
  )
}