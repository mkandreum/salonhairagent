'use client'

import { Search, Bell, User, ChevronDown, Settings, LogOut, Sparkles } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import NotificationsPanel from './NotificationsPanel'
import { fetchNotifications } from '@/lib/api'

interface HeaderProps {
  user: any
  onLogout: () => void
  onTabChange: (tab: string) => void
  onSearch: (query: string) => void
}

export default function Header({ user, onLogout, onTabChange, onSearch }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const notifRef = useRef<HTMLDivElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)

  // Poll unread count
  useEffect(() => {
    const loadCount = () => {
      fetchNotifications().then((data: any) => {
        const arr = Array.isArray(data) ? data : []
        setUnreadCount(arr.filter((n: any) => !n.read).length)
      }).catch(() => {})
    }
    loadCount()
    const interval = setInterval(loadCount, 15000)
    return () => clearInterval(interval)
  }, [])

  // Click outside to close dropdowns
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotificationsOpen(false)
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const toggleNotifications = () => {
    setIsNotificationsOpen(!isNotificationsOpen)
    setIsProfileOpen(false)
  }

  const toggleProfile = () => {
    setIsProfileOpen(!isProfileOpen)
    setIsNotificationsOpen(false)
  }

  return (
    <header className="h-16 sm:h-20 bg-[#090709]/50 backdrop-blur-2xl border-b border-white/[0.04] px-4 sm:px-8 flex items-center justify-between sticky top-0 z-40 transition-all duration-300 shadow-md">
      
      {/* Sleek Search Bar */}
      <div className="flex-1 max-w-xs sm:max-w-md md:max-w-lg mr-4">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-[#E5C17B] transition-colors duration-300 stroke-[2.2]" />
          <input 
            type="text" 
            placeholder="Buscar en el salón..." 
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              onSearch(e.target.value);
            }}
            className="input-premium w-full pl-11 pr-4 py-2 sm:py-2.5 rounded-full focus:border-[#E5C17B]/40 focus:shadow-[0_0_15px_rgba(229,193,123,0.03)]"
          />
        </div>
      </div>
      
      {/* Right Actions */}
      <div className="flex items-center space-x-2 sm:space-x-3.5">
        {/* Notifications Bell */}
        <div className="relative" ref={notifRef}>
          <button 
            onClick={toggleNotifications}
            className={`p-2.5 rounded-xl transition-all duration-300 relative border ${
              isNotificationsOpen 
                ? 'bg-[#E5C17B]/10 text-[#E5C17B] border-[#E5C17B]/25' 
                : 'text-white/45 hover:bg-white/[0.02] border-transparent hover:text-white/80'
            }`}
            title="Notificaciones"
          >
            <Bell className="w-4.5 h-4.5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-gradient-to-r from-[#E5C17B] to-[#F2D8A7] text-[#090709] text-[8px] font-extrabold rounded-full flex items-center justify-center border border-[#090709] animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
          <NotificationsPanel isOpen={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} />
        </div>

        {/* Settings Shortcut */}
        <button 
          onClick={() => onTabChange('settings')}
          className="p-2.5 text-white/45 hover:bg-white/[0.02] rounded-xl transition-all duration-300 border border-transparent hover:text-white/80"
          title="Ajustes"
        >
          <Settings className="w-4.5 h-4.5" />
        </button>
        
        <div className="hidden sm:block w-[1px] h-6 bg-white/[0.05]" />
        
        {/* User profile button */}
        <div className="relative" ref={profileRef}>
          <button 
            onClick={toggleProfile}
            className="flex items-center space-x-2 sm:space-x-3.5 pl-2 pr-1.5 py-1.5 hover:bg-white/[0.02] rounded-xl transition-all duration-300 border border-transparent group"
          >
            <div className="text-right hidden md:block">
              <p className="text-xs font-bold text-white/90 leading-none tracking-tight group-hover:text-white transition-colors">{user?.name || 'Usuario'}</p>
              <p className="text-[#E5C17B] font-mono text-[8px] uppercase tracking-widest leading-none mt-1.5 font-bold flex items-center justify-end gap-1">
                <span>ESTILISTA PRO</span>
                <span className="led-pearl gold w-1 h-1 inline-block" />
              </p>
            </div>
            
            <div className="w-8.5 h-8.5 sm:w-9.5 sm:h-9.5 rounded-xl bg-gradient-to-br from-[#E5C17B]/12 to-[#E5C17B]/3 border border-[#E5C17B]/20 flex items-center justify-center text-[#E5C17B] font-bold transition-all duration-300 shadow-sm group-hover:border-[#E5C17B]/40 group-hover:scale-105">
              <User className="w-4 h-4" />
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-white/25 group-hover:text-white/40 transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Profile Dropdown */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-52 app-card-overlay overflow-hidden shadow-2xl z-50 animate-fadeUp">
              <div className="p-2 space-y-1">
                <button 
                  onClick={() => { onTabChange('settings'); setIsProfileOpen(false); }}
                  className="w-full flex items-center space-x-2.5 px-3.5 py-3 text-xs text-white/70 hover:bg-white/[0.02] rounded-xl transition-all duration-300"
                >
                  <User className="w-4 h-4 text-[#E5C17B]/70" />
                  <span className="font-semibold">Mi Perfil</span>
                </button>
                <button 
                  onClick={() => { onTabChange('settings'); setIsProfileOpen(false); }}
                  className="w-full flex items-center space-x-2.5 px-3.5 py-3 text-xs text-white/70 hover:bg-white/[0.02] rounded-xl transition-all duration-300"
                >
                  <Settings className="w-4 h-4 text-[#E5C17B]/70" />
                  <span className="font-semibold">Ajustes del Salón</span>
                </button>
                <div className="h-[1px] bg-white/[0.04] my-1" />
                <button 
                  onClick={onLogout}
                  className="w-full flex items-center space-x-2.5 px-3.5 py-3 text-xs text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all duration-300"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="font-bold">Cerrar Sesión</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
