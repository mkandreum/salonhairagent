'use client'

import { Search, Bell, User, ChevronDown, HelpCircle, Settings } from 'lucide-react'
import { useState } from 'react'

export default function Header() {
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <header className="h-20 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-8 flex items-center justify-between sticky top-0 z-40 transition-all duration-300">
      <div className="flex-1 max-w-xl">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Buscar citas, clientes, estilistas..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-100 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none text-sm text-slate-800 dark:text-slate-200"
          />
        </div>
      </div>
      
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-2">
          <button className="p-3 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors relative group">
            <Bell className="w-5 h-5 group-hover:shake" />
            <span className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900" />
          </button>
          <button className="p-3 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
            <HelpCircle className="w-5 h-5" />
          </button>
          <button className="p-3 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
            <Settings className="w-5 h-5" />
          </button>
        </div>
        
        <div className="h-8 w-px bg-slate-200 dark:bg-slate-800" />
        
        <button className="flex items-center space-x-3 pl-2 pr-1 py-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all group">
          <div className="text-right">
            <p className="text-sm font-bold text-slate-800 dark:text-white leading-tight">Alex Johnson</p>
            <p className="text-xs text-indigo-500 font-medium leading-tight uppercase tracking-wider">Premium Plan</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <User className="w-6 h-6" />
          </div>
          <ChevronDown className="w-4 h-4 text-slate-400 group-hover:translate-y-0.5 transition-transform" />
        </button>
      </div>
    </header>
  )
}