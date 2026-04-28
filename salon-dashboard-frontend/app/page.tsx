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
import { Eye, EyeOff, Save, Building2, Phone, MapPin, Mail, Key, MessageSquare, Bot, Megaphone, Copy, CheckCircle } from 'lucide-react'

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
  twilio_sid: string
  twilio_token: string
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
  twilio_sid: '', twilio_token: '',
  whatsapp_token: '', whatsapp_phone_number_id: '', whatsapp_verify_token: '', whatsapp_business_id: '',
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
        <input type="text" value={value} readOnly placeholder={placeholder} className="w-full input-premium text-sm font-mono pr-10 bg-slate-50 dark:bg-slate-900/50 cursor-default" />
        <button type="button" onClick={copy} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-500 transition-colors">
          {copied ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
        </button>
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
  const [appUrl, setAppUrl] = useState('')

  const handleLogin = (userData: any) => setUser(userData)
  const handleLogout = () => {
    setUser(null)
    try { localStorage.removeItem('salon_pro_token'); } catch {}
  }

  useEffect(() => {
    setAppUrl(window.location.origin)
  }, [])

  useEffect(() => {
    if (user) {
      fetchSettings().then((data: any) => {
        if (data && Object.keys(data).length > 0) setSettings(prev => ({ ...prev, ...data }))
      }).catch(console.error)
    }
  }, [user])

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

      {/* Preferencias */}
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

      {/* IA */}
      <div className="glass-card p-8">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center">
            <Bot className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Inteligencia Artificial</h3>
            <p className="text-xs text-slate-500">Para el análisis de mensajes (Triage IA)</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SecretInput label="OpenAI API Key" value={settings.openai_key} onChange={v => updateSetting('openai_key', v)} placeholder="sk-..." />
          <SecretInput label="Google Gemini API Key" value={settings.gemini_key} onChange={v => updateSetting('gemini_key', v)} placeholder="AIza..." />
        </div>
        <p className="mt-3 text-xs text-slate-400">💡 Se usa Gemini primero y OpenAI como respaldo. Basta con configurar uno de los dos.</p>
      </div>

      {/* WhatsApp Bot */}
      <div className="glass-card p-8">
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Bot de WhatsApp</h3>
            <p className="text-xs text-slate-500">Meta Cloud API — los clientes reservan por WhatsApp automáticamente</p>
          </div>
        </div>

        {/* Instrucciones */}
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800/30 rounded-xl text-xs text-green-800 dark:text-green-300 space-y-1">
          <p className="font-bold mb-2">📋 Cómo configurar (solo una vez):</p>
          <p>1. Entra en <a href="https://developers.facebook.com" target="_blank" rel="noopener noreferrer" className="underline font-semibold">developers.facebook.com</a> → crea app → añade producto WhatsApp</p>
          <p>2. En <strong>WhatsApp → Configuración de la API</strong> copia el <strong>Token de acceso temporal</strong> y el <strong>Phone Number ID</strong></p>
          <p>3. En <strong>Webhooks</strong> pega la URL de abajo, el Verify Token que elijas, y activa <strong>messages</strong></p>
          <p>4. Guarda los datos aquí y pulsa <strong>Guardar</strong> ✅</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SecretInput label="Token de Acceso (Meta)" value={settings.whatsapp_token} onChange={v => updateSetting('whatsapp_token', v)} placeholder="EAAxxxxx..." />
          <TextInput label="Phone Number ID" value={settings.whatsapp_phone_number_id} onChange={(v: string) => updateSetting('whatsapp_phone_number_id', v)} placeholder="123456789012345" icon={Phone} />
          <TextInput label="Verify Token (invéntatelo tú)" value={settings.whatsapp_verify_token} onChange={(v: string) => updateSetting('whatsapp_verify_token', v)} placeholder="mi_salon_secreto_123" icon={Key} />
          <TextInput label="WhatsApp Business Account ID (opcional)" value={settings.whatsapp_business_id} onChange={(v: string) => updateSetting('whatsapp_business_id', v)} placeholder="987654321098765" />
        </div>

        <div className="mt-4">
          <CopyableInput
            label="🔗 URL del Webhook (copia esto en Meta Developers)"
            value={webhookUrl}
            placeholder="Cargando URL..."
          />
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
            <p className="text-xs text-slate-500">Servidor de correo para recordatorios y reportes</p>
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
        <button onClick={handleSaveSettings} disabled={savingSettings} className="btn-premium px-8 py-3 flex items-center space-x-2 disabled:opacity-60">
          <Save className="w-4 h-4" />
          <span>{savingSettings ? 'Guardando...' : 'Guardar Todos los Cambios'}</span>
        </button>
        {settingsSaved && <span className="text-sm font-bold text-emerald-600 animate-in fade-in duration-300">✓ Guardado correctamente</span>}
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
      case 'appointments': return <div className="animate-in fade-in slide-in-from-bottom-4 duration-500"><AppointmentCalendar searchQuery={searchQuery} fullView /></div>
      case 'clients': return <div className="animate-in fade-in slide-in-from-bottom-4 duration-500"><ClientList searchQuery={searchQuery} fullView /></div>
      case 'stylists': return <div className="animate-in fade-in slide-in-from-bottom-4 duration-500"><StylistSchedule searchQuery={searchQuery} fullView onTabChange={setActiveTab} /></div>
      case 'analytics': return <div className="animate-in fade-in slide-in-from-bottom-4 duration-500"><AnalyticsDashboard fullView /></div>
      case 'triage': return <div className="animate-in fade-in slide-in-from-bottom-4 duration-500"><TriageView /></div>
      case 'notifications': return <div className="animate-in fade-in slide-in-from-bottom-4 duration-500"><NotificationsPanel /></div>
      case 'settings': return renderSettings()
      default: return <DashboardStats />
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} onLogout={handleLogout} />
      <div className="flex-1 ml-72 flex flex-col min-h-screen">
        <Header user={user} onLogout={handleLogout} onTabChange={setActiveTab} onSearch={setSearchQuery} />
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
