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
  { id: 'analytics', label: 'Análisis', icon: BarChart3 },
  { id: 'triage', label: 'Auditoría IA', icon: Sparkles },
  { id: 'notifications', label: 'Notificaciones', icon: Bell },
  { id: 'settings', label: 'Ajustes', icon: Settings },
]


export default function Sidebar({ activeTab, onTabChange, onLogout }: SidebarProps) {
  return (

    <aside className="fixed left-0 top-0 h-screen w-72 bg-white dark:bg-black border-r border-slate-200 dark:border-slate-900 z-50 transition-all duration-300">
      <div className="p-8">
         <div className="flex items-center space-x-4 group cursor-pointer">
          <div className="w-12 h-12 bg-slate-950 dark:bg-zinc-950 border border-amber-500/20 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-105 group-hover:border-amber-500/40 transition-all duration-300">
            <Scissors className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">Salon</h1>
            <p className="text-[10px] font-bold text-slate-500 dark:text-amber-500/80 uppercase tracking-[0.2em]">Management</p>
          </div>
        </div>
      </div>
      
      <nav className="mt-6 px-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.id
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`nav-item w-full ${isActive ? 'nav-item-active' : ''}`}
            >
              <div className={`p-2 rounded-xl transition-colors ${isActive ? 'bg-amber-400 text-black shadow-md shadow-amber-500/10' : 'bg-slate-100 dark:bg-zinc-900'}`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="flex-1 text-left font-semibold text-sm tracking-wide">{item.label}</span>
              {isActive && <ChevronRight className="w-4 h-4 text-amber-500" />}
            </button>
          )
        })}
      </nav>
      
      <div className="absolute bottom-0 left-0 right-0 p-6">
        <div className="p-4 bg-slate-50 dark:bg-zinc-950/60 rounded-2xl border border-slate-100 dark:border-slate-900 mb-4">
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Plan Actual</p>
          <p className="text-sm font-bold text-slate-800 dark:text-white mt-0.5">Profesional</p>
          <div className="mt-3 w-full bg-slate-200 dark:bg-slate-900 h-1.5 rounded-full overflow-hidden">
            <div className="bg-amber-500 h-full w-3/4 rounded-full shadow-sm" />
          </div>
        </div>
        <button 
          onClick={onLogout}
          className="nav-item w-full hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 dark:hover:text-red-400 border border-transparent hover:border-red-500/10"
        >
          <div className="p-2 rounded-xl bg-slate-100 dark:bg-zinc-900">
            <LogOut className="w-5 h-5" />
          </div>
          <span className="font-semibold text-sm">Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  )
}