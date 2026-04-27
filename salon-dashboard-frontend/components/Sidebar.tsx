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
  Brain
} from 'lucide-react'


interface SidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'appointments', label: 'Appointments', icon: Calendar },
  { id: 'clients', label: 'Clients', icon: Users },
  { id: 'stylists', label: 'Stylists', icon: Scissors },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'triage', label: 'Auditoría IA', icon: Brain },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'settings', label: 'Settings', icon: Settings },
]


export default function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  return (
    <aside className="fixed left-0 top-0 h-screen w-72 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-r border-slate-200 dark:border-slate-800 z-50 transition-all duration-300">
      <div className="p-8">
        <div className="flex items-center space-x-4 group cursor-pointer">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:scale-110 transition-transform duration-300">
            <Scissors className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">SalonPro</h1>
            <p className="text-xs font-semibold text-indigo-500 uppercase tracking-widest">Premium AI</p>
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
              <div className={`p-2 rounded-lg transition-colors ${isActive ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800'}`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="flex-1 text-left font-medium">{item.label}</span>
              {isActive && <ChevronRight className="w-4 h-4" />}
            </button>
          )
        })}
      </nav>
      
      <div className="absolute bottom-0 left-0 right-0 p-6">
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700 mb-4">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Plan Actual</p>
          <p className="text-sm font-bold text-slate-800 dark:text-white">Pro Enterprise</p>
          <div className="mt-2 w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
            <div className="bg-indigo-600 h-full w-3/4 rounded-full" />
          </div>
        </div>
        <button className="nav-item w-full hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/10 dark:hover:text-red-400">
          <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
            <LogOut className="w-5 h-5" />
          </div>
          <span className="font-medium">Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  )
}