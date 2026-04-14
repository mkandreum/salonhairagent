'use client'

import { useState } from 'react'
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'
import DashboardStats from '@/components/DashboardStats'
import AppointmentCalendar from '@/components/AppointmentCalendar'
import ClientList from '@/components/ClientList'
import StylistSchedule from '@/components/StylistSchedule'
import AnalyticsDashboard from '@/components/AnalyticsDashboard'
import NotificationsPanel from '@/components/NotificationsPanel'

export default function Home() {
  const [activeTab, setActiveTab] = useState('dashboard')

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <DashboardStats />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AppointmentCalendar />
              <AnalyticsDashboard />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ClientList />
              <StylistSchedule />
            </div>
          </div>
        )
      case 'appointments':
        return <AppointmentCalendar fullView />
      case 'clients':
        return <ClientList fullView />
      case 'stylists':
        return <StylistSchedule fullView />
      case 'analytics':
        return <AnalyticsDashboard fullView />
      default:
        return <DashboardStats />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="ml-64">
        <Header />
        <main className="p-6">
          {renderContent()}
          <NotificationsPanel />
        </main>
      </div>
    </div>
  )
}