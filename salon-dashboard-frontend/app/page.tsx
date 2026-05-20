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

  { id: 'settings', label: 'Ajustes', icon: Settings },
]

function Toggle({ value, onChange }: { value: boolean; onChange: () => void }) {
  return (
    <div 
      onClick={onChange} 
      className={`w-11 h-6 rounded-full relative transition-all duration-300 cursor-pointer ${
        value 
          ? 'bg-gradient-to-r from-[#E5C17B] to-[#F2D8A7] shadow-[0_0_8px_rgba(229,193,123,0.4)]' 
          : 'bg-white/[0.04] border border-white/5'
      }`}
    >
      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-md transition-all duration-300 ${value ? 'left-6' : 'left-1'}`} />
    </div>
  )
}

function SecretInput({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  const [show, setShow] = useState(false)
  const isMasked = value.startsWith('••••')
  return (
    <div className="space-y-1">
      <label className="block text-xs font-mono font-bold text-white/50 uppercase tracking-wider">{label}</label>
      <div className="relative">
        <input
          type={show && !isMasked ? 'text' : 'password'}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder || 'No configurado'}
          className="input-premium pr-10 font-mono"
        />
        {!isMasked && (
          <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-[#E5C17B] transition-colors">
            {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
        {isMasked && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] uppercase font-bold text-[#E5C17B]/70 tracking-wider">guardado</span>}
      </div>
    </div>
  )
}

function TextInput({ label, value, onChange, placeholder, icon: Icon }: any) {
  return (
    <div className="space-y-1">
      <label className="block text-xs font-mono font-bold text-white/50 uppercase tracking-wider">{label}</label>
      <div className="relative">
        {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />}
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder || ''}
          className={`input-premium ${Icon ? 'pl-10' : ''}`}
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
      <label className="block text-xs font-mono font-bold text-white/50 uppercase tracking-wider">{label}</label>
      <div className="relative">
        <input type="text" value={value} readOnly placeholder={placeholder} className="input-premium pr-10 font-mono bg-white/[0.04]" />
        <button type="button" onClick={copy} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-[#E5C17B] transition-colors">
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
    <div className="min-h-screen flex items-center justify-center bg-[#080608]">
      <div className="w-8 h-8 border-4 border-white/10 border-t-[#E5C17B] rounded-full animate-spin" />
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
        <div className="flex items-center space-x-3 mb-6">
          <div className="section-icon">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="section-title">Perfil del Salón</h3>
            <p className="text-xs text-white/50">Información básica del negocio</p>
          </div>
        </div>
        <div className="h-px bg-gradient-to-r from-transparent via-white/5 to-transparent mb-6" />
        <div className="space-y-4">
          <TextInput label="Nombre del Salón" value={settings.salon_name} onChange={(v: string) => updateSetting('salon_name', v)} placeholder="Mi Salón" icon={Building2} />
          <TextInput label="Teléfono" value={settings.salon_phone} onChange={(v: string) => updateSetting('salon_phone', v)} placeholder="+34 600 000 000" icon={Phone} />
          <TextInput label="Email de contacto" value={settings.salon_email} onChange={(v: string) => updateSetting('salon_email', v)} placeholder="hola@misalon.com" icon={Mail} />
          <TextInput label="Dirección" value={settings.salon_address} onChange={(v: string) => updateSetting('salon_address', v)} placeholder="Calle Mayor 1, Madrid" icon={MapPin} />
        </div>
      </div>

      {/* Preferencias */}
      <div className="app-card p-4 sm:p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="section-icon">
            <Megaphone className="w-4 h-4" />
          </div>
          <div>
            <h3 className="section-title">Preferencias</h3>
            <p className="text-xs text-white/50">Configuración general del panel</p>
          </div>
        </div>
        <div className="h-px bg-gradient-to-r from-transparent via-white/5 to-transparent mb-6" />
        <div className="space-y-3">
          {([
            { key: 'darkMode', label: 'Modo Oscuro' },
            { key: 'notifications', label: 'Notificaciones en tiempo real' },
            { key: 'emailReports', label: 'Informes semanales por Email' },
          ] as { key: keyof Settings; label: string }[]).map(({ key, label }) => (
            <div key={key} className="p-4 bg-[rgba(255,255,255,0.02)] border border-white/5 rounded-xl flex items-center justify-between hover:border-[rgba(229,193,123,0.3)] transition-colors">
              <span className="font-semibold text-white text-sm">{label}</span>
              <Toggle value={!!settings[key]} onChange={() => updateSetting(key, !settings[key])} />
            </div>
          ))}
        </div>
      </div>

      {/* Inteligencia Artificial */}
      <div className="app-card p-4 sm:p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="section-icon">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h3 className="section-title">Inteligencia Artificial</h3>
            <p className="text-xs text-white/50">Credenciales del motor de conversación y triage</p>
          </div>
        </div>
        <div className="h-px bg-gradient-to-r from-transparent via-white/5 to-transparent mb-6" />
        <div className="space-y-4">
          <SecretInput label="OpenAI API Key" value={settings.openai_key} onChange={v => updateSetting('openai_key', v)} placeholder="sk-..." />
          <SecretInput label="Google Gemini API Key" value={settings.gemini_key} onChange={v => updateSetting('gemini_key', v)} placeholder="AIza..." />
        </div>
        <p className="mt-3 text-xs text-white/30 italic">Usa Google Gemini como motor principal de lenguaje, y OpenAI como respaldo de redundancia.</p>
      </div>

      {/* Bot de WhatsApp */}
      <div className="app-card p-4 sm:p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="section-icon">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <h3 className="section-title">Canal de WhatsApp</h3>
            <p className="text-xs text-white/50">Configuración de API Meta Cloud</p>
          </div>
        </div>
        <div className="h-px bg-gradient-to-r from-transparent via-white/5 to-transparent mb-6" />

        <div className="mb-6 p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl text-xs text-emerald-400 space-y-2 leading-relaxed">
          <p className="font-bold text-sm text-emerald-400">Guía de Conexión Rápida:</p>
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
        className="btn-premium w-full py-4 font-bold flex items-center justify-center space-x-2 disabled:opacity-60"
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
            <div className="flex bg-[#0a080a] p-1 rounded-2xl border border-white/5 w-full sm:w-fit shadow-md">
              <button 
                onClick={() => setAnalyticsSubTab('metrics')} 
                className={`flex-1 sm:flex-initial px-6 py-2.5 text-xs font-bold rounded-xl transition-all duration-300 ${
                  analyticsSubTab === 'metrics' 
                    ? 'bg-[rgba(229,193,123,0.1)] text-[#E5C17B] border border-[rgba(229,193,123,0.2)]' 
                    : 'text-white/40 hover:text-white/70'
                }`}
              >
                Métricas del Salón
              </button>
              <button 
                onClick={() => setAnalyticsSubTab('ia')} 
                className={`flex-1 sm:flex-initial px-6 py-2.5 text-xs font-bold rounded-xl transition-all duration-300 ${
                  analyticsSubTab === 'ia' 
                    ? 'bg-[rgba(229,193,123,0.1)] text-[#E5C17B] border border-[rgba(229,193,123,0.2)]' 
                    : 'text-white/40 hover:text-white/70'
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
      case 'notifications': return <DashboardStats />
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
    <div className="min-h-screen bg-[#080608] flex transition-colors duration-300">

      <div className="hidden lg:block lg:w-72 lg:flex-shrink-0">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} onLogout={handleLogout} />
      </div>

      <div className="flex-1 flex flex-col min-w-0 pb-28 sm:pb-24">
        <Header user={user} onLogout={handleLogout} onTabChange={setActiveTab} onSearch={setSearchQuery} />

        <main className="p-4 sm:p-6 lg:p-8 flex-1">
          <div className="max-w-[1600px] mx-auto">
            {/* Desktop-only greeting banner */}
            <div className="hidden lg:block mb-6 md:mb-8 animate-fadeIn">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight capitalize">
                {getPageTitle()}
              </h2>
              <p className="text-sm text-white/50 mt-1">
                Bienvenido de nuevo, <span className="font-bold text-[#E5C17B]">{user?.name || 'Admin'}</span>. Gestiona el salón con elegancia.
              </p>
            </div>

            {/* Mobile-only page header */}
            <div className="lg:hidden mb-6 animate-fadeIn">
              {activeTab === 'dashboard' ? (
                /* Luxury Mobile Welcome Card */
                <div className="relative overflow-hidden rounded-3xl p-5 bg-[#0a080a] border border-white/5">
                  
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[9px] font-bold tracking-widest uppercase bg-[rgba(229,193,123,0.1)] text-[#E5C17B] border border-[rgba(229,193,123,0.2)] mb-3">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 inline-block animate-pulse" />
                        Salón Luxe • IA Concierge Activa
                      </span>
                      <h1 className="text-xl font-black text-white tracking-tight">
                        Hola, {user?.name || 'Admin'}
                      </h1>
                      <p className="text-xs text-white/50 mt-1">
                        Gestiona tu salón de belleza con elegancia y control absoluto.
                      </p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E5C17B] via-[#F2D8A7] to-[#C5A059] flex items-center justify-center shadow-lg shadow-[rgba(229,193,123,0.2)] text-[#080608] text-base font-bold select-none">
                      ✨
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-5 pt-4 border-t border-white/5">
                    <div>
                      <p className="text-[10px] text-white/50 uppercase tracking-wider font-mono font-bold">Citas de Hoy</p>
                      <p className="text-sm font-extrabold text-white mt-0.5">8 Confirmadas</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-white/50 uppercase tracking-wider font-mono font-bold">Respuesta Automatizada</p>
                      <p className="text-sm font-extrabold text-[#E5C17B] mt-0.5">94% Eficacia IA</p>
                    </div>
                  </div>
                </div>
              ) : (
                /* Sleek Mobile Standard Header */
                <div className="flex items-center justify-between pb-3 border-b border-white/5">
                  <h2 className="text-xl font-extrabold text-white capitalize tracking-tight flex items-center gap-2">
                    <span className="w-1.5 h-4 bg-gradient-to-b from-[#E5C17B] to-[#F2D8A7] rounded-full inline-block" />
                    {getPageTitle()}
                  </h2>
                  <span className="text-[10px] font-bold text-[#E5C17B] uppercase tracking-widest bg-[rgba(229,193,123,0.1)] px-2 py-0.5 rounded border border-[rgba(229,193,123,0.2)]">
                    Luxe
                  </span>
                </div>
              )}
            </div>

            {renderContent()}
          </div>
        </main>
      </div>

      {/* Bottom Drawer Sheet for mobile "Más" options */}
      {isMoreOpen && (
        <div className="fixed inset-0 z-[80] lg:hidden animate-fadeIn">
          <div 
            onClick={() => setIsMoreOpen(false)} 
            className="absolute inset-0 bg-[#080608]/70 backdrop-blur-md transition-opacity duration-300"
          />
          
          <div className="absolute bottom-0 left-0 right-0 bg-[#0a080a] rounded-t-[32px] border-t border-[rgba(229,193,123,0.1)] p-6 pb-28 shadow-2xl z-90 max-h-[85vh] overflow-y-auto animate-fade-float-in">
            <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-6" />
            
            <div className="mb-6 flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold text-white">Herramientas</h3>
                <p className="text-xs text-white/40 mt-0.5">Accede al resto de herramientas de gestión</p>
              </div>
              <button 
                onClick={() => setIsMoreOpen(false)}
                className="p-2 hover:bg-white/5 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-white/40" />
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              {[
                { id: 'stylists', label: 'Estilistas', icon: Users, desc: 'Equipo y horarios' },
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
                    className={`p-4 rounded-2xl border text-left transition-all duration-200 ${
                      isActive 
                        ? 'bg-[rgba(229,193,123,0.1)] border-[rgba(229,193,123,0.3)] text-[#E5C17B]' 
                        : 'bg-white/[0.02] border-white/5 hover:border-[rgba(229,193,123,0.3)] text-white'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${isActive ? 'bg-[rgba(229,193,123,0.1)] text-[#E5C17B]' : 'bg-white/[0.04] text-white/40'}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <p className="text-sm font-bold truncate">{item.label}</p>
                    <p className="text-[10px] text-white/30 truncate mt-0.5">{item.desc}</p>
                  </button>
                )
              })}
            </div>
            
            <button 
              onClick={() => {
                setIsMoreOpen(false)
                handleLogout()
              }}
              className="w-full py-4 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-2xl font-bold text-sm transition-all duration-200 flex items-center justify-center space-x-2 border border-rose-500/10"
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
              { id: 'analytics', label: 'IA Bot', icon: Bot },
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
                  className={`relative flex flex-col items-center justify-center rounded-2xl transition-all duration-200 nav-soft-btn ${isActive ? 'nav-soft-btn-active' : ''} ${isActive ? 'text-[#E5C17B]' : 'text-white/20'}`}
                  style={{ flex: 1, height: '56px' }}
                >
                  <Icon className="w-5 h-5 mb-0.5" />
                  <span className="text-[10px] font-semibold leading-tight">{item.label}</span>
                  {isActive && <span className="absolute bottom-[5px] left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#E5C17B] shadow-[0_0_6px_rgba(229,193,123,0.6)]" />}
                </button>
              )
            })}
          </nav>
        </div>
      </div>

    </div>
  )
}
