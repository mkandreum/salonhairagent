'use client'

import { 
  Home, 
  Calendar, 
  Users, 
  Scissors, 
  BarChart3, 
  Settings,
  LogOut,
  ChevronRight
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
  { id: 'settings', label: 'Ajustes', icon: Settings },
]


export default function Sidebar({ activeTab, onTabChange, onLogout }: SidebarProps) {
  return (
    <aside className="fixed left-0 top-0 h-screen w-72 bg-[#080b11] border-r border-slate-800/60 dark:border-amber-500/10 z-50 transition-all duration-300 flex flex-col justify-between">
      <div>
        <div className="p-8">
          <div className="flex items-center space-x-4 group cursor-pointer">
            <div className="w-12 h-12 bg-gradient-to-br from-slate-800 to-slate-950 border border-amber-500/20 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300">
              <Scissors className="w-6 h-6 text-amber-400" />
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
                    ? 'bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-l-2 border-amber-500 text-amber-400 font-semibold shadow-[inset_4px_0_12px_rgba(212,175,55,0.03)]' 
                    : 'text-slate-400 hover:bg-slate-900/30 hover:text-slate-200'
                }`}
              >
                <div className={`p-2 rounded-xl transition-colors ${isActive ? 'bg-slate-900 text-amber-400 border border-amber-500/20 shadow-[0_0_8px_rgba(212,175,55,0.15)]' : 'bg-slate-900/30'}`}>
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
        <div className="p-4 bg-slate-950/60 rounded-2xl border border-amber-500/10 mb-4 backdrop-blur-md shadow-lg shadow-black/40 animate-pulse-surface">
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Plan Activo</p>
          <div className="flex justify-between items-baseline mt-1">
            <p className="text-xs sm:text-sm font-extrabold text-slate-200">Suscripción Luxe</p>
            <span className="text-[9px] bg-gradient-to-r from-amber-500/10 to-amber-600/10 border border-amber-500/30 text-amber-400 px-2 py-0.5 rounded-full font-bold shadow-[0_0_8px_rgba(212,175,55,0.1)]">Premium</span>
          </div>
          <div className="mt-3 w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-800/40">
            <div className="bg-gradient-to-r from-amber-600 via-amber-400 to-amber-300 h-full w-4/5 rounded-full shadow-[0_0_6px_rgba(212,175,55,0.4)]" />
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