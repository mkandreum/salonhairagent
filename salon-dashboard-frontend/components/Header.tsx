'use client'

import { Search, Bell, User, ChevronDown, Settings, LogOut } from 'lucide-react'
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
    <header className="h-16 sm:h-20 bg-[#080608]/80 backdrop-blur-xl border-b border-white/5 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-40 transition-all duration-300">
      <div className="flex-1 max-w-xs sm:max-w-md md:max-w-lg mr-4">
        <div className="relative group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-[#D4A843] transition-colors duration-200" />
          <input 
            type="text" 
            placeholder="Buscar..." 
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              onSearch(e.target.value);
            }}
            className="input-premium w-full pl-10 pr-4 py-2 sm:py-2.5 rounded-full focus:border-[#D4A843]/50"
          />
        </div>
      </div>
      
      <div className="flex items-center space-x-1 sm:space-x-3">
        {/* Notifications Bell */}
        <div className="relative" ref={notifRef}>
          <button 
            onClick={toggleNotifications}
            className={`p-2 sm:p-2.5 rounded-xl transition-all duration-200 relative ${
              isNotificationsOpen 
                ? 'bg-[#D4A843]/10 text-[#D4A843] border border-[#D4A843]/20' 
                : 'text-white/40 hover:bg-white/[0.04] border border-transparent'
            }`}
            title="Notificaciones"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-[#D4A843] text-white text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-[#080608] animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
          <NotificationsPanel isOpen={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} />
        </div>

        {/* Settings */}
        <button 
          onClick={() => onTabChange('settings')}
          className="p-2 sm:p-2.5 text-white/40 hover:bg-white/[0.04] rounded-xl transition-all duration-200 border border-transparent"
          title="Ajustes"
        >
          <Settings className="w-5 h-5" />
        </button>
        
        <div className="hidden sm:block w-px h-6 bg-white/5" />
        
        {/* Profile */}
        <div className="relative" ref={profileRef}>
          <button 
            onClick={toggleProfile}
            className="flex items-center space-x-2 sm:space-x-3 pl-1.5 pr-1 py-1 hover:bg-white/[0.04] rounded-xl transition-all duration-200 border border-transparent"
          >
            <div className="text-right hidden md:block">
              <p className="text-xs sm:text-sm font-bold text-white leading-none tracking-tight">{user?.name || 'Usuario'}</p>
              <p className="text-[#D4A843] font-mono text-[10px] uppercase tracking-wider leading-none mt-1">Profesional</p>
            </div>
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#D4A843]/10 border-2 border-[#D4A843]/40 flex items-center justify-center text-[#D4A843] font-bold transition-all duration-300">
              <User className="w-4 h-4" />
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-white/30 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-48 app-card border border-white/10 backdrop-blur-xl overflow-hidden shadow-2xl z-50 animate-fade-float-in">
              <div className="p-2 space-y-1">
                <button 
                  onClick={() => { onTabChange('settings'); setIsProfileOpen(false); }}
                  className="w-full flex items-center space-x-2.5 px-3 py-2.5 text-xs sm:text-sm text-white/70 hover:bg-white/[0.04] rounded-xl transition-all duration-200"
                >
                  <User className="w-4 h-4 text-[#D4A843]/70" />
                  <span>Mi Perfil</span>
                </button>
                <button 
                  onClick={() => { onTabChange('settings'); setIsProfileOpen(false); }}
                  className="w-full flex items-center space-x-2.5 px-3 py-2.5 text-xs sm:text-sm text-white/70 hover:bg-white/[0.04] rounded-xl transition-all duration-200"
                >
                  <Settings className="w-4 h-4 text-[#D4A843]/70" />
                  <span>Ajustes</span>
                </button>
                <div className="h-px bg-white/5 my-1" />
                <button 
                  onClick={onLogout}
                  className="w-full flex items-center space-x-2.5 px-3 py-2.5 text-xs sm:text-sm text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all duration-200"
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
