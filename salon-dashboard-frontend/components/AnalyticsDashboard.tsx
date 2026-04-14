'use client'

import { BarChart3, TrendingUp, TrendingDown } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'

const revenueData = [
  { month: 'Jan', revenue: 4200, appointments: 120 },
  { month: 'Feb', revenue: 5200, appointments: 145 },
  { month: 'Mar', revenue: 6100, appointments: 168 },
  { month: 'Apr', revenue: 5800, appointments: 152 },
  { month: 'May', revenue: 7200, appointments: 195 },
  { month: 'Jun', revenue: 6800, appointments: 182 },
]

const serviceData = [
  { name: 'Haircut', value: 45, color: '#0ea5e9' },
  { name: 'Color', value: 25, color: '#ec4899' },
  { name: 'Styling', value: 15, color: '#10b981' },
  { name: 'Treatment', value: 10, color: '#f59e0b' },
  { name: 'Other', value: 5, color: '#8b5cf6' },
]

interface AnalyticsDashboardProps {
  fullView?: boolean
}

export default function AnalyticsDashboard({ fullView = false }: AnalyticsDashboardProps) {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <BarChart3 className="w-6 h-6 text-primary-600" />
          <h2 className="text-xl font-bold text-gray-800">Business Analytics</h2>
        </div>
        <div className="flex items-center space-x-4">
          <select className="input-field">
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>Last 3 months</option>
            <option>Last year</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h3 className="font-bold text-gray-800 mb-4">Revenue Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip />
                <Line type="monotone" dataKey="revenue" stroke="#0ea5e9" strokeWidth={2} />
                <Line type="monotone" dataKey="appointments" stroke="#ec4899" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-between mt-4">
            <div>
              <p className="text-sm text-gray-500">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-800">$35,300</p>
              <div className="flex items-center text-green-600">
                <TrendingUp className="w-4 h-4 mr-1" />
                <span className="text-sm">+12.5% from last month</span>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Appointments</p>
              <p className="text-2xl font-bold text-gray-800">962</p>
              <div className="flex items-center text-green-600">
                <TrendingUp className="w-4 h-4 mr-1" />
                <span className="text-sm">+8.2% from last month</span>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-bold text-gray-800 mb-4">Service Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={serviceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip />
                <Bar dataKey="value" fill="#0ea5e9" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-3">
            {serviceData.map((service) => (
              <div key={service.name} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: service.color }} />
                  <span className="text-sm font-medium">{service.name}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="font-bold">{service.value}%</span>
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full" 
                      style={{ width: `${service.value}%`, backgroundColor: service.color }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {!fullView && (
        <div className="mt-6 text-center">
          <button className="text-primary-600 hover:text-primary-700 font-medium">
            View Detailed Analytics →
          </button>
        </div>
      )}
    </div>
  )
}