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
import { Eye, EyeOff, Save, Building2, Phone, MapPin, Mail, Key, MessageSquare, Bot, Megaphone } from 'lucide-react'

interface Settings {
  // Preferencias UI
  darkMode: boolean
  notifications: boolean
  emailReports: boolean
  // Perfil del salón
  salon_name: string
  salon_phone: string
  salon_address: string
  salon_email: string
  // API Keys de servicios
  openai_key: string
  gemini_key: string
  twilio_sid: string
  twilio_token: string
  whatsapp_token: string
  smtp_host: string
  smtp_port: string
  smtp_user: string
  smtp_password: string
  smtp_from: string
}

const DEFAULT_SETTINGS: Settings = {
  darkMode: true, notifications: false, emailReports: true,
  salon_name: '', salon_phone: '', salon_address: '', salon_email: '',
  openai_key: '', gemini_key: '',
  twilio_sid: '', twilio_token: '', whatsapp_token: '',
  smtp_host: '', smtp_port: '587', smtp_user: '', smtp_password: '', smtp_from: '',
}

function Toggle({ value, onChange }: { value: boolean; onChange: () => void }) {
  return (
    <div onClick={onChange} className={`w-12 h-6 rounded-full relative transition-colors duration-300 cursor-pointer ${ value ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'}`}>
      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-300 ${value ? 'right-1' : 'left-1'}`} />
    </div>
  )
}

function SecretInput({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  const [show, setShow] = useState(false)
  const isMasked = value.startsWith('••••')
  return (
    <div className="space-y-1">
      <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{label}</label>
      <div className="relative">
        <input
          type={show && !isMasked ? 'text' : 'password'}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder || 'No configurado'}
          className="w-full input-premium pr-10 font-mono text-sm"
        />
        {!isMasked && (
          <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
            {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
        {isMasked && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">guardado</span>}
      </div>
    </div>
  )
}

function TextInput({ label, value, onChange, placeholder, icon: Icon }: any) {
  return (
    <div className="space-y-1">
      <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{label}</label>
      <div className="relative">
        {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />}
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder || ''}
          className={`w-full input-premium text-sm ${Icon ? 'pl-9' : ''}`}
        />
      </div>
    </div>
  )
}

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [searchQuery, setSearchQuery] = useState('')
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS)
  const [savingSettings, setSavingSettings] = useState(false)
  const [settingsSaved, setSettingsSaved] = useState(false)

  const handleLogin = (userData: any) => setUser(userData)
  const handleLogout = () => {
    setUser(null)
    try { localStorage.removeItem('salon_pro_token'); } catch {}
  }

  useEffect(() => {
    if (user) {
      fetchSettings().then((data: any) => {
        if (data && Object.keys(data).length > 0) {
          setSettings(prev => ({ ...prev, ...data }))
        }
      }).catch(console.error)
    }
  }, [user])

  if (!user) return <Login onLogin={handleLogin} />

  const updateSetting = (key: keyof Settings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const handleSaveSettings = async () => {
    setSavingSettings(true)
    try {
      await saveSettings(settings)
      setSettingsSaved(true)
      setTimeout(() => setSettingsSaved(false), 3000)
    } catch (err) {
      alert('Error al guardar ajustes')
    } finally {
      setSavingSettings(false)
    }
  }

  const renderSettings = () => (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
      {/* Perfil del Salón */}
      <div className="glass-card p-8">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Perfil del Salón</h3>
            <p className="text-xs text-slate-500">Información básica del negocio</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextInput label="Nombre del Salón" value={settings.salon_name} onChange={(v: string) => updateSetting('salon_name', v)} placeholder="Mi Salón" icon={Building2} />
          <TextInput label="Teléfono" value={settings.salon_phone} onChange={(v: string) => updateSetting('salon_phone', v)} placeholder="+34 600 000 000" icon={Phone} />
          <TextInput label="Email de contacto" value={settings.salon_email} onChange={(v: string) => updateSetting('salon_email', v)} placeholder="hola@misalon.com" icon={Mail} />
          <TextInput label="Dirección" value={settings.salon_address} onChange={(v: string) => updateSetting('salon_address', v)} placeholder="Calle Mayor 1, Madrid" icon={MapPin} />
        </div>
      </div>

      {/* Preferencias UI */}
      <div className="glass-card p-8">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
            <Megaphone className="w-5 h-5 text-slate-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Preferencias</h3>
            <p className="text-xs text-slate-500">Configuración general del panel</p>
          </div>
        </div>
        <div className="space-y-4">
          {([
            { key: 'darkMode', label: 'Modo Oscuro Automático' },
            { key: 'notifications', label: 'Notificaciones de Escritorio' },
            { key: 'emailReports', label: 'Informes Semanales por Email' },
          ] as { key: keyof Settings; label: string }[]).map(({ key, label }) => (
            <div key={key} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700 flex items-center justify-between">
              <span className="font-medium text-slate-700 dark:text-slate-300">{label}</span>
              <Toggle value={!!settings[key]} onChange={() => updateSetting(key, !settings[key])} />
            </div>
          ))}
        </div>
      </div>

      {/* API Keys IA */}
      <div className="glass-card p-8">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center">
            <Bot className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Inteligencia Artificial</h3>
            <p className="text-xs text-slate-500">API keys para IA generativa (triage, sugerencias)</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SecretInput label="OpenAI API Key" value={settings.openai_key} onChange={v => updateSetting('openai_key', v)} placeholder="sk-..." />
          <SecretInput label="Google Gemini API Key" value={settings.gemini_key} onChange={v => updateSetting('gemini_key', v)} placeholder="AIza..." />
        </div>
      </div>

      {/* WhatsApp / Twilio */}
      <div className="glass-card p-8">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">WhatsApp / Twilio</h3>
            <p className="text-xs text-slate-500">Notificaciones y recordatorios por WhatsApp</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SecretInput label="Twilio Account SID" value={settings.twilio_sid} onChange={v => updateSetting('twilio_sid', v)} placeholder="ACxxxxxxxxxxxxxxxx" />
          <SecretInput label="Twilio Auth Token" value={settings.twilio_token} onChange={v => updateSetting('twilio_token', v)} placeholder="Token de autenticación" />
          <SecretInput label="WhatsApp Token (Meta)" value={settings.whatsapp_token} onChange={v => updateSetting('whatsapp_token', v)} placeholder="Token de acceso" />
        </div>
      </div>

      {/* Email SMTP */}
      <div className="glass-card p-8">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
            <Mail className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Email SMTP</h3>
            <p className="text-xs text-slate-500">Servidor de correo para envío de emails</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextInput label="Servidor SMTP" value={settings.smtp_host} onChange={(v: string) => updateSetting('smtp_host', v)} placeholder="smtp.gmail.com" />
          <TextInput label="Puerto" value={settings.smtp_port} onChange={(v: string) => updateSetting('smtp_port', v)} placeholder="587" />
          <TextInput label="Usuario SMTP" value={settings.smtp_user} onChange={(v: string) => updateSetting('smtp_user', v)} placeholder="tu@email.com" />
          <SecretInput label="Contraseña SMTP" value={settings.smtp_password} onChange={v => updateSetting('smtp_password', v)} placeholder="Contraseña de aplicación" />
          <TextInput label="Email remitente (From)" value={settings.smtp_from} onChange={(v: string) => updateSetting('smtp_from', v)} placeholder="noreply@misalon.com" />
        </div>
      </div>

      {/* Guardar */}
      <div className="flex items-center space-x-4">
        <button
          onClick={handleSaveSettings}
          disabled={savingSettings}
          className="btn-premium px-8 py-3 flex items-center space-x-2 disabled:opacity-60"
        >
          <Save className="w-4 h-4" />
          <span>{savingSettings ? 'Guardando...' : 'Guardar Todos los Cambios'}</span>
        </button>
        {settingsSaved && (
          <span className="text-sm font-bold text-emerald-600 animate-in fade-in duration-300">✓ Guardado correctamente</span>
        )}
      </div>
    </div>
  )

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
        return renderSettings()
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
                {activeTab === 'dashboard' ? 'Panel de Control' :
                 activeTab === 'settings' ? 'Ajustes' :
                 activeTab === 'analytics' ? 'Análisis' :
                 activeTab === 'appointments' ? 'Citas' :
                 activeTab === 'clients' ? 'Clientes' :
                 activeTab === 'stylists' ? 'Estilistas' :
                 activeTab === 'triage' ? 'Auditoría IA' :
                 activeTab === 'notifications' ? 'Notificaciones' : activeTab}
              </h2>
              <p className="text-slate-500 dark:text-slate-400 mt-1">Bienvenido de nuevo, {user?.name || 'Admin'}.</p>
            </div>
            {renderContent()}
          </div>
        </main>
      </div>
      <NotificationsPanel />
    </div>
  )
}
