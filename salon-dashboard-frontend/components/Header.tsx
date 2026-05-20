'use client'

import { Search, Bell, User, ChevronDown, Settings, LogOut } from 'lucide-react'
import { useState } from 'react'

interface HeaderProps {
  user: any
  onLogout: () => void
  onTabChange: (tab: string) => void
  onSearch: (query: string) => void
  onNotifToggle: () => void
}

export default function Header({ user, onLogout, onTabChange, onSearch, onNotifToggle }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [isProfileOpen, setIsProfileOpen] = useState(false)

  return (
    <header className="h-20 bg-white/80 dark:bg-[#080b11]/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-amber-500/10 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-40 transition-all duration-300">
      <div className="flex-1 max-w-xs sm:max-w-md md:max-w-lg mr-4">
        <div className="relative group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-450 group-focus-within:text-amber-550 transition-colors" />
          <input 
            type="text" 
            placeholder="Buscar..." 
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              onSearch(e.target.value);
            }}
            className="w-full pl-10 pr-4 py-2 sm:py-2.5 bg-slate-100/60 dark:bg-slate-900/60 border border-slate-200/40 dark:border-slate-800/80 rounded-full focus:ring-1 focus:ring-amber-500/30 focus:border-amber-500/40 transition-all outline-none text-xs sm:text-sm text-slate-800 dark:text-slate-205 placeholder:text-slate-450"
          />
        </div>
      </div>
      
      <div className="flex items-center space-x-2 sm:space-x-5">
        <div className="flex items-center space-x-1 sm:space-x-2">
          <button 
            onClick={onNotifToggle}
            className="p-2 sm:p-2.5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors relative"
            title="Notificaciones"
          >
            <Bell className="w-4.5 h-4.5" />
          </button>
          <button 
            onClick={() => onTabChange('settings')}
            className="p-2 sm:p-2.5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
            title="Ajustes"
          >
            <Settings className="w-4.5 h-4.5" />
          </button>
        </div>
        
        <div className="hidden sm:block h-6 w-px bg-slate-200 dark:bg-slate-800" />
        
        <div className="relative">
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center space-x-2 sm:space-x-3 pl-1.5 pr-1 py-1 hover:bg-slate-100 dark:hover:bg-slate-800/60 rounded-full transition-all border border-transparent dark:hover:border-slate-800"
          >
            <div className="text-right hidden md:block">
              <p className="text-xs sm:text-sm font-bold text-slate-850 dark:text-slate-100 leading-none tracking-tight">{user?.name || 'Usuario'}</p>
              <p className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold uppercase tracking-wider leading-none mt-1">Profesional</p>
            </div>
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-slate-800 to-slate-950 border border-amber-500/20 flex items-center justify-center text-amber-400 font-bold shadow-md">
              <User className="w-4.5 h-4.5" />
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-2xl z-50 animate-fade-float-in">
              <div className="p-2 space-y-1">
                <button 
                  onClick={() => { onTabChange('settings'); setIsProfileOpen(false); }}
                  className="w-full flex items-center space-x-2.5 px-3 py-2 text-xs sm:text-sm text-slate-650 dark:text-slate-300 hover:bg-slate-100/60 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  <User className="w-4 h-4 text-amber-500/70" />
                  <span>Mi Perfil</span>
                </button>
                <button 
                  onClick={() => { onTabChange('settings'); setIsProfileOpen(false); }}
                  className="w-full flex items-center space-x-2.5 px-3 py-2 text-xs sm:text-sm text-slate-650 dark:text-slate-300 hover:bg-slate-100/60 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  <Settings className="w-4 h-4 text-amber-500/70" />
                  <span>Ajustes</span>
                </button>
                <div className="h-px bg-slate-100 dark:bg-slate-800 my-1" />
                <button 
                  onClick={onLogout}
                  className="w-full flex items-center space-x-2.5 px-3 py-2 text-xs sm:text-sm text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-550/10 rounded-xl transition-colors"
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