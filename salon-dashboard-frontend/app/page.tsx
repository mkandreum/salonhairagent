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
import { fetchSettings, saveSettings, fetchMe } from '@/lib/api'
import { Eye, EyeOff, Save, Building2, Phone, MapPin, Mail, Key, MessageSquare, Bot, Megaphone, Copy, CheckCircle, Home as HomeIcon, Calendar, Users, BarChart3, Bell, Settings } from 'lucide-react'

interface Settings {
  darkMode: boolean
  notifications: boolean
  emailReports: boolean
  salon_name: string
  salon_phone: string
  salon_address: string
  salon_email: string
  openai_key: string
  gemini_key: string
  whatsapp_token: string
  whatsapp_phone_number_id: string
  whatsapp_verify_token: string
  whatsapp_business_id: string
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
  whatsapp_token: '', whatsapp_phone_number_id: '', whatsapp_verify_token: '', whatsapp_business_id: '',
  smtp_host: '', smtp_port: '587', smtp_user: '', smtp_password: '', smtp_from: '',
}

const menuItems = [
  { id: 'dashboard', label: 'Home', icon: HomeIcon },
  { id: 'appointments', label: 'Citas', icon: Calendar },
  { id: 'clients', label: 'Clientes', icon: Users },
  { id: 'stylists', label: 'Estilistas', icon: Users },
  { id: 'analytics', label: 'Stats', icon: BarChart3 },
  { id: 'triage', label: 'IA', icon: Bot },
  { id: 'notifications', label: 'Alertas', icon: Bell },
  { id: 'settings', label: 'Ajustes', icon: Settings },
]

