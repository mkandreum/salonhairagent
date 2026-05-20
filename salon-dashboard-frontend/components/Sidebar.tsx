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
    <aside className="fixed left-0 top-0 h-screen w-72 bg-[#0a080a] border-r border-white/5 z-50 transition-all duration-300 flex flex-col justify-between">
      <div>
        <div className="p-8">
          <div className="flex items-center space-x-4 group cursor-pointer">
            <div className="w-12 h-12 bg-[#D4A843]/10 border border-[#D4A843]/20 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300">
              <Scissors className="w-6 h-6 text-[#D4A843]" />
            </div>
            <div>
              <h1 className="text-white font-bold text-lg tracking-tight">
                SALÓN
              </h1>
              <p className="text-white/40 font-mono text-[10px] uppercase tracking-wider leading-none mt-1">
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
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all duration-200 font-bold text-sm ${
                  isActive 
                    ? 'bg-[#D4A843]/10 text-[#D4A843] border-l-2 border-[#D4A843]' 
                    : 'text-white/40 hover:bg-white/[0.04] hover:text-white'
                }`}
              >
                <div className={`p-2 rounded-xl transition-colors ${isActive ? 'text-[#D4A843]' : ''}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="flex-1 text-left">{item.label}</span>
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-[#D4A843]" />}
              </button>
            )
          })}
        </nav>
      </div>
      
      <div className="p-6">
        <div className="p-4 bg-white/[0.03] rounded-2xl border border-white/5 mb-4 backdrop-blur-md shadow-lg shadow-black/40 animate-pulse-surface">
          <p className="text-white/30 font-mono text-[10px] uppercase tracking-wider">Plan Activo</p>
          <div className="flex justify-between items-baseline mt-1">
            <p className="text-xs sm:text-sm font-extrabold text-white/80">Suscripción Luxe</p>
            <span className="text-[9px] bg-[#D4A843]/10 border border-[#D4A843]/20 text-[#D4A843] px-2 py-0.5 rounded-full font-bold">Premium</span>
          </div>
          <div className="mt-3 w-full bg-white/[0.05] h-1.5 rounded-full overflow-hidden border border-white/5">
            <div className="bg-gradient-to-r from-[#D4A843] via-[#F0CC70] to-[#B8882A] h-full w-4/5 rounded-full" />
          </div>
        </div>
        <button 
          onClick={onLogout}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all duration-200 text-white/40 hover:bg-rose-500/10 hover:text-rose-400 font-bold text-sm"
        >
          <div className="p-2 rounded-xl">
            <LogOut className="w-4 h-4" />
          </div>
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  )
}
