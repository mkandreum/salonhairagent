'use client'

import { useState, useEffect } from 'react'
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
import { fetchSettings, saveSettings } from '@/lib/api'

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [searchQuery, setSearchQuery] = useState('')
  const [settings, setSettings] = useState({ darkMode: true, notifications: false, emailReports: true })

  const handleLogin = (userData: any) => {
    setUser(userData)
  }

  const handleLogout = () => {
    setUser(null)
  }

  useEffect(() => {
    if (user) {
      fetchSettings().then((data: any) => {
        if (data && Object.keys(data).length > 0) {
          setSettings(prev => ({ ...prev, ...data }))
        }
      })
    }
  }, [user])

  if (!user) {
    return <Login onLogin={handleLogin} />
  }

  const toggleSetting = (key: 'darkMode' | 'notifications' | 'emailReports') => {
    const newVal = !settings[key]
    const newSettings = { ...settings, [key]: newVal }
    setSettings(newSettings)
    console.log(`Setting ${key} changed to ${newVal}`)
  }

  const handleSaveSettings = async () => {
    try {
      await saveSettings(settings)
      alert('Ajustes guardados correctamente')
    } catch (err) {
      alert('Error al guardar ajustes')
    }
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <DashboardStats />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <AppointmentCalendar searchQuery={searchQuery} onViewAll={() => setActiveTab('appointments')} />
              <AnalyticsDashboard onViewAll={() => setActiveTab('analytics')} />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <ClientList searchQuery={searchQuery} onViewAll={() => setActiveTab('clients')} />
              <StylistSchedule searchQuery={searchQuery} onViewAll={() => setActiveTab('stylists')} onTabChange={setActiveTab} />
            </div>
          </div>
        )
      case 'appointments':
        return <div className="animate-in fade-in slide-in-from-bottom-4 duration-500"><AppointmentCalendar searchQuery={searchQuery} fullView /></div>
      case 'clients':
        return <div className="animate-in fade-in slide-in-from-bottom-4 duration-500"><ClientList searchQuery={searchQuery} fullView /></div>
      case 'stylists':
        return <div className="animate-in fade-in slide-in-from-bottom-4 duration-500"><StylistSchedule searchQuery={searchQuery} fullView onTabChange={setActiveTab} /></div>
      case 'analytics':
        return <div className="animate-in fade-in slide-in-from-bottom-4 duration-500"><AnalyticsDashboard fullView /></div>
      case 'triage':
        return <div className="animate-in fade-in slide-in-from-bottom-4 duration-500"><TriageView /></div>
      case 'notifications':
        return <div className="animate-in fade-in slide-in-from-bottom-4 duration-500"><NotificationsPanel /></div>
      case 'settings':
        return (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 glass-card p-8">
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">Ajustes del Sistema</h3>
            <p className="text-slate-500 dark:text-slate-400">Configuración general de la peluquería, horarios y preferencias.</p>
            <div className="mt-8 space-y-4">
              <div 
                onClick={() => toggleSetting('darkMode')}
                className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700 flex items-center justify-between cursor-pointer group"
              >
                <span className="font-medium">Modo Oscuro Automático</span>
                <div className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${settings.darkMode ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'}`}>
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-300 ${settings.darkMode ? 'right-1' : 'left-1'}`}></div>
                </div>
              </div>
              <div 
                onClick={() => toggleSetting('notifications')}
                className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700 flex items-center justify-between cursor-pointer group"
              >
                <span className="font-medium">Notificaciones de Escritorio</span>
                <div className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${settings.notifications ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'}`}>
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-300 ${settings.notifications ? 'right-1' : 'left-1'}`}></div>
                </div>
              </div>
              <div 
                onClick={() => toggleSetting('emailReports')}
                className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700 flex items-center justify-between cursor-pointer group"
              >
                <span className="font-medium">Informes Semanales por Email</span>
                <div className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${settings.emailReports ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'}`}>
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-300 ${settings.emailReports ? 'right-1' : 'left-1'}`}></div>
                </div>
              </div>
            </div>
            <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800">
               <button onClick={handleSaveSettings} className="btn-premium px-8 py-3">Guardar Todos los Cambios</button>
            </div>
          </div>
        )
      default:
        return <DashboardStats />
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} onLogout={handleLogout} />
      <div className="flex-1 ml-72 flex flex-col min-h-screen">
        <Header 
          user={user} 
          onLogout={handleLogout} 
          onTabChange={setActiveTab}
          onSearch={setSearchQuery}
        />

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
        </main>
      </div>
    </div>
  )
}