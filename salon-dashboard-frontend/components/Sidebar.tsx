'use client'

import { 
  Home, 
  Calendar, 
  Users, 
  Scissors, 
  BarChart3, 
  Bell, 
  Settings,
  LogOut,
  ChevronRight,
  Sparkles
} from 'lucide-react'


interface SidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
  onLogout: () => void
}


const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'appointments', label: 'Citas', icon: Calendar },
  { id: 'clients', label: 'Clientes', icon: Users },
  { id: 'stylists', label: 'Estilistas', icon: Scissors },
  { id: 'analytics', label: 'Análisis & IA', icon: BarChart3 },
  { id: 'notifications', label: 'Notificaciones', icon: Bell },
  { id: 'settings', label: 'Ajustes', icon: Settings },
]


export default function Sidebar({ activeTab, onTabChange, onLogout }: SidebarProps) {
  return (
    <aside className="fixed left-0 top-0 h-screen w-72 bg-[#080b11] border-r border-slate-800/60 dark:border-amber-500/10 z-50 transition-all duration-300 flex flex-col justify-between">
      <div>
        <div className="p-8">
          <div className="flex items-center space-x-4 group cursor-pointer">
            <div className="w-12 h-12 bg-gradient-to-br from-slate-850 to-slate-950 border border-amber-500/20 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300">
              <Scissors className="w-5.5 h-5.5 text-amber-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-200 via-amber-400 to-amber-250 tracking-tight font-sans">
                SALÓN
              </h1>
              <p className="text-[10px] font-bold text-amber-500/65 uppercase tracking-[0.25em] leading-none mt-1">
                Luxe Concierge
              </p>
            </div>
          </div>
        </div>
        
        <nav className="mt-2 px-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 font-sans text-sm ${
                  isActive 
                    ? 'bg-slate-900/60 text-amber-450 font-semibold shadow-sm border-l-2 border-amber-500' 
                    : 'text-slate-400 hover:bg-slate-900/30 hover:text-slate-205'
                }`}
              >
                <div className={`p-2 rounded-xl transition-colors ${isActive ? 'bg-slate-850 text-amber-400 border border-amber-500/10' : 'bg-slate-900/30'}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="flex-1 text-left">{item.label}</span>
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-amber-500" />}
              </button>
            )
          })}
        </nav>
      </div>
      
      <div className="p-6">
        <div className="p-4 bg-slate-900/40 dark:bg-slate-900/30 rounded-2xl border border-slate-800/40 mb-4 backdrop-blur-md">
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Plan Activo</p>
          <div className="flex justify-between items-baseline mt-1">
            <p className="text-sm font-bold text-slate-200">Suscripción Luxe</p>
            <span className="text-[9px] bg-amber-500/10 border border-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full font-bold">Premium</span>
          </div>
          <div className="mt-3 w-full bg-slate-850 h-1 rounded-full overflow-hidden">
            <div className="bg-gradient-to-r from-amber-500 to-amber-300 h-full w-4/5 rounded-full" />
          </div>
        </div>
        <button 
          onClick={onLogout}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 font-medium text-sm"
        >
          <div className="p-2 rounded-xl bg-slate-900/30">
            <LogOut className="w-4 h-4" />
          </div>
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  )
}