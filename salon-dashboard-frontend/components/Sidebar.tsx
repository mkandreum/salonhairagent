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

    <aside className="fixed left-0 top-0 h-screen w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 z-50 transition-all duration-300">
      <div className="p-8">
        <div className="flex items-center space-x-4 group cursor-pointer">
          <div className="w-12 h-12 bg-gradient-to-br from-slate-800 to-slate-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
            <Scissors className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">Salon</h1>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-widest">Management</p>
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
              <div className={`p-2 rounded-xl transition-colors ${isActive ? 'bg-slate-800 text-amber-400' : 'bg-slate-100 dark:bg-slate-800'}`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="flex-1 text-left font-medium">{item.label}</span>
              {isActive && <ChevronRight className="w-4 h-4 text-amber-500" />}
            </button>
          )
        })}
      </nav>
      
      <div className="absolute bottom-0 left-0 right-0 p-6">
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700 mb-4">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Plan Actual</p>
          <p className="text-sm font-bold text-slate-800 dark:text-white">Profesional</p>
          <div className="mt-2 w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
            <div className="bg-amber-500 h-full w-3/4 rounded-full" />
          </div>
        </div>
        <button 
          onClick={onLogout}
          className="nav-item w-full hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/10 dark:hover:text-red-400"
        >
          <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800">
            <LogOut className="w-5 h-5" />
          </div>
          <span className="font-medium">Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  )
}