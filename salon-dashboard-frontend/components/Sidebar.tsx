'use client'

import { 
  Home, 
  Calendar, 
  Users, 
  Scissors, 
  BarChart3, 
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
  { id: 'analytics', label: 'Análisis & IA', icon: BarChart3, badge: true },
  { id: 'settings', label: 'Ajustes', icon: Settings },
]

export default function Sidebar({ activeTab, onTabChange, onLogout }: SidebarProps) {
  return (
    <aside className="fixed left-0 top-0 h-screen w-72 bg-[#090709]/60 backdrop-blur-3xl border-r border-white/[0.04] z-50 transition-all duration-300 flex flex-col justify-between shadow-2xl shadow-black/80">
      <div>
        {/* Luxe Logo Header */}
        <div className="p-8">
          <div className="flex items-center space-x-3.5 group cursor-pointer">
            <div className="w-11 h-11 bg-gradient-to-br from-[#E5C17B]/15 to-[#E5C17B]/5 border border-[#E5C17B]/20 rounded-xl flex items-center justify-center shadow-lg shadow-black/40 group-hover:border-[#E5C17B]/45 group-hover:scale-105 transition-all duration-300">
              <Scissors className="w-5 h-5 text-[#E5C17B] drop-shadow-[0_0_8px_rgba(229,193,123,0.3)]" />
            </div>
            <div>
              <h1 className="text-white font-bold text-sm tracking-[0.2em] uppercase leading-none font-sans">
                SALÓN <span className="text-[#E5C17B] font-extrabold text-[15px]">LUXE</span>
              </h1>
              <p className="text-white/30 font-mono text-[8px] uppercase tracking-[0.25em] leading-none mt-1.5 flex items-center gap-1">
                <span>CONCIERGE ACTIVO</span>
                <span className="led-pearl green pulse w-1 h-1 inline-block" />
              </p>
            </div>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="mt-2 px-4 space-y-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center space-x-3 px-4.5 py-3.5 rounded-2xl transition-all duration-300 font-semibold text-xs tracking-wider uppercase ${
                  isActive 
                    ? 'bg-gradient-to-r from-[#E5C17B]/10 to-transparent text-[#E5C17B] border-l-[3px] border-[#E5C17B]' 
                    : 'text-white/40 hover:bg-white/[0.02] hover:text-white/80'
                }`}
              >
                <div className={`transition-colors duration-300 ${isActive ? 'text-[#E5C17B]' : ''}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="flex-1 text-left pl-1">{item.label}</span>
                {item.badge && (
                  <span className="flex items-center gap-1.5 px-2 py-0.5 bg-[#C084FC]/10 border border-[#C084FC]/25 text-[#C084FC] text-[8px] font-bold tracking-widest rounded-md uppercase">
                    <span>IA</span>
                    <span className="led-pearl lavender pulse w-1 h-1 inline-block" />
                  </span>
                )}
                {isActive && !item.badge && <ChevronRight className="w-3.5 h-3.5 text-[#E5C17B]" />}
              </button>
            )
          })}
        </nav>
      </div>
      
      {/* Premium Plan Card and Logout */}
      <div className="p-6">
        <div className="p-4.5 bg-gradient-to-br from-white/[0.02] to-transparent rounded-2xl border border-white/[0.04] mb-4 shadow-xl shadow-black/30 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[#E5C17B]/5 to-transparent rounded-full blur-xl pointer-events-none" />
          <p className="text-white/20 font-mono text-[8px] uppercase tracking-widest font-bold">Estado del Salón</p>
          <div className="flex justify-between items-baseline mt-1.5">
            <p className="text-xs font-bold text-white/90">Suscripción Luxe</p>
            <span className="text-[8px] bg-gradient-to-r from-[#E5C17B] to-[#F2D8A7] text-[#090709] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider shadow-sm">
              Luxe
            </span>
          </div>
          <div className="mt-4 w-full bg-white/[0.04] h-1 rounded-full overflow-hidden border border-white/[0.02]">
            <div className="bg-gradient-to-r from-[#E5C17B] via-[#F2D8A7] to-[#C5A059] h-full w-4/5 rounded-full" />
          </div>
        </div>
        
        <button 
          onClick={onLogout}
          className="w-full flex items-center space-x-3 px-4.5 py-3.5 rounded-2xl transition-all duration-300 text-white/30 hover:bg-rose-500/10 hover:text-rose-400 font-bold text-xs uppercase tracking-wider"
        >
          <div className="p-1 rounded-xl">
            <LogOut className="w-4 h-4" />
          </div>
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  )
}