function Toggle({ value, onChange }: { value: boolean; onChange: () => void }) {
  return (
    <div onClick={onChange} className={`w-12 h-6 rounded-full relative transition-colors duration-300 cursor-pointer ${value ? 'bg-slate-800' : 'bg-slate-300 dark:bg-slate-700'}`}>
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
          className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm pr-10 font-mono"
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
          className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm ${Icon ? 'pl-10' : ''}`}
        />
      </div>
    </div>
  )
}

function CopyableInput({ label, value, placeholder }: { label: string; value: string; placeholder?: string }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    if (!value) return
    navigator.clipboard.writeText(value).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000) })
  }
  return (
    <div className="space-y-1">
      <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{label}</label>
      <div className="relative">
        <input type="text" value={value} readOnly placeholder={placeholder} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono pr-10" />
        <button type="button" onClick={copy} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
          {copied ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>
    </div>
  )
}

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [searchQuery, setSearchQuery] = useState('')
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS)
  const [savingSettings, setSavingSettings] = useState(false)
  const [settingsSaved, setSettingsSaved] = useState(false)
  const [appUrl, setAppUrl] = useState('')

  useEffect(() => {
    setAppUrl(window.location.origin)
  }, [])

  useEffect(() => {
    const token = (() => { try { return localStorage.getItem('salon_pro_token') } catch { return null } })()
    if (!token) {
      setCheckingAuth(false)
      return
    }
    fetchMe().then((u: any) => {
      setUser(u)
      setActiveTab('dashboard')
    }).catch(() => {
      try { localStorage.removeItem('salon_pro_token') } catch {}
    }).finally(() => setCheckingAuth(false))
  }, [])

  useEffect(() => {
    if (user) {
      fetchSettings().then((data: any) => {
        if (data && Object.keys(data).length > 0) setSettings(prev => ({ ...prev, ...data }))
      }).catch(console.error)
    }
  }, [user])

  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [settings.darkMode])

  const handleLogin = (userData: any) => setUser(userData)
  const handleLogout = () => {
    setUser(null)
    try { localStorage.removeItem('salon_pro_token') } catch {}
  }

  if (checkingAuth) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-black">
      <div className="w-8 h-8 border-4 border-slate-200 dark:border-zinc-800 border-t-amber-500 rounded-full animate-spin" />
    </div>
  )

  if (!user) return <Login onLogin={handleLogin} />

  const updateSetting = (key: keyof Settings, value: any) => setSettings(prev => ({ ...prev, [key]: value }))

  const handleSaveSettings = async () => {
    setSavingSettings(true)
    try {
      await saveSettings(settings)
      setSettingsSaved(true)
      setTimeout(() => setSettingsSaved(false), 3000)
    } catch { alert('Error al guardar ajustes') }
    finally { setSavingSettings(false) }
  }

  const webhookUrl = `${appUrl}/api/webhook/whatsapp`

  const renderSettings = () => (
    <div className="space-y-4 pb-28 sm:pb-24">
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200 dark:border-slate-800">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-slate-600" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white">Perfil del Salón</h3>
            <p className="text-xs text-slate-500">Información básica del negocio</p>
          </div>
        </div>
        <div className="space-y-4">
          <TextInput label="Nombre del Salón" value={settings.salon_name} onChange={(v: string) => updateSetting('salon_name', v)} placeholder="Mi Salón" icon={Building2} />
          <TextInput label="Teléfono" value={settings.salon_phone} onChange={(v: string) => updateSetting('salon_phone', v)} placeholder="+34 600 000 000" icon={Phone} />
          <TextInput label="Email de contacto" value={settings.salon_email} onChange={(v: string) => updateSetting('salon_email', v)} placeholder="hola@misalon.com" icon={Mail} />
          <TextInput label="Dirección" value={settings.salon_address} onChange={(v: string) => updateSetting('salon_address', v)} placeholder="Calle Mayor 1, Madrid" icon={MapPin} />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200 dark:border-slate-800">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <Megaphone className="w-5 h-5 text-slate-600" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white">Preferencias</h3>
            <p className="text-xs text-slate-500">Configuración general del panel</p>
          </div>
        </div>
        <div className="space-y-3">
          {([
            { key: 'darkMode', label: 'Modo Oscuro' },
            { key: 'notifications', label: 'Notificaciones' },
            { key: 'emailReports', label: 'Informes por Email' },
          ] as { key: keyof Settings; label: string }[]).map(({ key, label }) => (
            <div key={key} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700 flex items-center justify-between">
              <span className="font-medium text-slate-700 dark:text-slate-300 text-sm">{label}</span>
              <Toggle value={!!settings[key]} onChange={() => updateSetting(key, !settings[key])} />
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200 dark:border-slate-800">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-slate-800 text-amber-400 flex items-center justify-center">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white">Inteligencia Artificial</h3>
            <p className="text-xs text-slate-500">API Keys para Triage IA</p>
          </div>
        </div>
        <div className="space-y-4">
          <SecretInput label="OpenAI API Key" value={settings.openai_key} onChange={v => updateSetting('openai_key', v)} placeholder="sk-..." />
          <SecretInput label="Google Gemini API Key" value={settings.gemini_key} onChange={v => updateSetting('gemini_key', v)} placeholder="AIza..." />
        </div>
        <p className="mt-3 text-xs text-slate-400">Usa Gemini primero, OpenAI como respaldo.</p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200 dark:border-slate-800">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white">Bot de WhatsApp</h3>
            <p className="text-xs text-slate-500">Meta Cloud API</p>
          </div>
        </div>

        <div className="mb-4 p-4 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800/30 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 space-y-2">
          <p className="font-bold">Cómo configurar:</p>
          <p>1. Ve a <a href="https://developers.facebook.com" target="_blank" rel="noopener" className="underline font-semibold">developers.facebook.com</a> → crea app → añade WhatsApp</p>
          <p>2. Copia el <strong>Token de acceso</strong> y <strong>Phone Number ID</strong></p>
          <p>3. En Webhooks pega la URL de abajo con tu Verify Token</p>
        </div>

        <div className="space-y-4">
          <SecretInput label="Token de Acceso (Meta)" value={settings.whatsapp_token} onChange={v => updateSetting('whatsapp_token', v)} placeholder="EAAxxxxx..." />
          <TextInput label="Phone Number ID" value={settings.whatsapp_phone_number_id} onChange={(v: string) => updateSetting('whatsapp_phone_number_id', v)} placeholder="123456789012345" icon={Phone} />
          <TextInput label="Verify Token" value={settings.whatsapp_verify_token} onChange={(v: string) => updateSetting('whatsapp_verify_token', v)} placeholder="mi_salon_secreto_123" icon={Key} />
          <CopyableInput label="URL del Webhook" value={webhookUrl} placeholder="Cargando..." />
        </div>
      </div>

      <button onClick={handleSaveSettings} disabled={savingSettings} className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-semibold flex items-center justify-center space-x-2 disabled:opacity-60">
        <Save className="w-5 h-5" />
        <span>{savingSettings ? 'Guardando...' : 'Guardar Cambios'}</span>
      </button>
      {settingsSaved && <p className="text-center text-sm font-bold text-emerald-600">Guardado correctamente</p>}
    </div>
  )

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <DashboardStats />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <AppointmentCalendar searchQuery={searchQuery} onViewAll={() => setActiveTab('appointments')} />
              <AnalyticsDashboard onViewAll={() => setActiveTab('analytics')} />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <ClientList searchQuery={searchQuery} onViewAll={() => setActiveTab('clients')} />
              <StylistSchedule searchQuery={searchQuery} onViewAll={() => setActiveTab('stylists')} onTabChange={setActiveTab} />
            </div>
          </div>
        )
      case 'appointments': return <AppointmentCalendar searchQuery={searchQuery} fullView />
      case 'clients': return <ClientList searchQuery={searchQuery} fullView />
      case 'stylists': return <StylistSchedule searchQuery={searchQuery} fullView onTabChange={setActiveTab} />
      case 'analytics': return <AnalyticsDashboard fullView />
      case 'triage': return <TriageView />
      case 'notifications': return <NotificationsPanel fullPage />
      case 'settings': return renderSettings()
      default: return <DashboardStats />
    }
  }

  const getPageTitle = () => {
    const titles: Record<string, string> = {
      dashboard: 'Panel de Control',
      settings: 'Ajustes',
      analytics: 'Análisis',
      appointments: 'Citas',
      clients: 'Clientes',
      stylists: 'Estilistas',
      triage: 'Auditoría IA',
      notifications: 'Notificaciones'
    }
    return titles[activeTab] || activeTab
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black flex relative overflow-hidden">
      <div className="hidden lg:block lg:w-72 lg:flex-shrink-0 z-10">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} onLogout={handleLogout} />
      </div>

      <div className="flex-1 flex flex-col min-w-0 pb-28 sm:pb-24 z-10">
        <div className="hidden lg:block">
          <Header user={user} onLogout={handleLogout} onTabChange={setActiveTab} onSearch={setSearchQuery} />
        </div>

        <main className="p-4 sm:p-6 lg:p-8 flex-1">
          <div className="max-w-[1600px] mx-auto">
            <div className="hidden lg:block mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-800 dark:text-white capitalize">
                {getPageTitle()}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Bienvenido de nuevo, {user?.name || 'Admin'}.
              </p>
            </div>

            <div className="lg:hidden mb-4">
              <h2 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white capitalize">
                {getPageTitle()}
              </h2>
            </div>

            {renderContent()}
          </div>
        </main>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
        <div className="flex justify-center px-3 pb-3 sm:pb-4">
          <nav className="ios-pill-nav flex items-center px-1 py-1.5 rounded-full" style={{ width: 'min(100vw - 24px, 560px)' }}>
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = activeTab === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`relative flex flex-col items-center justify-center rounded-2xl transition-all duration-200 nav-soft-btn ${isActive ? 'nav-soft-btn-active' : ''}`}
                  style={{ flex: 1, height: '56px' }}
                >
                  <Icon className="w-5 h-5 mb-0.5" />
                  <span className="text-[10px] font-semibold leading-tight">{item.label}</span>
                  {isActive && <span className="nav-dot-indicator" style={{ position: 'absolute', bottom: '5px', left: '50%', transform: 'translateX(-50%)', margin: 0 }} />}
                </button>
              )
            })}
          </nav>
        </div>
      </div>

    </div>
  )
}