'use client'

import { useState } from 'react'
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'
import DashboardStats from '@/components/DashboardStats'
import AppointmentCalendar from '@/components/AppointmentCalendar'
import ClientList from '@/components/ClientList'
import StylistSchedule from '@/components/StylistSchedule'
import AnalyticsDashboard from '@/components/AnalyticsDashboard'
import TriageView from '@/components/TriageView'
import NotificationsPanel from '@/components/NotificationsPanel'
import Login from '@/components/Login'

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [activeTab, setActiveTab] = useState('dashboard')

  if (!isLoggedIn) {
    return <Login onLogin={() => setIsLoggedIn(true)} />
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <DashboardStats />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <AppointmentCalendar />
              <AnalyticsDashboard />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <ClientList />
              <StylistSchedule />
            </div>
          </div>
        )
      case 'appointments':
        return <div className="animate-in fade-in slide-in-from-bottom-4 duration-500"><AppointmentCalendar fullView /></div>
      case 'clients':
        return <div className="animate-in fade-in slide-in-from-bottom-4 duration-500"><ClientList fullView /></div>
      case 'stylists':
        return <div className="animate-in fade-in slide-in-from-bottom-4 duration-500"><StylistSchedule fullView /></div>
      case 'analytics':
        return <div className="animate-in fade-in slide-in-from-bottom-4 duration-500"><AnalyticsDashboard fullView /></div>
      case 'triage':
        return <div className="animate-in fade-in slide-in-from-bottom-4 duration-500"><TriageView /></div>
      default:
        return <DashboardStats />
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="flex-1 ml-72 flex flex-col min-h-screen">
        <Header />
        <main className="p-8 flex-1">
          <div className="max-w-[1600px] mx-auto">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-slate-800 dark:text-white capitalize">
                {activeTab === 'dashboard' ? 'Panel de Control' : activeTab}
              </h2>
              <p className="text-slate-500 dark:text-slate-400 mt-1">Bienvenido de nuevo, aquí está lo que está pasando hoy.</p>
            </div>
            {renderContent()}
          </div>
          <NotificationsPanel />
        </main>
      </div>
    </div>
  )
}