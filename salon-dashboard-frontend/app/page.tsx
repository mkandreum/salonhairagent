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
import { Eye, EyeOff, Save, Building2, Phone, MapPin, Mail, Key, MessageSquare, Bot, Megaphone, Copy, CheckCircle, Home as HomeIcon, Calendar, Users, BarChart3, Bell, Settings, MoreHorizontal, X } from 'lucide-react'

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
    <div 
      onClick={onChange} 
      className={`w-11 h-6 rounded-full relative transition-all duration-300 cursor-pointer ${
        value 
          ? 'bg-gradient-to-r from-amber-500 to-amber-600 shadow-[0_0_8px_rgba(212,175,55,0.4)]' 
          : 'bg-slate-200 dark:bg-slate-800/80 border border-slate-350 dark:border-slate-700/60'
      }`}
    >
      <div className={`absolute top-1 w-4 h-4 bg-white dark:bg-slate-900 rounded-full shadow-md transition-all duration-300 ${value ? 'left-6' : 'left-1'}`} />
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
          className="w-full px-4 py-3 bg-slate-50 dark:bg-[#0c101b] border border-slate-200 dark:border-slate-800 rounded-xl text-sm pr-10 font-mono text-slate-800 dark:text-white transition-all focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
        />
        {!isMasked && (
          <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-amber-500 transition-colors">
            {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
        {isMasked && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] uppercase font-bold text-amber-500/70 tracking-wider">guardado</span>}
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
          className={`w-full px-4 py-3 bg-slate-50 dark:bg-[#0c101b] border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-800 dark:text-white transition-all focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 ${Icon ? 'pl-10' : ''}`}
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
        <input type="text" value={value} readOnly placeholder={placeholder} className="w-full px-4 py-3 bg-slate-50 dark:bg-[#0c101b]/50 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-mono pr-10 text-slate-800 dark:text-white/80" />
        <button type="button" onClick={copy} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-amber-500 transition-colors">
          {copied ? <CheckCircle className="w-4 h-4 text-emerald-500 animate-fadeIn" /> : <Copy className="w-4 h-4" />}
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
  const [isMoreOpen, setIsMoreOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [analyticsSubTab, setAnalyticsSubTab] = useState<'metrics' | 'ia'>('metrics')
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

  const handleLogin = (userData: any) => setUser(userData)
  const handleLogout = () => {
    setUser(null)
    try { localStorage.removeItem('salon_pro_token') } catch {}
  }

  if (checkingAuth) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-950">
      <div className="w-8 h-8 border-4 border-slate-300 dark:border-slate-700 border-t-slate-800 rounded-full animate-spin" />
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
    <div className="space-y-6 pb-28 sm:pb-24 animate-fadeIn">
      {/* Perfil del Salón */}
      <div className="app-card p-4 sm:p-6">
        <div className="flex items-center space-x-3 mb-6 border-b border-slate-200/5 dark:border-slate-800/40 pb-4">
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-[#0c101b] border border-slate-200/5 dark:border-slate-800/40 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white">Perfil del Salón</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Información básica del negocio</p>
          </div>
        </div>
        <div className="space-y-4">
          <TextInput label="Nombre del Salón" value={settings.salon_name} onChange={(v: string) => updateSetting('salon_name', v)} placeholder="Mi Salón" icon={Building2} />
          <TextInput label="Teléfono" value={settings.salon_phone} onChange={(v: string) => updateSetting('salon_phone', v)} placeholder="+34 600 000 000" icon={Phone} />
          <TextInput label="Email de contacto" value={settings.salon_email} onChange={(v: string) => updateSetting('salon_email', v)} placeholder="hola@misalon.com" icon={Mail} />
          <TextInput label="Dirección" value={settings.salon_address} onChange={(v: string) => updateSetting('salon_address', v)} placeholder="Calle Mayor 1, Madrid" icon={MapPin} />
        </div>
      </div>

      {/* Preferencias */}
      <div className="app-card p-4 sm:p-6">
        <div className="flex items-center space-x-3 mb-6 border-b border-slate-200/5 dark:border-slate-800/40 pb-4">
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-[#0c101b] border border-slate-200/5 dark:border-slate-800/40 flex items-center justify-center">
            <Megaphone className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white">Preferencias</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Configuración general del panel</p>
          </div>
        </div>
        <div className="space-y-3">
          {([
            { key: 'darkMode', label: 'Modo Oscuro' },
            { key: 'notifications', label: 'Notificaciones en tiempo real' },
            { key: 'emailReports', label: 'Informes semanales por Email' },
          ] as { key: keyof Settings; label: string }[]).map(({ key, label }) => (
            <div key={key} className="p-4 bg-slate-50/50 dark:bg-[#0c101b]/40 rounded-xl border border-slate-250/20 dark:border-slate-800/40 flex items-center justify-between hover:border-amber-500/10 transition-colors">
              <span className="font-semibold text-slate-700 dark:text-slate-300 text-sm">{label}</span>
              <Toggle value={!!settings[key]} onChange={() => updateSetting(key, !settings[key])} />
            </div>
          ))}
        </div>
      </div>

      {/* Inteligencia Artificial */}
      <div className="app-card p-4 sm:p-6">
        <div className="flex items-center space-x-3 mb-6 border-b border-slate-200/5 dark:border-slate-800/40 pb-4">
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-[#0c101b] border border-slate-200/5 dark:border-slate-800/40 flex items-center justify-center text-amber-500">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white">Inteligencia Artificial</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Credenciales del motor de conversación y triage</p>
          </div>
        </div>
        <div className="space-y-4">
          <SecretInput label="OpenAI API Key" value={settings.openai_key} onChange={v => updateSetting('openai_key', v)} placeholder="sk-..." />
          <SecretInput label="Google Gemini API Key" value={settings.gemini_key} onChange={v => updateSetting('gemini_key', v)} placeholder="AIza..." />
        </div>
        <p className="mt-3 text-xs text-slate-400 dark:text-slate-500 italic">Usa Google Gemini como motor principal de lenguaje, y OpenAI como respaldo de redundancia.</p>
      </div>

      {/* Bot de WhatsApp */}
      <div className="app-card p-4 sm:p-6">
        <div className="flex items-center space-x-3 mb-6 border-b border-slate-200/5 dark:border-slate-800/40 pb-4">
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-[#0c101b] border border-slate-200/5 dark:border-slate-800/40 flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white">Canal de WhatsApp</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Configuración de API Meta Cloud</p>
          </div>
        </div>

        <div className="mb-6 p-4 bg-emerald-500/5 border border-emerald-500/10 dark:border-emerald-500/20 rounded-xl text-xs text-emerald-600 dark:text-emerald-400 space-y-2 leading-relaxed">
          <p className="font-bold text-sm text-emerald-700 dark:text-emerald-350">Guía de Conexión Rápida:</p>
          <p>1. Inicia sesión en <a href="https://developers.facebook.com" target="_blank" rel="noopener" className="underline font-semibold hover:text-emerald-500">Meta Developers Portal</a> → crea una app y añade WhatsApp.</p>
          <p>2. Copia tu <strong>Token de acceso temporal/permanente</strong> y tu <strong>ID de teléfono</strong> de WhatsApp.</p>
          <p>3. En el apartado Webhooks, pega la URL generada debajo y define el Verify Token de tu preferencia.</p>
        </div>

        <div className="space-y-4">
          <SecretInput label="Token de Acceso (Meta)" value={settings.whatsapp_token} onChange={v => updateSetting('whatsapp_token', v)} placeholder="EAAxxxxx..." />
          <TextInput label="Phone Number ID" value={settings.whatsapp_phone_number_id} onChange={(v: string) => updateSetting('whatsapp_phone_number_id', v)} placeholder="123456789012345" icon={Phone} />
          <TextInput label="Verify Token" value={settings.whatsapp_verify_token} onChange={(v: string) => updateSetting('whatsapp_verify_token', v)} placeholder="mi_salon_secreto_123" icon={Key} />
          <CopyableInput label="URL del Webhook de WhatsApp" value={webhookUrl} placeholder="Cargando..." />
        </div>
      </div>

      <button 
        onClick={handleSaveSettings} 
        disabled={savingSettings} 
        className="btn-accent w-full py-4 font-bold flex items-center justify-center space-x-2 disabled:opacity-60 shadow-lg shadow-amber-500/10"
      >
        <Save className="w-5 h-5" />
        <span>{savingSettings ? 'Guardando Ajustes...' : 'Guardar Todos los Cambios'}</span>
      </button>
      {settingsSaved && <p className="text-center text-sm font-bold text-emerald-500 animate-fadeIn">¡Ajustes guardados con éxito!</p>}
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
      case 'analytics':
        return (
          <div className="space-y-6 animate-fadeIn">
            {/* Elegant luxury segment control */}
            <div className="flex bg-[#0c101b] p-1 rounded-2xl border border-slate-800/60 w-full sm:w-fit shadow-md">
              <button 
                onClick={() => setAnalyticsSubTab('metrics')} 
                className={`flex-1 sm:flex-initial px-6 py-2.5 text-xs font-bold rounded-xl transition-all duration-300 ${
                  analyticsSubTab === 'metrics' 
                    ? 'bg-slate-800 text-amber-400 border border-amber-500/10 shadow-[0_0_12px_rgba(212,175,55,0.15)]' 
                    : 'text-slate-400 hover:text-slate-205'
                }`}
              >
                Métricas del Salón
              </button>
              <button 
                onClick={() => setAnalyticsSubTab('ia')} 
                className={`flex-1 sm:flex-initial px-6 py-2.5 text-xs font-bold rounded-xl transition-all duration-300 ${
                  analyticsSubTab === 'ia' 
                    ? 'bg-slate-800 text-amber-400 border border-amber-500/10 shadow-[0_0_12px_rgba(212,175,55,0.15)]' 
                    : 'text-slate-400 hover:text-slate-205'
                }`}
              >
                Auditoría IA Concierge
              </button>
            </div>
            <div className="animate-fadeIn">
              {analyticsSubTab === 'metrics' ? <AnalyticsDashboard fullView /> : <TriageView />}
            </div>
          </div>
        )
      case 'settings': return renderSettings()
      default: return <DashboardStats />
    }
  }

  const getPageTitle = () => {
    const titles: Record<string, string> = {
      dashboard: 'Panel de Control',
      settings: 'Ajustes',
      analytics: 'Análisis & IA',
      appointments: 'Citas',
      clients: 'Clientes',
      stylists: 'Estilistas',
      notifications: 'Notificaciones'
    }
    return titles[activeTab] || activeTab
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#080b11] flex transition-colors duration-300">
      <div className="hidden lg:block lg:w-72 lg:flex-shrink-0">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} onLogout={handleLogout} />
      </div>

      <div className="flex-1 flex flex-col min-w-0 pb-28 sm:pb-24">
        {/* Unified, fully responsive premium header */}
        <Header user={user} onLogout={handleLogout} onTabChange={setActiveTab} onSearch={setSearchQuery} onNotifToggle={() => setNotifOpen(v => !v)} />

        <main className="p-4 sm:p-6 lg:p-8 flex-1">
          <div className="max-w-[1600px] mx-auto">
            {/* Desktop-only greeting banner */}
            <div className="hidden lg:block mb-6 md:mb-8 animate-fadeIn">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight capitalize">
                {getPageTitle()}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Bienvenido de nuevo, <span className="font-bold text-amber-600 dark:text-amber-400">{user?.name || 'Admin'}</span>. Gestiona el salón con elegancia.
              </p>
            </div>

            {/* Mobile-only page header */}
            <div className="lg:hidden mb-4 animate-fadeIn">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white capitalize">
                {getPageTitle()}
              </h2>
            </div>

            {renderContent()}
          </div>
        </main>
      </div>

      {/* Bottom Drawer Sheet for mobile "Más" options */}
      {isMoreOpen && (
        <div className="fixed inset-0 z-[80] lg:hidden animate-fadeIn">
          {/* Backdrop */}
          <div 
            onClick={() => setIsMoreOpen(false)} 
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-md transition-opacity duration-300"
          />
          
          {/* Drawer Panel */}
          <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-slate-900 rounded-t-[32px] border-t border-slate-200/50 dark:border-slate-800/50 p-6 pb-28 shadow-2xl z-90 max-h-[85vh] overflow-y-auto animate-fade-float-in">
            {/* Elegant drag handle decorator */}
            <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-6" />
            
            <div className="mb-6 flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Menú Adicional</h3>
                <p className="text-xs text-slate-400 mt-0.5">Accede al resto de herramientas de gestión</p>
              </div>
              <button 
                onClick={() => setIsMoreOpen(false)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            
            {/* Options grid */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              {[
                { id: 'stylists', label: 'Estilistas', icon: Users, desc: 'Equipo y horarios' },
                { id: 'analytics', label: 'Análisis & IA', icon: BarChart3, desc: 'Métricas e informes IA' },
                { id: 'notifications', label: 'Notificaciones', icon: Bell, desc: 'Alertas del sistema' },
                { id: 'settings', label: 'Ajustes', icon: Settings, desc: 'Configuración general' }
              ].map((item) => {
                const Icon = item.icon
                const isActive = activeTab === item.id
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id)
                      setIsMoreOpen(false)
                    }}
                    className={`p-4 rounded-2xl border text-left transition-all ${
                      isActive 
                        ? 'bg-slate-100 dark:bg-slate-800 border-amber-500/30 text-amber-500 shadow-sm' 
                        : 'bg-slate-50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-350'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${isActive ? 'bg-slate-800 dark:bg-slate-700 text-amber-400' : 'bg-slate-200/50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400'}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <p className="text-sm font-bold truncate">{item.label}</p>
                    <p className="text-[10px] text-slate-450 dark:text-slate-400 truncate mt-0.5">{item.desc}</p>
                  </button>
                )
              })}
            </div>
            
            {/* Logout button */}
            <button 
              onClick={() => {
                setIsMoreOpen(false)
                handleLogout()
              }}
              className="w-full py-4 bg-rose-500/10 hover:bg-rose-500/20 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 text-rose-500 rounded-2xl font-bold text-sm transition-all flex items-center justify-center space-x-2"
            >
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      )}

      {/* Responsive Bottom Pill Nav */}
      <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
        <div className="flex justify-center px-3 pb-3 sm:pb-4">
          <nav className="ios-pill-nav flex items-center px-1 py-1.5 rounded-full" style={{ width: 'min(100vw - 24px, 480px)' }}>
            {[
              { id: 'dashboard', label: 'Inicio', icon: HomeIcon },
              { id: 'appointments', label: 'Citas', icon: Calendar },
              { id: 'clients', label: 'Clientes', icon: Users },
              { id: 'more', label: 'Más', icon: MoreHorizontal }
            ].map((item) => {
              const Icon = item.icon
              const isActive = item.id === 'more' ? isMoreOpen : activeTab === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.id === 'more') {
                      setIsMoreOpen(!isMoreOpen)
                    } else {
                      setActiveTab(item.id)
                      setIsMoreOpen(false)
                    }
                  }}
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

      <NotificationsPanel isOpen={notifOpen} onClose={() => setNotifOpen(false)} />
    </div>
  )
}