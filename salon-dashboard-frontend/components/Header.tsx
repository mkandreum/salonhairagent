'use client'

import { Search, Bell, User, ChevronDown, Settings, LogOut } from 'lucide-react'
import { useState } from 'react'

interface HeaderProps {
  user: any
  onLogout: () => void
  onTabChange: (tab: string) => void
  onSearch: (query: string) => void
}

export default function Header({ user, onLogout, onTabChange, onSearch }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [isProfileOpen, setIsProfileOpen] = useState(false)

  return (
    <header className="h-20 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-8 flex items-center justify-between sticky top-0 z-40 transition-all duration-300">
      <div className="flex-1 max-w-xl">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-slate-600 transition-colors" />
          <input 
            type="text" 
            placeholder="Buscar citas, clientes, estilistas..." 
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              onSearch(e.target.value);
            }}
            className="w-full pl-12 pr-4 py-3 bg-slate-100 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-slate-300/50 transition-all outline-none text-sm text-slate-800 dark:text-slate-200"
          />
        </div>
      </div>
      
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => onTabChange('notifications')}
            className="p-3 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors relative"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900" />
          </button>
          <button 
            onClick={() => onTabChange('settings')}
            className="p-3 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
        
        <div className="h-8 w-px bg-slate-200 dark:bg-slate-800" />
        
        <div className="relative">
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center space-x-3 pl-2 pr-1 py-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
          >
            <div className="text-right">
              <p className="text-sm font-bold text-slate-800 dark:text-white leading-tight">{user?.name || 'Usuario'}</p>
              <p className="text-xs text-amber-600 dark:text-amber-400 font-medium leading-tight">Profesional</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-800 dark:bg-slate-700 flex items-center justify-center text-amber-400 font-bold">
              <User className="w-6 h-6" />
            </div>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xl z-50">
              <div className="p-2 space-y-1">
                <button 
                  onClick={() => { onTabChange('settings'); setIsProfileOpen(false); }}
                  className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <User className="w-4 h-4" />
                  <span>Mi Perfil</span>
                </button>
                <button 
                  onClick={() => { onTabChange('settings'); setIsProfileOpen(false); }}
                  className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  <span>Ajustes</span>
                </button>
                <div className="h-px bg-slate-100 dark:bg-slate-800 my-1" />
                <button 
                  onClick={onLogout}
                  className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}