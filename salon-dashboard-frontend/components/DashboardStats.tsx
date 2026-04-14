'use client'

import { Calendar, Users, DollarSign, TrendingUp } from 'lucide-react'

const stats = [
  {
    title: 'Today\'s Appointments',
    value: '24',
    change: '+3',
    icon: Calendar,
    color: 'bg-blue-500',
  },
  {
    title: 'Active Clients',
    value: '1,248',
    change: '+12%',
    icon: Users,
    color: 'bg-green-500',
  },
  {
    title: 'Revenue Today',
    value: '$2,845',
    change: '+8%',
    icon: DollarSign,
    color: 'bg-purple-500',
  },
  {
    title: 'Occupancy Rate',
    value: '78%',
    change: '+5%',
    icon: TrendingUp,
    color: 'bg-orange-500',
  },
]

export default function DashboardStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <div key={stat.title} className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{stat.value}</p>
                <p className="text-sm text-green-600 mt-1">
                  <span className="font-medium">{stat.change}</span> from yesterday
                </p>
              </div>
              <div className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}